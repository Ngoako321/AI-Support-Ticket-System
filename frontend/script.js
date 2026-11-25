const API_BASE_URL = "https://violet-ai-backend.onrender.com" ;

// dash elements

const ticketTableBody = document.getElementById("ticket-table-body");
const apiStatus = document.getElementById("api-status");
const ticketCount = document.getElementById("ticket-count");

const statTotal = document.getElementById("stat-total");
const statOpen = document.getElementById("stat-open");
const statProgress = document.getElementById("stat-progress");
const statResolved = document.getElementById("stat-resolved");

const openModalButton = document.getElementById("open-ticket-modal");

let tickets = []

// API status display

function setApiStatus(connected, message) {
    if (!apiStatus) return;

    apiStatus.textContent = message;

    const statusContainer = apiStatus.parentElement;
    const dot = statusContainer?.querySelector(".status-dot");

    if (dot) {
        dot.computedStyleMap.backgroundColor = connected ? "#4adea1" : "#f87171";
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
document.addEventListener("DOMContentLoaded", loadTickets);
