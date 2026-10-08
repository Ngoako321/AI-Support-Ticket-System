from ticket import Ticket

class TicketManager:

    def __init__(self):
        self.tickets = []

    def add_ticket(self, ticket):
        if self.find_ticket(ticket.ticket_id):
            return False

        self.tickets.append(ticket)
        return True

    def find_ticket(self, ticket_id):

        for ticket in self.tickets:

            if ticket.ticket_id == ticket_id:
                return ticket 

        return None

    def update_ticket_status(self, ticket_id, new_status):

        ticket = self.find_ticket(ticket_id)

        if ticket:
            return ticket.update_status(new_status)

        else:
            return "Ticket not found"

    def display_all_tickets(self):

        for ticket in self.tickets:
            ticket.display_ticket()

    def delete_ticket(self, ticket_id):

        ticket = self.find_ticket(ticket_id)

        if ticket:
            self.tickets.remove(ticket)
            return "Ticket deleted"

        else:
            return "Ticket not found"


