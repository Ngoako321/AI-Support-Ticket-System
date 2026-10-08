class TicketAnalyzer:

    def analyze(self, message):

        message = message.lower()
        # category rules
        if "charged" in message:
            return "Payments"

        elif "payment" in message:
            return "Payments"

        elif "refund" in message:
            return "Payments"

        elif "log" in message:
            return  "Account"

        elif "password" in message:
            return "Account"

        elif "error" in message:
            return "Technical"

        elif "broken" in message:
            return "Technical"

        else:
            return "Other"

    def analyze_priority(self, message):

        message = message.lower()
        # Priority rules
        if "charged" in message:
            return "High"

        elif "fraud" in message:
            return "High"

        elif "stolen" in message:
            return "High"

        elif "blocked" in message:
            return "High"

        elif "log" in message:
            return "Medium"

        elif "password" in message:
            return "Medium"

        elif "payment" in message:
            return "Medium"

        else:
            return "Low"
