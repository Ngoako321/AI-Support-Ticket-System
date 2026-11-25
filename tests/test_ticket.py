from backend.ticket import Ticket

def test_ticket_creation():
    ticket = Ticket(
        101,
        "John",
        "I cannot log into my account"
    )

    assert ticket.ticket_id ==101
    assert ticket.customer_name == "John"
    assert ticket.message == "I cannot log into my account"


def test_default_ticket_status():
    ticket = Ticket(
        102,
        "Mary",
        "My account is not working"
       
    )

    assert ticket.status == "Open"


def test_ticket_category():
    ticket = Ticket(
        103,
        "Peter",
        "I was charged twice"
        
    )

    assert ticket.category == "Payments"

def test_high_priority_ticket():
    ticket = Ticket(
        104,
        "Sarah",
        "I was charged twice"
    )

    assert ticket.priority == "High"

def test_update_status_to_in_progress():
    ticket = Ticket(
        105,
        "James",
        "I need help"
    )

    result = ticket.update_status("In Progress")

    assert result == "Status updated"
    assert ticket.status == "In Progress"


def test_update_status_to_resolved():
    ticket = Ticket(
        106,
        "Anna",
        "I need help"
    )

    ticket.update_status("In Progress")
    result = ticket.update_status("Resolved")

    assert result == "Status updated"
    assert ticket.status == "Resolved"

def test_invalid_status_change():
    ticket = Ticket(107, "David", "I need help")

    result = ticket.update_status("Resolved")

    assert result == "Invalid status change"
    assert ticket.status == "Open"
    