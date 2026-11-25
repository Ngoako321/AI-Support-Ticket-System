from fastapi.testclient import TestClient
# this prevents tests from connecting to the real database
import backend.database as databse

databse.create_table = lambda: None

#import the API after replacing creatr_table
from backend import main


client = TestClient(main.app)


def test_home_endpoint():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "message": "AI Support Ticket System API is running!"
    }

def test_get_all_tickets(monkeypatch):
    # Simulate tickets returned by the database
    sample_tickets = [
        (101, "John", "I was charged twice", "Payments", "High", "Open"),
        (102, "Mary", "I forgot my password", "Account", "Medium", "Open")
    ]

    monkeypatch.setattr(
        main,
        "get_all_tickets",
        lambda: sample_tickets
    )

    response = client.get("/tickets")

    assert response.status_code == 200
    assert len(response.json()) == 2
    assert response.json()[0]["customer_name"] == "John"


def test_create_ticket(monkeypatch):
    # Simulate a ticket ID that does not already exist
    monkeypatch.setattr(
        main,
        "ticket_exists",
        lambda ticket_id: False
    )

    # Prevent the database from saving anything
    monkeypatch.setattr(
        main,
        "add_ticket",
        lambda ticket: None
    )

    response = client.post(
        "/tickets",
        json={
            "ticket_id": 103,
            "customer_name": "Sarah",
            "message": "I was charged twice"
        }
    )

    assert response.status_code == 201
    assert response.json()["ticket_id"] == 103
    assert response.json()["category"] == "Payments"
    assert response.json()["priority"] == "High"
    assert response.json()["status"] == "Open"



def test_duplicate_ticket(monkeypatch):
    monkeypatch.setattr(
        main,
        "ticket_exists",
        lambda ticket_id: True
    )

    response = client.post(
        "/tickets",
        json={
            "ticket_id": 101,
            "customer_name": "John",
            "message": "I was charged twice"
        }
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Ticket ID already exists"


def test_get_single_ticket(monkeypatch):
    sample_ticket = (
        101, "John", "I was charged twice",
        "Payments", "High", "Open"
    )

    monkeypatch.setattr(
        main,
        "get_ticket",
        lambda ticket_id: sample_ticket
    )

    response = client.get("/tickets/101")

    assert response.status_code == 200
    assert response.json()["ticket_id"] == 101
    assert response.json()["customer_name"] == "John"


def test_get_missing_ticket(monkeypatch):
    monkeypatch.setattr(
        main,
        "get_ticket",
        lambda ticket_id: None
    )

    response = client.get("/tickets/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Ticket not found"


def test_update_ticket_status(monkeypatch):
    sample_ticket = (
        101, "John", "I was charged twice",
        "Payments", "High", "Open"
    )

    updated_status = []

    monkeypatch.setattr(
        main,
        "get_ticket",
        lambda ticket_id: sample_ticket
    )

    monkeypatch.setattr(
        main,
        "update_status_in_database",
        lambda ticket_id, status: updated_status.append(status)
    )

    response = client.put(
        "/tickets/101/status",
        json={"status": "In Progress"}
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Status updated"
    assert updated_status == ["In Progress"]


def test_invalid_ticket_status_update(monkeypatch):
    sample_ticket = (
        101, "John", "I was charged twice",
        "Payments", "High", "Open"
    )

    monkeypatch.setattr(
        main,
        "get_ticket",
        lambda ticket_id: sample_ticket
    )

    response = client.put(
        "/tickets/101/status",
        json={"status": "Resolved"}
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid status change"


def test_delete_ticket(monkeypatch):
    monkeypatch.setattr(
        main,
        "delete_ticket_from_database",
        lambda ticket_id: 1
    )

    response = client.delete("/tickets/101")

    assert response.status_code == 200
    assert response.json()["message"] == "Ticket deleted successfully"


def test_delete_missing_ticket(monkeypatch):
    monkeypatch.setattr(
        main,
        "delete_ticket_from_database",
        lambda ticket_id: 0
    )

    response = client.delete("/tickets/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Ticket not found"


def test_ticket_insights(monkeypatch):
    sample_tickets = [
        (101, "John", "I was charged twice", "Payments", "High", "Open"),
        (102, "Mary", "I was charged again", "Payments", "High", "Resolved"),
        (103, "Peter", "I forgot my password", "Account", "Medium", "Resolved")
    ]

    monkeypatch.setattr(
        main,
        "get_all_tickets",
        lambda: sample_tickets
    )

    response = client.get("/insights")

    data = response.json()

    assert response.status_code == 200
    assert data["total"] == 3
    assert data["high_priority"] == 2
    assert data["top_category"] == "Payments"
    assert data["resolution_rate"] == 66.7
    assert data["categories"]["Payments"] == 2
