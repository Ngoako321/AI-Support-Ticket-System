
"use strict";

/* VIOLET AI - SUPPORT TICKET DASHBOARD */

const API_BASE_URL = "https://ai-support-ticket-system-production.up.railway.app";

const state = {
  tickets: [],
  loading: false,
  error: "",
  toastTimer: null
};

const elements = {
  table: document.getElementById("ticket-table-body"),
  results: document.getElementById("ticket-results"),
  search: document.getElementById("search-input"),
  statusFilter: document.getElementById("status-filter"),
  priorityFilter: document.getElementById("priority-filter"),
  total: document.getElementById("stat-total"),
  open: document.getElementById("stat-open"),
  progress: document.getElementById("stat-progress"),
  resolved: document.getElementById("stat-resolved"),
  sidebarCount: document.getElementById("sidebar-ticket-count"),
  notice: document.getElementById("notice"),
  toast: document.getElementById("toast"),
  modal: document.getElementById("ticket-modal"),
  form: document.getElementById("ticket-form"),
  customerName: document.getElementById("customer-name"),
  message: document.getElementById("ticket-message"),
  submitButton: document.getElementById("submit-ticket"),
  modalTitle: document.getElementById("modal-title"),
  refreshButton: document.getElementById("refresh-tickets"),
  lastUpdated: document.getElementById("last-updated"),
  priorityInsights: document.getElementById("priority-insights"),
  categoryInsights: document.getElementById("category-insights"),
  recommendation: document.getElementById("ai-recommendation")
};

// Start the dashboard.
document.addEventListener("DOMContentLoaded", () => {
  loadTickets();

  elements.search.addEventListener("input", renderTickets);
  elements.statusFilter.addEventListener("change", renderTickets);
  elements.priorityFilter.addEventListener("change", renderTickets);
  elements.refreshButton.addEventListener("click", loadTickets);

  document.getElementById("open-create-modal")
    .addEventListener("click", openCreateModal);

  document.getElementById("close-modal")
    .addEventListener("click", closeModal);

  document.getElementById("cancel-modal")
    .addEventListener("click", closeModal);

  elements.modal.addEventListener("click", (event) => {
    if (event.target === elements.modal) closeModal();
  });

  elements.form.addEventListener("submit", createTicket);

  document.getElementById("mobile-menu").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-link").forEach((item) => {
        item.classList.remove("active");
      });
      link.classList.add("active");
      document.getElementById("sidebar").classList.remove("open");
    });
  });

  // Delegated click handling for buttons inside the ticket table.
  elements.table.addEventListener("click", handleTableAction);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
});

// ---------------- API HELPERS ----------------

async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers
      }
    });
  } catch (error) {
    // Browsers often hide CORS failures behind a generic fetch error.
    throw new Error(
      "Cannot access the API from this page. Check that your Railway " +
      "backend is online and that FastAPI CORS middleware allows this page's origin."
    );
  }

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const detail =
      data && typeof data === "object" && data.detail
        ? data.detail
        : `HTTP ${response.status}`;

    throw new Error(String(detail));
  }

  return data;
}

// ---------------- LOAD AND DISPLAY TICKETS ----------------

async function loadTickets() {
  if (state.loading) return;

  state.loading = true;
  elements.refreshButton.disabled = true;
  elements.table.innerHTML =
    '<tr><td colspan="6" class="table-message">Loading tickets...</td></tr>';

  try {
    const data = await apiRequest("/tickets");

    if (!Array.isArray(data)) {
      throw new Error("The API response was not a list of tickets.");
    }

    state.tickets = data;
    state.error = "";

    hideNotice();
    renderDashboard();
    elements.lastUpdated.textContent =
      `Last synced ${new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })}`;
  } catch (error) {
    state.error = error.message;
    elements.table.innerHTML = `
      <tr>
        <td colspan="6" class="table-message">
          <strong>Could not load tickets.</strong><br>
          ${escapeHTML(error.message)}<br><br>
          <button class="action-button" id="retry-load">Try again</button>
        </td>
      </tr>`;

    elements.table.querySelector("#retry-load")
      .addEventListener("click", loadTickets);

    elements.results.textContent = "Unable to load ticket data";
    elements.priorityInsights.innerHTML =
      '<p class="muted">Ticket data is unavailable.</p>';
    elements.categoryInsights.innerHTML =
      '<p class="muted">Ticket data is unavailable.</p>';
    elements.recommendation.textContent =
      "Reconnect the backend to generate ticket insights.";

    showNotice(
      "The dashboard cannot reach the API. If the URL works in your browser " +
      "but not here, check the deployed FastAPI CORS configuration.",
      "error"
    );
  } finally {
    state.loading = false;
    elements.refreshButton.disabled = false;
  }
}

function renderDashboard() {
  const tickets = state.tickets;

  elements.total.textContent = tickets.length;
  elements.open.textContent =
    tickets.filter((ticket) => ticket.status === "Open").length;
  elements.progress.textContent =
    tickets.filter((ticket) => ticket.status === "In Progress").length;
  elements.resolved.textContent =
    tickets.filter((ticket) => ticket.status === "Resolved").length;
  elements.sidebarCount.textContent = tickets.length;

  renderTickets();
  renderInsights();
}

function renderTickets() {
  const query = elements.search.value.trim().toLowerCase();
  const selectedStatus = elements.statusFilter.value;
  const selectedPriority = elements.priorityFilter.value;

  const filtered = state.tickets.filter((ticket) => {
    const searchable = [
      ticket.ticket_id,
      ticket.customer_name,
      ticket.message,
      ticket.category,
      ticket.priority,
      ticket.status
    ].join(" ").toLowerCase();

    const matchesSearch = searchable.includes(query);
    const matchesStatus =
      selectedStatus === "all" || ticket.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "all" || ticket.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (filtered.length === 0) {
    const message = state.tickets.length === 0
      ? "No tickets yet. Create your first ticket to get started."
      : "No tickets match your search or filters.";

    elements.table.innerHTML =
      `<tr><td colspan="6" class="table-message">${escapeHTML(message)}</td></tr>`;
  } else {
    elements.table.innerHTML = filtered.map((ticket) => {
      const id = Number(ticket.ticket_id);
      const status = String(ticket.status || "Unknown");
      const priority = String(ticket.priority || "Unknown");
      const category = String(ticket.category || "Uncategorized");
      const customer = String(ticket.customer_name || "Unknown customer");
      const message = String(ticket.message || "");
      const nextStatus = getNextStatus(status);

      return `
        <tr>
          <td><span class="ticket-id">#${escapeHTML(id)}</span></td>
          <td class="customer-cell">
            <span class="customer-name">${escapeHTML(customer)}</span>
            <span class="ticket-message" title="${escapeHTML(message)}">${escapeHTML(message)}</span>
          </td>
          <td><span class="category-text">${escapeHTML(category)}</span></td>
          <td><span class="priority-badge ${priorityClass(priority)}">${escapeHTML(priority)}</span></td>
          <td><span class="status-badge ${statusClass(status)}">${escapeHTML(status)}</span></td>
          <td>
            <div class="row-actions">
              <button class="action-button" data-action="advance" data-id="${escapeHTML(id)}"
                ${nextStatus ? "" : "disabled"}
                title="${nextStatus ? `Move to ${nextStatus}` : "Ticket is resolved"}">
                ${nextStatus ? escapeHTML(nextStatus === "Resolved" ? "Resolve" : "Start") : "Done"}
              </button>
              <button class="action-button delete" data-action="delete" data-id="${escapeHTML(id)}"
                aria-label="Delete ticket ${escapeHTML(id)}">Delete</button>
            </div>
          </td>
        </tr>`;
    }).join("");
  }

  elements.results.textContent =
    `Showing ${filtered.length} of ${state.tickets.length} tickets`;
}

function getNextStatus(status) {
  if (status === "Open") return "In Progress";
  if (status === "In Progress") return "Resolved";
  return null;
}

function priorityClass(priority) {
  const value = priority.toLowerCase();

  if (value === "high") return "priority-high";
  if (value === "medium") return "priority-medium";
  if (value === "low") return "priority-low";

  return "priority-unknown";
}

function statusClass(status) {
  if (status === "Open") return "status-open";
  if (status === "In Progress") return "status-in-progress";
  if (status === "Resolved") return "status-resolved";

  return "";
}

// Escape user and API text before inserting it into HTML.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

// ---------------- CREATE TICKET ----------------

function openCreateModal() {
  elements.form.reset();
  elements.modalTitle.textContent = "Create a ticket";
  elements.submitButton.textContent = "Create ticket";
  elements.modal.classList.remove("hidden");
  elements.customerName.focus();
}

function closeModal() {
  elements.modal.classList.add("hidden");
}

async function createTicket(event) {
  event.preventDefault();

  const customerName = elements.customerName.value.trim();
  const message = elements.message.value.trim();

  if (!customerName || !message) {
    showToast("Enter the customer name and issue description.", true);
    return;
  }

  // The existing FastAPI backend requires a ticket_id.
  // Generate the next ID from currently loaded tickets.
  const nextId = state.tickets.reduce((highest, ticket) => {
    return Math.max(highest, Number(ticket.ticket_id) || 0);
  }, 0) + 1;

  setFormBusy(true, "Creating...");

  try {
    await apiRequest("/tickets", {
      method: "POST",
      body: JSON.stringify({
        ticket_id: nextId,
        customer_name: customerName,
        message: message
      })
    });

    closeModal();
    showToast("Ticket created successfully.");
    await loadTickets();
  } catch (error) {
    showToast(`Could not create ticket: ${error.message}`, true);
  } finally {
    setFormBusy(false, "Create ticket");
  }
}

function setFormBusy(busy, label) {
  elements.submitButton.disabled = busy;
  elements.submitButton.textContent = label;
}

// ---------------- UPDATE AND DELETE ----------------

async function handleTableAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button || button.disabled) return;

  const ticketId = Number(button.dataset.id);
  const action = button.dataset.action;
  const ticket = state.tickets.find(
    (item) => Number(item.ticket_id) === ticketId
  );

  if (!ticket) {
    showToast("That ticket is no longer in the loaded list. Refresh and try again.", true);
    return;
  }

  if (action === "advance") {
    const nextStatus = getNextStatus(ticket.status);
    if (!nextStatus) return;

    const confirmed = window.confirm(
      `Move ticket #${ticketId} from "${ticket.status}" to "${nextStatus}"?`
    );

    if (!confirmed) return;

    button.disabled = true;

    try {
      await apiRequest(`/tickets/${ticketId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus })
      });

      showToast(`Ticket #${ticketId} updated to ${nextStatus}.`);
      await loadTickets();
    } catch (error) {
      showToast(`Could not update ticket: ${error.message}`, true);
      button.disabled = false;
    }
  }

  if (action === "delete") {
    const confirmed = window.confirm(
      `Delete ticket #${ticketId}? This cannot be undone.`
    );

    if (!confirmed) return;

    button.disabled = true;

    try {
      await apiRequest(`/tickets/${ticketId}`, {
        method: "DELETE"
      });

      showToast(`Ticket #${ticketId} deleted.`);
      await loadTickets();
    } catch (error) {
      showToast(`Could not delete ticket: ${error.message}`, true);
      button.disabled = false;
    }
  }
}

// ---------------- TICKET INSIGHTS ----------------

function renderInsights() {
  const tickets = state.tickets;
  const total = tickets.length;

  if (total === 0) {
    elements.priorityInsights.innerHTML =
      '<p class="muted">No tickets available to analyse yet.</p>';
    elements.categoryInsights.innerHTML =
      '<p class="muted">Categories will appear here when tickets are created.</p>';
    elements.recommendation.textContent =
      "Create a ticket to begin tracking customer issues and their priorities.";
    return;
  }

  const priorityCounts = { High: 0, Medium: 0, Low: 0, Unknown: 0 };
  const categoryCounts = {};

  tickets.forEach((ticket) => {
    const priority = ["High", "Medium", "Low"].includes(ticket.priority)
      ? ticket.priority
      : "Unknown";

    priorityCounts[priority]++;

    const category = String(ticket.category || "Uncategorized");
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  const priorityColors = {
    High: "#fb7185",
    Medium: "#fbbf65",
    Low: "#4adea1",
    Unknown: "#9b93af"
  };

  elements.priorityInsights.innerHTML =
    Object.entries(priorityCounts)
      .filter(([priority, count]) => count > 0)
      .map(([priority, count]) => {
        const percentage = Math.round((count / total) * 100);

        return `
          <div class="insight-row">
            <div class="insight-label">
              <span>${escapeHTML(priority)} priority</span>
              <strong>${count} <span class="muted">(${percentage}%)</span></strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill"
                style="width:${percentage}%;background:${priorityColors[priority]}"></div>
            </div>
          </div>`;
      }).join("");

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  elements.categoryInsights.innerHTML = topCategories.map(([category, count]) => `
    <div class="category-row">
      <span>${escapeHTML(category)}</span>
      <span class="category-count">${count}</span>
    </div>
  `).join("");

  const highCount = priorityCounts.High;
  const openCount = tickets.filter((ticket) => ticket.status === "Open").length;
  const inProgressCount = tickets.filter((ticket) => ticket.status === "In Progress").length;

  let recommendation;

  if (highCount > 0) {
    recommendation =
      `Review the ${highCount} high-priority ticket${highCount === 1 ? "" : "s"} first. ` +
      "Confirm their urgency and follow your team's escalation process.";
  } else if (openCount > 0) {
    recommendation =
      `There ${openCount === 1 ? "is" : "are"} ${openCount} open ticket${openCount === 1 ? "" : "s"}. ` +
      "Review the oldest requests and move tickets forward when work begins.";
  } else if (inProgressCount > 0) {
    recommendation =
      `${inProgressCount} ticket${inProgressCount === 1 ? " is" : "s are"} in progress. ` +
      "Check for blockers and confirm whether any can be resolved.";
  } else {
    recommendation =
      "All loaded tickets are resolved. Continue monitoring new requests as they arrive.";
  }

  elements.recommendation.textContent = recommendation;
}

// ---------------- NOTIFICATIONS ----------------

function showNotice(message, type = "") {
  elements.notice.textContent = message;
  elements.notice.className = `notice ${type}`.trim();
}

function hideNotice() {
  elements.notice.className = "notice hidden";
  elements.notice.textContent = "";
}

function showToast(message, isError = false) {
  clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.className = `toast${isError ? " error" : ""}`;

  state.toastTimer = setTimeout(() => {
    elements.toast.classList.add("hidden");
  }, 4500);
}
