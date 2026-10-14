import './App.css'

function App() {

  return (
    <div className='app'>
      <aside className='sidebar'>
        <h2 className='logo'>Support<span>AI</span></h2>

        <p className="menu-label">WORKSPACE</p>

        <nav>
          <a href='#dashboard' className='nav-link active'>Dashboard</a>
          <a href="#tickets" className='nav-link'>All Tickets</a>
        </nav>

        <div className='sidebar-footer'>
          <div className='avatar'>NG</div>
          <div>
            <strong>Administrator</strong>
            <p>Support Team</p>
          </div>
        </div>
      </aside>

      <main className='main-content' id='dashboard'>
        <header className='topbar'>
          <div>
            <p className='breadcrumb'>Workspace / Overview</p>
            <h1>Dashboard</h1>
          </div>
          <span className='status-indicator'>API Dashboard</span>
        </header>

        <section className='welcome'>
          <div>
            <p className='eyebrow'>SUPPORT OVERVIEW</p>
            <h2>Welcome back!</h2>
            <p>Manage customer request from one place.</p>
          </div>
          <button className='primary-button'> + Create Ticket</button>
        </section>

        <section className='stats-grid'>
          <article className='stat-card'>
            <p>Total Tickets</p>
            <h3>0</h3>
            <span>All customer requests</span>
          </article>

          <article className='stat-card'>
            <p>Open Tickets</p>
            <h3>0</h3>
            <span>Awaiting attention</span>
          </article>

          <article className='stat-card'>
            <p>In Progress</p>
            <h3>0</h3>
            <span>Currently being handled</span>
          </article>

          <article className='stat-card'>
            <p>Resolved</p>
            <h3>0</h3>
            <span>Successfully completed</span>
          </article>
        </section>

        <section className='tickets-panel' id="tickets">
          <div className='panel-header'>
            <div>
              <h2>Recent Tickets</h2>
              <p>Review and manage customer requests.</p>
            </div>
            <button className='secondary-button'>View All</button>
          </div>

          <div className='empty-state'>
            <div className='empty-icon'></div>
            <h3>No tickts displayed yet</h3>
            <p>Your customer ticketswill appear here once we connect this dashboard to your API.</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App