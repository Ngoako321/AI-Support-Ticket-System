import sqlite3

def create_connection():
    return sqlite3.connect("tickets.db")

def add_ticket(ticket):

    connection = create_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO tickets
        (ticket_id, customer_name, message, category, priority, status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        ticket.ticket_id,
        ticket.customer_name,
        ticket.message,
        ticket.category,
        ticket.priority,
        ticket.status
    ))

    connection.commit()
    connection.close()

def get_all_tickets():

    connection = create_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM tickets")

    tickets = cursor.fetchall()

    connection.close()

    return tickets


def get_ticket(ticket_id):

    connection = create_connection()
    cursor = connection.cursor()

    cursor.execute(
        "SELECT * FROM tickets WHERE ticket_id = ?",
        (ticket_id,)
    )

    ticket = cursor.fetchone()

    connection.close()

    return ticket


def update_ticket_status(ticket_id, new_status):

    connection = create_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE tickets
        SET status = ?
        WHERE ticket_id = ?
    """,
    (new_status, ticket_id)
    )

    connection.commit()

    rows_updated = cursor.rowcount

    connection.close()

    return rows_updated

def delete_ticket(ticket_id):

    connection = create_connection()
    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM tickets WHERE ticket_id = ?", 
        (ticket_id,)
        )

    connection.commit()

    rows_deleted = cursor.rowcount

    connection.close()

    return rows_deleted

def ticket_exists(ticket_id):

    connection = create_connection()
    cursor = connection.cursor()


    cursor.execute(
        "SELECT 1 FROM tickets WHERE ticket_id = ?",
        (ticket_id,)
    )

    ticket = cursor.fetchone()

    connection.close()

    return ticket is not None