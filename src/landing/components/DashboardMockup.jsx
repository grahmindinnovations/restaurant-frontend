import {
  BarChart3,
  Bell,
  ChefHat,
  LayoutGrid,
  Package,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from 'lucide-react'

const KPIS = [
  { label: 'Today sales', value: '₹4,280' },
  { label: 'This month', value: '₹1,80,700' },
  { label: 'Net profit', value: '₹11,149' },
  { label: 'Active orders', value: '4' },
]

const NAV = [
  { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { id: 'kitchen', icon: ChefHat, label: 'Kitchen' },
  { id: 'tables', icon: UtensilsCrossed, label: 'Table bills' },
  { id: 'staff', icon: Users, label: 'Staff' },
  { id: 'inventory', icon: Package, label: 'Inventory' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'alerts', icon: Bell, label: 'Alerts' },
]

const CHART = [42, 58, 35, 72, 48, 88, 64, 52, 76, 68, 54, 82]

const TABLE_BILLS = [
  { table: 1, guests: 2, amount: '₹840', status: 'Paid', channel: 'WhatsApp e-bill' },
  { table: 2, guests: 4, amount: '₹1,240', status: 'Unpaid', channel: 'Awaiting payment' },
  { table: 3, guests: 3, amount: '₹620', status: 'Paid', channel: 'WhatsApp e-bill' },
  { table: 4, guests: 2, amount: '₹923', status: 'Paid', channel: 'WhatsApp e-bill', highlight: true },
  { table: 5, guests: 5, amount: '₹2,180', status: 'Pending', channel: 'Kitchen · 3 items' },
  { table: 6, guests: 1, amount: '₹320', status: 'Unpaid', channel: 'Bill open' },
  { table: 7, guests: 6, amount: '₹3,450', status: 'Paid', channel: 'WhatsApp e-bill' },
  { table: 8, guests: 2, amount: '—', status: 'Empty', channel: 'No order yet' },
]

const STAFF_ROWS = [
  { name: 'Rahul K.', role: 'Waiter', status: 'Active' },
  { name: 'Priya S.', role: 'Chef', status: 'Active' },
  { name: 'Amit D.', role: 'Cashier', status: 'Off shift' },
]

const INVENTORY_ROWS = [
  { name: 'Arabica beans', stock: '12 kg', status: 'Low' },
  { name: 'Whole milk', stock: '28 L', status: 'OK' },
  { name: 'Burger buns', stock: '6 pc', status: 'Low' },
]

function statusClass(status) {
  if (status === 'Paid') return 'paid'
  if (status === 'Unpaid') return 'unpaid'
  if (status === 'Pending') return 'pending'
  return 'empty'
}

export default function DashboardMockup({
  activeView = 'dashboard',
  onViewChange,
  showKitchenAlert = true,
}) {
  const title = NAV.find((n) => n.id === activeView)?.label ?? 'Dashboard'

  const goTo = (id, e) => {
    e.stopPropagation()
    onViewChange?.(id)
  }

  const paidTotal = TABLE_BILLS.filter((t) => t.status === 'Paid' && t.amount !== '—')
    .reduce((sum, t) => sum + parseInt(t.amount.replace(/[^\d]/g, ''), 10), 0)

  return (
    <div className="dash-mock-root" onClick={(e) => e.stopPropagation()}>
      <aside className="dash-mock-sidebar">
        <div className="dash-mock-brand">
          <LayoutGrid className="h-3.5 w-3.5" />
          <span>Admin</span>
        </div>
        <nav role="tablist" aria-label="Admin navigation">
          {NAV.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeView === id}
              className={`dash-mock-nav ${activeView === id ? 'active' : ''} ${id === 'kitchen' && showKitchenAlert ? 'has-alert' : ''}`}
              onClick={(e) => goTo(id, e)}
            >
              <Icon className="h-3 w-3" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <div className="dash-mock-main">
        <header className="dash-mock-header">
          <div>
            <p className="dash-mock-eyebrow">Admin console</p>
            <h3>{title}</h3>
          </div>
          <span className="dash-mock-date">21 Aug 2026 · 23:58</span>
        </header>

        {showKitchenAlert && activeView !== 'kitchen' && (
          <div className="dash-mock-kitchen-toast" role="status">
            <ChefHat className="h-3.5 w-3.5" />
            <div>
              <strong>New order · Kitchen</strong>
              <span>Order #1042 · Table 4 · 3 items</span>
            </div>
            <button type="button" onClick={(e) => goTo('kitchen', e)}>
              View
            </button>
          </div>
        )}

        {activeView === 'kitchen' && (
          <>
            <div className="dash-mock-kitchen-banner">
              <span className="dash-mock-kitchen-pulse" />
              <ChefHat className="h-4 w-4" />
              <div>
                <strong>NEW ORDER · just now</strong>
                <span>KOT sent from Table 4 QR scan</span>
              </div>
            </div>
            <div className="dash-mock-kot-grid">
              <div className="dash-mock-kot-card is-new">
                <header>
                  <span>Order #1042</span>
                  <span className="dash-mock-kot-badge">NEW</span>
                </header>
                <p className="dash-mock-kot-table">Table 4 · 2 guests</p>
                <ul>
                  <li>Truffle Pasta × 1</li>
                  <li>Cold Brew × 2</li>
                </ul>
                <footer>
                  <button type="button">Start preparing · 12 min</button>
                </footer>
              </div>
              <div className="dash-mock-kot-card">
                <header>
                  <span>Order #1038</span>
                  <span className="dash-mock-kot-badge prep">PREP</span>
                </header>
                <p className="dash-mock-kot-table">Table 2 · 4 guests</p>
                <ul>
                  <li>Gourmet Burger × 2</li>
                  <li>Cold Brew × 4</li>
                </ul>
                <footer>
                  <span>~8 min left</span>
                </footer>
              </div>
            </div>
          </>
        )}

        {activeView === 'tables' && (
          <>
            <div className="dash-mock-kpis dash-mock-kpis-tables">
              <div className="dash-mock-kpi">
                <span>Tables seated</span>
                <strong>6 / 8</strong>
              </div>
              <div className="dash-mock-kpi">
                <span>Paid tonight</span>
                <strong>₹{paidTotal.toLocaleString('en-IN')}</strong>
              </div>
              <div className="dash-mock-kpi">
                <span>Awaiting pay</span>
                <strong>2</strong>
              </div>
              <div className="dash-mock-kpi">
                <span>E-bills sent</span>
                <strong>4</strong>
              </div>
            </div>
            <div className="dash-mock-table-bills">
              <div className="dash-mock-table-head">
                <span>Table</span>
                <span>Guests</span>
                <span>Bill</span>
                <span>Status</span>
              </div>
              {TABLE_BILLS.map((row) => (
                <div
                  key={row.table}
                  className={`dash-mock-table-row ${row.highlight ? 'is-highlight' : ''}`}
                >
                  <span>
                    <strong>Table {row.table}</strong>
                    <small>{row.channel}</small>
                  </span>
                  <span>{row.guests}</span>
                  <span className="dash-mock-table-amount">{row.amount}</span>
                  <span className={`dash-mock-table-status ${statusClass(row.status)}`}>
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {(activeView === 'dashboard' || activeView === 'analytics') && (
          <div className="dash-mock-kpis">
            {KPIS.map((kpi) => (
              <div key={kpi.label} className="dash-mock-kpi">
                <span>{kpi.label}</span>
                <strong>{kpi.value}</strong>
              </div>
            ))}
          </div>
        )}

        {activeView === 'staff' && (
          <div className="dash-mock-list">
            {STAFF_ROWS.map((row) => (
              <div key={row.name} className="dash-mock-list-row">
                <span>{row.name}</span>
                <span>{row.role}</span>
                <span>{row.status}</span>
              </div>
            ))}
          </div>
        )}

        {activeView === 'inventory' && (
          <div className="dash-mock-list">
            {INVENTORY_ROWS.map((row) => (
              <div key={row.name} className="dash-mock-list-row">
                <span>{row.name}</span>
                <span>{row.stock}</span>
                <span className={row.status === 'Low' ? 'warn' : ''}>{row.status}</span>
              </div>
            ))}
          </div>
        )}

        {(activeView === 'dashboard' || activeView === 'analytics' || activeView === 'alerts') && (
          <div
            className={`dash-mock-panels ${
              activeView === 'analytics'
                ? 'dash-mock-panels-chart'
                : activeView === 'alerts'
                  ? 'dash-mock-panels-alerts'
                  : ''
            }`}
          >
            {(activeView === 'dashboard' || activeView === 'analytics') && (
              <div className="dash-mock-chart">
                <div className="dash-mock-chart-head">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Monthly revenue</span>
                </div>
                <div className="dash-mock-bars">
                  {CHART.map((h, i) => (
                    <div key={i} className="dash-mock-bar" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            )}
            {(activeView === 'dashboard' || activeView === 'alerts') && (
              <div className="dash-mock-alerts">
                <p>Alerts</p>
                <div className="dash-mock-alert">Low stock · 1 item below threshold</div>
                <div className="dash-mock-alert">Kitchen queue · 4 orders waiting</div>
                <div className="dash-mock-alert">Table 2 · bill unpaid · ₹1,240</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export const DASHBOARD_VIEWS = ['dashboard', 'kitchen', 'tables', 'analytics', 'alerts']
