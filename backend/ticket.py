from analyzer import TicketAnalyzer

class Ticket:


    def __init__(self, ticket_id, customer_name, message):
        self.ticket_id = ticket_id
        self.customer_name = customer_name
        self.message = message

        self.category = "Unknown"
        self.priority = "Unknown"
        self.status = "Open"

        self.analyze_ticket()

    def display_ticket(self):
        print("\n------ Support Ticket --------")
        print("Ticket ID:", self.ticket_id)
        print("Customer:", self.customer_name)
        print("Message:", self.message)
        print("Category:", self.category)
        print("Priority:", self.priority)
        print("Status:", self.status)

    def update_status(self, new_status):

        if self.status == "Open" and new_status == "In Progress":
            self.status = new_status
            return "Status updated"

        elif self.status == "In Progress" and new_status == "Resolved":
            self.status = new_status
            return "Status updated"

        else:
            return "Invalid status change"

    def analyze_ticket(self):

        message = self.message.lower()

        # category

        if "charged" in message or "payment" in message or "refund" in message:
            self.category = "Payments"

        elif "login" in message or "log in" in message or "password" in message:
            self.category = "Account"

        elif "error" in message or "broken" in message:
            self.category = "Technical"

        else:
            self.category = "Other"



        #priority

        if ("charged" in message or "fraud" in message or "stolen" in message or "blocked" in message):
            self.priority = "High"

        else:
            self.priority = "Low"




