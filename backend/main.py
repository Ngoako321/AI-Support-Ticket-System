from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.ticket import Ticket
from backend.manager import TicketManager
from backend.database import (add_ticket, get_all_tickets, get_ticket, update_ticket_status as update_status_in_database, delete_ticket as delete_ticket_from_database, ticket_exists, create_table)
from collections import Counter

app = FastAPI()


# allows the frontend to communicate with API

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://violet-ai-frontend.onrender.com",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = TicketManager()

create_table()

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

@app.get("/insights")
def get_ticket_insights():

    tickets = get_all_tickets()

    total = len(tickets)

    if total == 0:
        return {
            "total": 0,
            "high_priority": 0,
            "top_category": "None",
            "resolution_rate": 0,
            "categories": {},
            "recommendations": [
                "No tickets available for analysis yet."
            ]           
        }

    # count ticket priorities

    high_priority = sum(
        1 for ticket in tickets
        if ticket[4] == "High"
    )

    # count ticket statuses

    resolved = sum(
        1 for ticket in  tickets
        if ticket[5] == "Resolved"
    )

    resolution_rate = round((resolved / total) * 100,1 )

    # analyse ticket categories

    category_counts = Counter(
        ticket[3] for ticket in tickets
    )

    top_category = category_counts.most_common(1)[0][0]

    # generate recommendations

    recommendations = []

    if high_priority > 0:
        recommendations.append(
            f"You have {high_priority} high-priority ticket(s). "
            "Prioritise these requests for faster support."
        )

    if resolution_rate < 50:
        recommendations.append(
            "Your resolution rate is below 50%."
            "Review unresolved tickets to improve customer satisfaction."
        )

    if category_counts[top_category] > 1:
        recommendations.append(
            f"{top_category} is your most common ticket category. "
            "Investigate recurring issues in this area."
        )

    if not recommendations:
        recommendations.append(
            "Support performance looks good. Continue monitoring incoming tickets."
        )

    return {
        "total": total,
        "high_priority": high_priority,
        "top_category": top_category,
        "resolution_rate": resolution_rate,
        "categories": dict(category_counts),
        "recommendations":recommendations
    }

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

