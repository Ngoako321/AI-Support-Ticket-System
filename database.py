
import os
import psycopg


DATABASE_URL = os.environ.get("DATABASE_URL")


def create_connection():
    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL environment variable is not configured."
        )

    return psycopg.connect(DATABASE_URL)


def create_table():
    with create_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS tickets (
                ticket_id INTEGER PRIMARY KEY,
                customer_name TEXT NOT NULL,
                message TEXT NOT NULL,
                category TEXT NOT NULL,
                priority TEXT NOT NULL,
                status TEXT NOT NULL
            )
        """)


def add_ticket(ticket):
    with create_connection() as connection:
        connection.execute("""
            INSERT INTO tickets
            (ticket_id, customer_name, message, category, priority, status)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            ticket.ticket_id,
            ticket.customer_name,
            ticket.message,
            ticket.category,
            ticket.priority,
            ticket.status
        ))


def get_all_tickets():
    with create_connection() as connection:
        cursor = connection.execute(
            "SELECT * FROM tickets ORDER BY ticket_id"
        )
        return cursor.fetchall()


def get_ticket(ticket_id):
    with create_connection() as connection:
        cursor = connection.execute(
            "SELECT * FROM tickets WHERE ticket_id = %s",
            (ticket_id,)
        )
        return cursor.fetchone()


def update_ticket_status(ticket_id, new_status):
    with create_connection() as connection:
        cursor = connection.execute("""
            UPDATE tickets
            SET status = %s
            WHERE ticket_id = %s
        """, (new_status, ticket_id))

        return cursor.rowcount


def delete_ticket(ticket_id):
    with create_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM tickets WHERE ticket_id = %s",
            (ticket_id,)
        )

        return cursor.rowcount


def ticket_exists(ticket_id):
    with create_connection() as connection:
        cursor = connection.execute(
            "SELECT 1 FROM tickets WHERE ticket_id = %s",
            (ticket_id,)
        )

        return cursor.fetchone() is not None


create_table()
