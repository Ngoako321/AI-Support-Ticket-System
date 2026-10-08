# AI Support Ticket System

A Python-based support ticket management system that automatically analyzes customer messages to determine ticket category and priority.

## Features

- Create support tickets
- Automatically categorize tickets
- Automatically determine ticket priority
- Track ticket status
- View all tickets
- View individual tickets
- Update ticket status
- Delete tickets
- Store ticket data using SQLite
- REST API using FastAPI

## Technologies

- Python
- FastAPI
- SQLite
- Pydantic
- Uvicorn
- Git & GitHub

## How It Works

Customer submits a support message through the API.

The system analyzes the message and determines:

- Category: Payments, Account, Technical, or Other
- Priority: High, Medium, or Low

The ticket is then stored in the SQLite database.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/tickets` | Create a ticket |
| GET | `/tickets` | Get all tickets |
| GET | `/tickets/{ticket_id}` | Get a ticket |
| PUT | `/tickets/{ticket_id}/status` | Update ticket status |
| DELETE | `/tickets/{ticket_id}` | Delete a ticket |

## Running the Project

Install dependencies:

```bash
pip install -r requirements.txt