const API_BASE_URL = "https://violet-ai-backend.onrender.com";

// dash elements

const ticketTableBody = document.getElementById("ticket-table-body");
const apiStatus = document.getElementById("api-status");
const ticketCount = document.getElementById("ticket-count");
const statTotal = document.getElementById("stat-total");
const statOpen = document.getElementById("stat-open");
const statProgress = document.getElementById("stat-progress");
const statResolved = document.getElementById("stat-resolved");
const openModalButton = document.getElementById("open-ticket-modal");

// Ai insights element
const insightHigh = document.getElementById("insight-high");
const insightCategory = document.getElementById("insight-category");
const insightResolution = document.getElementById("insight-resolution");
const insightTotal = document.getElementById("insight-total");
const categoryAnalysis = document.getElementById("category-analysis");
const recommendationsContainer = document.getElementById("ai-recommendations");

let tickets = []

// API status display

function setApiStatus(connected, message) {
    if (!apiStatus) return;

    apiStatus.textContent = message;

    const statusContainer = apiStatus.parentElement;
    const dot = statusContainer?.querySelector(".status-dot");

    if (dot) {
        dot.style.backgroundColor = connected ? "#4adea1" : "#f87171";
    }
}

// escape text before inserting into html

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
    
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }) [character]);
}

// fetch tickets from the backend

async function loadTickets() {
    
    try {
        setApiStatus(false, "Connecting...");

        const response = await fetch(`${API_BASE_URL}/tickets`);

        if (!response.ok){
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();

        tickets = Array.isArray(data) ? data: data.tickets || [];

        setApiStatus(true, "API Connected");


        displayTickets();
        updateStatistics();
        await loadInsights();
    }
    catch (error) {
        console.error("Could not load tickets:", error);

        setApiStatus(false, "API Not Connected");

        ticketTableBody.innerHTML = `
        <tr>

            <td colspan="6">
                Could not load tickets. Check your backend connection.
            <td>
        <tr>
            
        `;
    }
}

//display tickets in the dashoboard table
function displayTickets() {
    if (!tickets.length) {
        ticketTableBody.innerHTML = `
            <tr>
                <td colspan="6">No tickets found. Create your first ticket!</td>
            </tr>
        `;
        return;       
    }  
    
    ticketTableBody.innerHTML = tickets.map(ticket => {
        const id  = escapeHTML(ticket.ticket_id);
        const customer = escapeHTML(ticket.customer_name);
        const category = escapeHTML(ticket.category);
        const priority = escapeHTML(ticket.priority);
        const status = escapeHTML(ticket.status);

        let nextStatus = "";

        if (ticket.status === "Open") {
            nextStatus = "In Progress";
        } else if (ticket.status === "In Progress") {
            nextStatus = "Resolved";
        }

        const statusAction = nextStatus
            ? `<button class="ticket-action" onclick="updateTicketStatus(${Number(ticket.ticket_id)}, '${nextStatus}')">
                    Mark ${nextStatus}
               </button>`
            : `<span>Completed</span>`;

        return `
            <tr>
                <td>#${id}</td>
                <td>${customer}</td>
                <td>${category}</td>
                <td>${priority}</td>
                <td>${status}</td>
                <td>
                    ${statusAction}
                    <button class="ticket-action ticket-delete"
                        onclick="deleteTicket(${Number(ticket.ticket_id)})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    if (ticketCount) {
        ticketCount.textContent = tickets.length;
    }
}


// Update dashboard statistics
function updateStatistics() {
    const total = tickets.length;
    const open = tickets.filter(ticket => ticket.status === "Open").length;
    const progress = tickets.filter(ticket => ticket.status === "In Progress").length;
    const resolved = tickets.filter(ticket => ticket.status === "Resolved").length;

    statTotal.textContent = total;
    statOpen.textContent = open;
    statProgress.textContent = progress;
    statResolved.textContent = resolved;

    if (ticketCount) {
        ticketCount.textContent = total;
    }
}


// Create the ticket modal
function createTicketModal() {
    const overlay = document.createElement("div");

    overlay.className = "ticket-modal-overlay";

    overlay.innerHTML = `
        <div class="ticket-modal">
            <h2>Create New Ticket</h2>
            <p>Enter the customer's support request below.</p>

            <form id="create-ticket-form">

                <label for="new-ticket-id">Ticket ID</label>
                <input
                    type="number"
                    id="new-ticket-id"
                    min="1"
                    required
                    placeholder="e.g. 101"
                >

                <label for="new-customer-name">Customer Name</label>
                <input
                    type="text"
                    id="new-customer-name"
                    required
                    placeholder="Enter customer name"
                >

                <label for="new-ticket-message">Message</label>
                <textarea
                    id="new-ticket-message"
                    required
                    placeholder="Describe the customer's issue..."
                ></textarea>

                <div id="ticket-form-error" class="ticket-modal-error"></div>

                <div class="modal-actions">
                    <button type="button" class="modal-cancel">
                        Cancel
                    </button>

                    <button type="submit" class="modal-submit">
                        Create Ticket
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector(".modal-cancel").addEventListener("click", () => {
        overlay.remove();
    });

    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            overlay.remove();
        }
    });

    overlay.querySelector("#create-ticket-form")
        .addEventListener("submit", submitNewTicket);
}


// Open the modal
openModalButton.addEventListener("click", createTicketModal);


// Submit a new ticket
async function submitNewTicket(event) {
    event.preventDefault();

    const ticketId = Number(document.getElementById("new-ticket-id").value);
    const customerName = document.getElementById("new-customer-name").value.trim();
    const message = document.getElementById("new-ticket-message").value.trim();

    const errorElement = document.getElementById("ticket-form-error");
    const submitButton = event.target.querySelector(".modal-submit");

    if (!Number.isInteger(ticketId) || ticketId < 1) {
        errorElement.textContent = "Please enter a valid ticket ID.";
        return;
    }

    if (!customerName || !message) {
        errorElement.textContent = "Please complete all fields.";
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Creating...";

    errorElement.textContent = "";

    try {
        const response = await fetch(`${API_BASE_URL}/tickets`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ticket_id: ticketId,
                customer_name: customerName,
                message: message
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Could not create ticket.");
        }

        document.querySelector(".ticket-modal-overlay").remove();

        await loadTickets();

        alert("Ticket created successfully!");

    } catch (error) {
        errorElement.textContent = error.message;
        submitButton.disabled = false;
        submitButton.textContent = "Create Ticket";
    }
}


// Update ticket status
async function updateTicketStatus(ticketId, newStatus) {
    if (!confirm(`Change ticket #${ticketId} to ${newStatus}?`)) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/tickets/${ticketId}/status`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Could not update ticket.");
        }

        await loadTickets();

    } catch (error) {
        alert(error.message);
    }
}


//delete a ticket
async function deleteTicket(ticketId) {
    if (!confirm(`Are you sure you want to delete ticket #${ticketId}?`)) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/tickets/${ticketId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Could not delete ticket.");
        }

        await loadTickets();

    } catch (error) {
        alert(error.message);
    }
}


// make functions available to the table buttons
window.updateTicketStatus = updateTicketStatus;
window.deleteTicket = deleteTicket;


// load tickets when the page opens
document.addEventListener("DOMContentLoaded", () => {
    loadTickets();
    loadInsights();
});


// load ai insight from backend
async function loadInsights() {

    try {
        const response = await fetch(`${API_BASE_URL}/insights`);

        if (!response.ok) {
            throw new Error("Could not load AI Insights.");
        }

        const data = await response.json();

        // Update insight statistics
        insightHigh.textContent = data.high_priority;
        insightCategory.textContent = data.top_category;
        insightResolution.textContent = `${data.resolution_rate}%`;
        insightTotal.textContent = data.total;

        // Display category analysis
        categoryAnalysis.innerHTML = "";

        Object.entries(data.categories).forEach(([category, count]) => {

            const percentage = data.total > 0
                ? (count / data.total) * 100
                : 0;

            const categoryItem = document.createElement("div");
            categoryItem.className = "category-item";

            categoryItem.innerHTML = `
                <div class="category-info">
                    <strong>${escapeHTML(category)}</strong>
                    <span>${count} tickets</span>
                </div>

                <div class="category-bar">
                    <div class="category-bar-fill"
                         style="--bar-width: ${percentage}%;">
                    </div>
                </div>
            `;

            categoryAnalysis.appendChild(categoryItem);
        });

        // Display recommendations
        recommendationsContainer.innerHTML = "";

        data.recommendations.forEach(recommendation => {

            const recommendationCard = document.createElement("div");
            recommendationCard.className = "recommendation-card";

            recommendationCard.innerHTML = `
                <i class="fa-solid fa-lightbulb"></i>
                <p></p>
            `;

            recommendationCard.querySelector("p").textContent = recommendation;

            recommendationsContainer.appendChild(recommendationCard);
        });

    } catch (error) {
        console.error("Could not load AI Insights:", error);

        categoryAnalysis.textContent = "Unable to load category analysis.";
        recommendationsContainer.textContent = "Unable to load recommendations.";
    }
}

// Refresh AI Insights
const refreshInsightsButton = document.getElementById("refresh-insights");

if (refreshInsightsButton) {
    refreshInsightsButton.addEventListener("click", loadInsights);
}


// Dashboard navigation

const overviewSection = document.getElementById("overview");
const insightsSection = document.getElementById("ai-insights");

const overviewNav = document.getElementById("overview-nav-link");
const ticketsNav = document.getElementById("tickets-nav-link");
const insightsNav = document.getElementById("insights-nav-link");

const breadcrumb = document.querySelector(".breadcrumb");


function showSection(section, activeLink, pageName) {

    //hide all dashboard sections
    overviewSection.classList.add("is-hidden");
    insightsSection.classList.add("is-hidden");

    // display selected section
    section.classList.remove("is-hidden");

    //remove active navigation styling
    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
    });

    //highlight selected navigation link
    activeLink.classList.add("active");

    // update breadcrumb
    breadcrumb.textContent = `Workspace / ${pageName}`;
}


//overview navigation
overviewNav.addEventListener("click", event => {
    event.preventDefault();

    showSection(overviewSection, overviewNav, "Overview");
});


// all tickets navigation
ticketsNav.addEventListener("click", event => {
    event.preventDefault();

    showSection(overviewSection, ticketsNav, "All Tickets");

    document.querySelector(".table-container").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});


// 
insightsNav.addEventListener("click", event => {
    event.preventDefault();

    showSection(insightsSection, insightsNav, "AI Insights");

    loadInsights();
});