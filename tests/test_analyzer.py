
from backend.analyzer import TicketAnalyzer


def test_payments_category():
    analyzer = TicketAnalyzer()

    assert analyzer.analyze("I was charged twice") == "Payments"
    assert analyzer.analyze("My payment failed") == "Payments"
    assert analyzer.analyze("I need a refund") == "Payments"


def test_account_category():
    analyzer = TicketAnalyzer()

    assert analyzer.analyze("I cannot log into my account") == "Account"
    assert analyzer.analyze("I forgot my password") == "Account"


def test_technical_category():
    analyzer = TicketAnalyzer()

    assert analyzer.analyze("The application has an error") == "Technical"
    assert analyzer.analyze("My computer is broken") == "Technical"


def test_other_category():
    analyzer = TicketAnalyzer()

    assert analyzer.analyze("I have a general question") == "Other"


def test_high_priority():
    analyzer = TicketAnalyzer()

    assert analyzer.analyze_priority("I was charged twice") == "High"
    assert analyzer.analyze_priority("I suspect fraud") == "High"
    assert analyzer.analyze_priority("My card was stolen") == "High"
    assert analyzer.analyze_priority("My account is blocked") == "High"


def test_medium_priority():
    analyzer = TicketAnalyzer()

    assert analyzer.analyze_priority("I cannot log into my account") == "Medium"
    assert analyzer.analyze_priority("I forgot my password") == "Medium"
    assert analyzer.analyze_priority("My payment is delayed") == "Medium"


def test_low_priority():
    analyzer = TicketAnalyzer()

    assert analyzer.analyze_priority("I have a general question") == "Low"
    assert analyzer.analyze_priority("I need help with my profile") == "Low"


def test_case_insensitivity():
    analyzer = TicketAnalyzer()

    assert analyzer.analyze("I WAS CHARGED TWICE") == "Payments"
    assert analyzer.analyze_priority("I WAS CHARGED TWICE") == "High"
