from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ticket import Ticket
from manager import TicketManager
from database import (add_ticket, get_all_tickets, get_ticket, update_ticket_status as update_status_in_database, delete_ticket as delete_ticket_from_database, ticket_exists)

app = FastAPI()

manager = TicketManager()

class TicketRequest(BaseModel):
    ticket_id: int 
    customer_name: str
    message: str

class StatusRequest(BaseModel):
    status: str

@app.get("/")
def home():
    return {
        "message": "AI Support Ticket System API is running!"
    }

@app.post("/tickets", status_code=201)
def create_ticket(ticket_data:TicketRequest):

    if ticket_exists(ticket_data.ticket_id):
        raise HTTPException(
            status_code=400,
            detail="Ticket ID already exists"
        )

    ticket = Ticket(
        ticket_data.ticket_id,
        ticket_data.customer_name,
        ticket_data.message
    )

    manager.add_ticket(ticket)

    add_ticket(ticket)

    return {
        "message": "Ticket created successfully",
        "ticket_id": ticket.ticket_id,
        "customer_name": ticket.customer_name,
        "message_text": ticket.message,
        "category": ticket.category,
        "priority": ticket.priority,
        "status": ticket.status
    }

@app.get("/tickets")
def get_tickets():

    tickets = get_all_tickets()

    results = []

    for ticket in tickets:

        results.append({
            "ticket_id": ticket[0],
            "customer_name": ticket[1],
            "message": ticket[2],
            "category": ticket[3],
            "priority": ticket[4],
            "status": ticket[5]
        })

    return results


@app.get("/tickets/{ticket_id}")
def get_single_ticket(ticket_id: int):

    ticket = get_ticket(ticket_id)

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return {
        "ticket_id": ticket[0],
        "customer_name": ticket[1],
        "message": ticket[2],
        "category": ticket[3],
        "priority": ticket[4],
        "status": ticket[5]
    }


@app.put("/tickets/{ticket_id}/status")
def update_ticket_status(
    ticket_id: int,
    status_data: StatusRequest
):

    ticket = get_ticket(ticket_id)

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    current_status = ticket[5]
    new_status = status_data.status

    if current_status == "Open" and new_status == "In Progress":

        update_status_in_database(
            ticket_id,
            new_status
        )

        return {
            "message": "Status updated"
        }

    elif current_status == "In Progress" and new_status == "Resolved":

        update_status_in_database(
            ticket_id,
            new_status
        )

        return {
            "message": "Status updated"
        }

    else:

        raise HTTPException(
            status_code=400,
            detail="Invalid status change"
        )

@app.delete("/tickets/{ticket_id}")
def delete_ticket(ticket_id: int):

    rows_deleted = delete_ticket_from_database(ticket_id)

    if rows_deleted == 0:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return {
        "message": "Ticket deleted successfully"
    }

