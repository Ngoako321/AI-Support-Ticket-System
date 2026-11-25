# Violet AI | Support Ticket System

An AI-powered customer support ticket management system built with Python, FastAPI, PostgreSQL, HTML, CSS and JavaScript.

Violet AI helps support teams manage customer requests by automatically categorising tickets, assigning priority levels, tracking ticket statuses and generating support performance insights.

**Live Demo:** https://violet-ai-frontend.onrender.com

**Backend API:** https://violet-ai-backend.onrender.com

**API Documentation:** https://violet-ai-backend.onrender.com/docs

---

## 1. Project Overview

Customer support teams often receive large numbers of requests that need to be organised, prioritised and resolved efficiently.

Violet AI addresses this problem by providing a centralised dashboard where support tickets can be created, monitored, updated and analysed.

The system uses rule-based AI classification to analyse customer messages, automatically determine their categories and assign priority levels.

It also provides an insights dashboard that helps support administrators understand ticket volumes, common issues and resolution performance.

## 2. Key Features

- **Ticket Management:** Create, view, update and delete customer support tickets.
- **Automatic Classification:** Categorise tickets into Payments, Account, Technical or Other.
- **Priority Detection:** Automatically assign High, Medium or Low priority.
- **Status Tracking:** Track tickets through Open, In Progress and Resolved statuses.
- **AI Insights Dashboard:** Display ticket statistics, priority distribution, common categories and recommendations.
- **Search and Filtering:** Find tickets and filter them by relevant attributes.
- **REST API:** Manage ticket operations through FastAPI endpoints.
- **Persistent Storage:** Store ticket records in a PostgreSQL database.
- **Automated Testing:** Use pytest to test ticket logic, classification and API functionality.

## 3. Technologies Used

| Technology | Purpose |
|---|---|
| Python | Backend development and business logic |
| FastAPI | REST API development |
| PostgreSQL | Database and persistent storage |
| HTML5 | Frontend structure |
| CSS3 | Styling and responsive layout |
| JavaScript | Frontend functionality and API integration |
| pytest | Automated testing |
| FastAPI TestClient | API testing |
| Git & GitHub | Version control |
| Render | Application deployment |

## 4. How It Works

The system follows this workflow:

1. A customer support ticket is submitted through the frontend.
2. The frontend sends the ticket information to the FastAPI backend.
3. The backend analyses the customer's message.
4. The system automatically determines the ticket category and priority.
5. The ticket is saved in the PostgreSQL database.
6. The frontend retrieves and displays the ticket.
7. Support administrators can update ticket statuses and monitor performance through the dashboard.

## 5. AI Classification Logic

Violet AI currently uses a rule-based classification approach.

The `TicketAnalyzer` class analyses customer messages using predefined keywords.

### Ticket Categories

| Category | Example keywords |
|---|---|
| Payments | charged, payment, refund |
| Account | log, password |
| Technical | error, broken |
| Other | Messages that do not match the defined categories |

### Priority Levels

| Priority | Conditions |
|---|---|
| High | charged, fraud, stolen, blocked |
| Medium | log, password, payment |
| Low | Messages that do not match the higher-priority conditions |

The classification is case-insensitive.

**Note:** The current implementation uses rule-based AI rather than a machine learning model or external large language model. Future improvements may introduce more advanced natural language processing.

## 6. AI Insights

The insights dashboard provides information about support performance, including:

- Total number of tickets.
- Number of high-priority tickets.
- Most common ticket category.
- Ticket resolution rate.
- Distribution of ticket categories.
- Automatically generated support recommendations.

These insights are calculated using the ticket records stored in the database.

## 7. Project Structure

```text
AI Support Ticket System/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── ticket.py
│   ├── analyzer.py
│   └── manager.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── tests/
│   ├── test_ticket.py
│   ├── test_analyzer.py
│   └── test_api.py
│
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

## 8. Installation and Setup

Follow these steps to run the project locally.

### Prerequisites

Make sure you have installed:

- Python 3.10 or later.
- PostgreSQL.
- Git.
- Visual Studio Code (recommended).

### Step 1: Clone the repository

```bash
git clone https://github.com/Ngoako321/AI-Support-Ticket-System.git
```

Navigate into the project directory:

```bash
cd AI-Support-Ticket-System
```

### Step 2: Create a virtual environment

```bash
python -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

### Step 3: Install dependencies

```bash
python -m pip install -r requirements.txt
```

### Step 4: Configure environment variables

Create a `.env` file in the project root directory.

Configure your PostgreSQL connection using the environment variable expected by the backend:

```env
DATABASE_URL=your_postgresql_connection_string
```

Replace the example value with your actual database connection string.

**Important:** Never commit your `.env` file or expose your database credentials on GitHub.

### Step 5: Start the backend

From the project root, run:

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

The API will be available at:

http://127.0.0.1:8000

Interactive API documentation:

http://127.0.0.1:8000/docs

### Step 6: Start the frontend

Open the `frontend` folder in Visual Studio Code.

Use the Live Server extension to open `index.html`.

The frontend should be available at:

http://127.0.0.1:5500

Make sure the frontend API URL is configured to use your local backend when testing locally.

## 9. API Endpoints

The backend exposes the following REST API endpoints:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check API availability |
| GET | `/tickets` | Retrieve all tickets |
| POST | `/tickets` | Create a new ticket |
| GET | `/tickets/{ticket_id}` | Retrieve a specific ticket |
| PUT | `/tickets/{ticket_id}/status` | Update ticket status |
| DELETE | `/tickets/{ticket_id}` | Delete a ticket |
| GET | `/insights` | Retrieve support insights |

### Example: Create a Ticket

**Request**

```http
POST /tickets
```

**JSON body**

```json
{
  "ticket_id": 101,
  "customer_name": "John",
  "message": "I was charged twice for my transaction"
}
```

**Example response**

```json
{
  "message": "Ticket created successfully",
  "ticket_id": 101,
  "customer_name": "John",
  "message_text": "I was charged twice for my transaction",
  "category": "Payments",
  "priority": "High",
  "status": "Open"
}
```

### Example: Update Ticket Status

**Request**

```http
PUT /tickets/101/status
```

**JSON body**

```json
{
  "status": "In Progress"
}
```

The system supports the following status transitions:

```text
Open → In Progress → Resolved
```

Invalid status transitions are rejected.

## 10. Testing

The project uses **pytest** to automate testing of the ticket management system, classification logic and API endpoints.

### Running the tests

Install the testing dependencies:

```bash
python -m pip install pytest httpx
```

Run the complete test suite:

```bash
python -m pytest -v
```

### Tests