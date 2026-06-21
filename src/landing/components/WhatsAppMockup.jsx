import { Camera, IndianRupee, MessageCirclePlus, Phone, Users } from 'lucide-react'

function formatRs(n) {
  return `₹${n.toLocaleString('en-IN')}`
}

const DUMMY_CHATS = [
  { name: 'Neha Sharma', preview: 'See you tomorrow', time: '18:42', unread: 0 },
  { name: 'Weekend plans', preview: 'Arjun: sounds good 👍', time: '17:05', unread: 4 },
  { name: 'Vikram Mehta', preview: 'Photo', time: '14:28', unread: 0 },
]

export default function WhatsAppMockup({
  billTotal = 923,
  tableLabel = 'Table 4',
  orderId = '1042',
  restaurantName = 'Grahmind Bistro',
  showBillOpen = false,
}) {
  const billPreview = `E-bill · ${tableLabel} · ${formatRs(billTotal)} paid ✓`

  if (showBillOpen) {
    return (
      <div className="wa-mock wa-mock-chat">
        <header className="wa-mock-chat-header">
          <button type="button" className="wa-mock-back" aria-label="Back">
            ‹
          </button>
          <div className="wa-mock-chat-avatar wa-mock-avatar-brand">G</div>
          <div className="wa-mock-chat-meta">
            <strong>{restaurantName}</strong>
            <span>Business account</span>
          </div>
        </header>
        <div className="wa-mock-chat-body">
          <div className="wa-mock-date-pill">Today</div>
          <div className="wa-mock-bubble wa-mock-bubble-in">
            <div className="wa-mock-bill-card">
              <p className="wa-mock-bill-title">Payment receipt</p>
              <p className="wa-mock-bill-sub">Order #{orderId} · {tableLabel}</p>
              <div className="wa-mock-bill-row">
                <span>Truffle Pasta × 1</span>
                <span>₹420</span>
              </div>
              <div className="wa-mock-bill-row">
                <span>Cold Brew × 2</span>
                <span>₹360</span>
              </div>
              <div className="wa-mock-bill-row">
                <span>Berry Cheesecake × 1</span>
                <span>₹260</span>
              </div>
              <div className="wa-mock-bill-divider" />
              <div className="wa-mock-bill-row wa-mock-bill-total">
                <span>Paid</span>
                <strong>{formatRs(billTotal)}</strong>
              </div>
              <p className="wa-mock-bill-foot">Show this at exit · Thank you for dining with us!</p>
            </div>
            <span className="wa-mock-bubble-time">9:41 PM ✓✓</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wa-mock">
      <header className="wa-mock-header">
        <h2>WhatsApp</h2>
        <div className="wa-mock-header-actions">
          <IndianRupee className="h-3.5 w-3.5" />
          <Camera className="h-3.5 w-3.5" />
        </div>
      </header>

      <div className="wa-mock-search">
        <span className="wa-mock-search-icon">⌕</span>
        <span>Ask Meta AI or Search</span>
      </div>

      <div className="wa-mock-filters">
        <span className="active">All</span>
        <span>Unread 99+</span>
        <span>Favourites</span>
        <span>Groups</span>
      </div>

      <div className="wa-mock-list">
        <div className="wa-mock-row wa-mock-row-highlight">
          <div className="wa-mock-avatar wa-mock-avatar-brand">G</div>
          <div className="wa-mock-row-body">
            <div className="wa-mock-row-top">
              <strong>{restaurantName}</strong>
              <span className="wa-mock-time wa-mock-time-new">now</span>
            </div>
            <div className="wa-mock-row-preview">
              <span className="wa-mock-ticks">✓✓</span>
              <span>{billPreview}</span>
            </div>
          </div>
          <span className="wa-mock-unread">1</span>
        </div>

        {DUMMY_CHATS.map((chat) => (
          <div key={chat.name} className="wa-mock-row">
            <div className="wa-mock-avatar">{chat.name[0]}</div>
            <div className="wa-mock-row-body">
              <div className="wa-mock-row-top">
                <strong>{chat.name}</strong>
                <span className="wa-mock-time">{chat.time}</span>
              </div>
              <p className="wa-mock-row-preview muted">{chat.preview}</p>
            </div>
            {chat.unread > 0 && <span className="wa-mock-unread">{chat.unread}</span>}
          </div>
        ))}
      </div>

      <nav className="wa-mock-nav">
        <span className="active">
          <MessageCirclePlus className="h-3 w-3" />
          Chats
          <em className="wa-mock-nav-badge">99+</em>
        </span>
        <span>Updates</span>
        <span>
          <Users className="h-3 w-3" />
          Communities
        </span>
        <span>
          <Phone className="h-3 w-3" />
          Calls
        </span>
      </nav>

      <button type="button" className="wa-mock-fab" aria-label="New chat">
        +
      </button>
    </div>
  )
}
