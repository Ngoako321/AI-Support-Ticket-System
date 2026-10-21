
import { useEffect, useState } from 'react'
import { getTickets } from './api'
import './App.css'

function App() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTickets() {
      try {
        const data = await getTickets()
        setTickets(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [])

  const totalTickets = tickets.length

  const openTickets = tickets.filter(
    ticket => ticket.status === 'Open'
  ).length

  const inProgressTickets = tickets.filter(
    ticket => ticket.status === 'In Progress'
  ).length

  const resolvedTickets = tickets.filter(
    ticket => ticket.status === 'Resolved'
  ).length

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="logo">Support<span>AI</span></h2>

        <p className="menu-label">WORKSPACE</p>

        <nav>
          <a href="#dashboard" className="nav-link active" aria-current="page">
            Dashboard
          </a>
          <a href="#tickets" className="nav-link">
            All Tickets
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="avatar">NG</div>
          <div>
            <strong>Administrator</strong>
            <p>Support Team</p>
          </div>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Overview</p>
            <h1>Dashboard</h1>
          </div>

          <span className="status-indicator">
            {loading
              ? 'Connecting...'
              : error
                ? 'API Connection Failed'
                : 'API Connected'}
          </span>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">SUPPORT OVERVIEW</p>
            <h2>Welcome back!</h2>
            <p>Manage customer requests from one place.</p>
          </div>

          <button className="primary-button" type="button">
            + Create Ticket
          </button>
        </section>

        {error && (
          <p role="alert">
            Could not load tickets: {error}
          </p>
        )}

        <section className="stats-grid">
          <article className="stat-card">
            <p>Total Tickets</p>
            <h3>{loading ? '...' : totalTickets}</h3>
            <span>All customer requests</span>
          </article>

          <article className="stat-card">
            <p>Open Tickets</p>
            <h3>{loading ? '...' : openTickets}</h3>
            <span>Awaiting attention</span>
          </article>

          <article className="stat-card">
            <p>In Progress</p>
            <h3>{loading ? '...' : inProgressTickets}</h3>
            <span>Currently being handled</span>
          </article>

          <article className="stat-card">
            <p>Resolved</p>
            <h3>{loading ? '...' : resolvedTickets}</h3>
            <span>Successfully completed</span>
          </article>
        </section>

        <section className="tickets-panel" id="tickets">
          <div className="panel-header">
            <div>
              <h2>Recent Tickets</h2>
              <p>Review and manage customer requests.</p>
            </div>

            <button
              className="secondary-button"
              type="button"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <h3>Loading tickets...</h3>
              <p>Please wait while we retrieve your tickets.</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <h3>Tickets could not be loaded</h3>
              <p>Check your API connection and try again.</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <h3>No tickets to display yet</h3>
              <p>Your customer tickets will appear here once created.</p>
            </div>
          ) : (
            <div className="tickets-list">
              {tickets.map(ticket => (
                <article className="ticket-row" key={ticket.ticket_id}>
                  <div>
                    <h3>
                      #{ticket.ticket_id} — {ticket.customer_name}
                    </h3>
                    <p>{ticket.message}</p>
                    <span>{ticket.category}</span>
                  </div>

                  <div>
                    <p>Priority: {ticket.priority}</p>
                    <strong>{ticket.status}</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
