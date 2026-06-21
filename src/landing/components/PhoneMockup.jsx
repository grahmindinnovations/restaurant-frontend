import { ChefHat, ShoppingBag, Sparkles, Bell, Clock } from 'lucide-react'
import { FOOD_IMAGES } from '../data/foodImages'
import WhatsAppMockup from './WhatsAppMockup'

export const GUEST_LIFECYCLE = {
  MENU: 'menu',
  PLACED: 'placed',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  ORDER_MORE: 'order_more',
  PAY: 'pay',
  EBILL: 'ebill',
}

const MENU_ITEMS = [
  { name: FOOD_IMAGES[2].name, price: FOOD_IMAGES[2].price, tag: 'Chef special', img: FOOD_IMAGES[2].src, amount: 420 },
  { name: FOOD_IMAGES[4].name, price: FOOD_IMAGES[4].price, tag: 'Best seller', img: FOOD_IMAGES[4].src, amount: 180 },
  { name: FOOD_IMAGES[7].name, price: FOOD_IMAGES[7].price, tag: 'Add more', img: FOOD_IMAGES[7].src, amount: 260 },
]

export const DEFAULT_CART = [
  { name: 'Truffle Pasta', qty: 1, amount: 420 },
  { name: 'Cold Brew', qty: 2, amount: 180 },
]

export const SCREENS = [
  { id: 'menu', label: 'Menu', tab: 'Menu' },
  { id: 'offers', label: 'Offers', tab: 'Offers' },
  { id: 'cart', label: 'Cart', tab: 'Cart' },
  { id: 'orders', label: 'Orders', tab: 'Orders' },
  { id: 'track', label: 'Track', tab: 'Track' },
]

function formatRs(n) {
  return `₹${n.toLocaleString('en-IN')}`
}

function MenuScreen({ interactive, onAdvance, orderMoreMode, onAddExtra, extraAdded }) {
  return (
    <>
      <div className="phone-mock-hero">
        <p className="phone-mock-cafe">Grahmind Bistro</p>
        <p className="phone-mock-table">Table 4</p>
      </div>
      {orderMoreMode && (
        <div className="phone-mock-order-more-banner">
          Want more? Add to your running bill — kitchen gets a new KOT.
        </div>
      )}
      <div className="phone-mock-section-title">{orderMoreMode ? 'Add to your table' : 'Popular today'}</div>
      {MENU_ITEMS.map((item, idx) => (
        <button
          key={item.name}
          type="button"
          className={`phone-mock-item ${interactive ? 'phone-mock-clickable' : ''} ${orderMoreMode && idx === 2 && extraAdded ? 'is-added' : ''}`}
          disabled={!interactive || (orderMoreMode && idx === 2 && extraAdded)}
          onClick={(e) => {
            e.stopPropagation()
            if (orderMoreMode && idx === 2) {
              onAddExtra?.()
              return
            }
            onAdvance?.(2)
          }}
        >
          <div
            className="phone-mock-thumb"
            style={{ backgroundImage: `url(${item.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="phone-mock-item-body">
            <p className="phone-mock-item-name">{item.name}</p>
            <p className="phone-mock-item-tag">{orderMoreMode && idx === 2 ? 'Tap to add' : item.tag}</p>
          </div>
          <span className="phone-mock-item-price">{item.price}</span>
        </button>
      ))}
    </>
  )
}

function OffersScreen({ interactive, onAdvance }) {
  return (
    <>
      <div className="phone-mock-section-title">Today&apos;s offers</div>
      <button
        type="button"
        className={`phone-mock-offer-card ${interactive ? 'phone-mock-clickable' : ''}`}
        disabled={!interactive}
        onClick={(e) => {
          e.stopPropagation()
          onAdvance?.(2)
        }}
      >
        <strong>40% off</strong>
        <span>Happy Hour · 4–6 PM</span>
      </button>
    </>
  )
}

function CartScreen({ interactive, onAdvance, onPlaceOrder, cartLines, billTotal }) {
  return (
    <>
      <div className="phone-mock-section-title">Your order</div>
      {cartLines.map((item) => (
        <div key={item.name} className="phone-mock-cart-row">
          <span>
            {item.name} × {item.qty}
          </span>
          <span>{formatRs(item.amount * item.qty)}</span>
        </div>
      ))}
      <div className="phone-mock-offer">
        <Sparkles className="h-3.5 w-3.5" />
        Happy hour — 15% off applied
      </div>
      <div className="phone-mock-total">
        <span>Total</span>
        <strong>{formatRs(billTotal)}</strong>
      </div>
      <button
        type="button"
        className={`phone-mock-cta ${interactive ? 'phone-mock-clickable' : ''}`}
        disabled={!interactive}
        onClick={(e) => {
          e.stopPropagation()
          onPlaceOrder?.()
          onAdvance?.(3)
        }}
      >
        Place order
      </button>
    </>
  )
}

function OrdersScreen({ lifecycle, orderId = '1042', cartLines, billTotal, showToast }) {
  const isNew = lifecycle === GUEST_LIFECYCLE.PLACED || lifecycle === GUEST_LIFECYCLE.PREPARING
  return (
    <>
      <div className="phone-mock-section-title">Your orders</div>
      <div className={`phone-mock-order-notif ${isNew ? 'is-new' : ''}`}>
        <Bell className="h-4 w-4" />
        <div>
          <strong>Order #{orderId} confirmed</strong>
          <p>Table 4 · sent to kitchen</p>
        </div>
      </div>
      <div className="phone-mock-order-card">
        <div className="phone-mock-order-card-head">
          <span>Order #{orderId}</span>
          <span className="phone-mock-badge-kot">KOT</span>
        </div>
        {cartLines.map((item) => (
          <div key={item.name} className="phone-mock-cart-row">
            <span>
              {item.name} × {item.qty}
            </span>
            <span>{formatRs(item.amount * item.qty)}</span>
          </div>
        ))}
        <p className="phone-mock-order-total">Total · {formatRs(billTotal)}</p>
      </div>
      {showToast && (
        <div className="phone-mock-inline-toast">
          <Bell className="h-3.5 w-3.5" />
          New order notification · Check Orders tab · {cartLines.length} items
        </div>
      )}
    </>
  )
}

function TrackScreen({ lifecycle, etaMinutes = 12, showBigTimer }) {
  const steps = [
    { key: 'placed', label: 'Received', done: true },
    {
      key: 'preparing',
      label: 'Preparing',
      done: ['preparing', 'ready', 'served', 'order_more', 'pay', 'ebill'].includes(lifecycle),
      active: lifecycle === GUEST_LIFECYCLE.PREPARING,
    },
    {
      key: 'ready',
      label: 'Ready',
      done: ['ready', 'served', 'order_more', 'pay', 'ebill'].includes(lifecycle),
    },
    { key: 'served', label: 'Served', done: ['served', 'order_more', 'pay', 'ebill'].includes(lifecycle) },
  ]

  return (
    <>
      <div className="phone-mock-section-title">Order #1042 · Table 4</div>
      {showBigTimer && lifecycle === GUEST_LIFECYCLE.PREPARING && (
        <div className="phone-mock-eta-clock">
          <Clock className="h-5 w-5" />
          <span className="phone-mock-eta-mins">{etaMinutes}</span>
          <span className="phone-mock-eta-unit">min left</span>
        </div>
      )}
      <div className="phone-mock-track">
        {steps.map((step) => (
          <div
            key={step.key}
            className={`phone-mock-step ${step.done ? 'active' : ''} ${step.active ? 'current' : ''}`}
          >
            <span className="phone-mock-step-dot" />
            <span>{step.label}</span>
          </div>
        ))}
      </div>
      {lifecycle === GUEST_LIFECYCLE.PREPARING && (
        <div className="phone-mock-eta">
          <ChefHat className="h-4 w-4" />
          Kitchen is preparing your order
        </div>
      )}
      {lifecycle === GUEST_LIFECYCLE.ORDER_MORE && (
        <div className="phone-mock-eta phone-mock-eta-served">
          Still hungry? Go to Menu and add more — bill updates automatically.
        </div>
      )}
    </>
  )
}

function PayScreen({ guestPhone, onPay, paying, cartLines, billTotal }) {
  return (
    <>
      <div className="phone-mock-section-title">Pay bill · Table 4</div>
      <div className="phone-mock-order-card">
        {cartLines.map((item) => (
          <div key={item.name} className="phone-mock-cart-row">
            <span>
              {item.name} × {item.qty}
            </span>
            <span>{formatRs(item.amount * item.qty)}</span>
          </div>
        ))}
        <div className="phone-mock-total">
          <span>Amount due</span>
          <strong>{formatRs(billTotal)}</strong>
        </div>
      </div>
      <label className="phone-mock-phone-field">
        WhatsApp number for e-bill
        <input type="tel" readOnly value={guestPhone || '+91 98765 43210'} />
      </label>
      <button
        type="button"
        className={`phone-mock-cta ${paying ? '' : 'phone-mock-clickable'}`}
        disabled={paying}
        onClick={(e) => {
          e.stopPropagation()
          onPay?.()
        }}
      >
        {paying ? 'Processing…' : 'Pay & get e-bill on WhatsApp'}
      </button>
    </>
  )
}

function EbillScreen({ guestPhone, billTotal, orderId, showWhatsAppBillOpen }) {
  return (
    <WhatsAppMockup
      billTotal={billTotal}
      orderId={orderId}
      showBillOpen={showWhatsAppBillOpen}
    />
  )
}

function calcBill(cartLines) {
  const sub = cartLines.reduce((s, l) => s + l.amount * l.qty, 0)
  return Math.round(sub * 0.85)
}

export default function PhoneMockup({
  screenIndex = 0,
  interactive = false,
  onScreenChange,
  lifecycle = GUEST_LIFECYCLE.MENU,
  guestPhone = '',
  orderId = '1042',
  etaMinutes = 12,
  onPlaceOrder,
  onPay,
  onAddExtra,
  paying = false,
  cartLines = DEFAULT_CART,
  extraAdded = false,
  showOrdersToast = false,
  showBigTimer = false,
  orderMoreMode = false,
  showWhatsAppBillOpen = false,
}) {
  const billTotal = calcBill(cartLines)

  const effectiveIndex =
    lifecycle === GUEST_LIFECYCLE.PAY || lifecycle === GUEST_LIFECYCLE.EBILL
      ? screenIndex
      : lifecycle === GUEST_LIFECYCLE.PLACED
        ? 3
        : lifecycle === GUEST_LIFECYCLE.PREPARING
          ? 4
        : lifecycle === GUEST_LIFECYCLE.ORDER_MORE
          ? 0
          : screenIndex

  const content =
    lifecycle === GUEST_LIFECYCLE.PAY ? (
      <PayScreen guestPhone={guestPhone} onPay={onPay} paying={paying} cartLines={cartLines} billTotal={billTotal} />
    ) : lifecycle === GUEST_LIFECYCLE.EBILL ? (
      <EbillScreen
        guestPhone={guestPhone}
        billTotal={billTotal}
        orderId={orderId}
        showWhatsAppBillOpen={showWhatsAppBillOpen}
      />
    ) : effectiveIndex === 0 || lifecycle === GUEST_LIFECYCLE.ORDER_MORE ? (
      <MenuScreen
        interactive={interactive || orderMoreMode}
        onAdvance={onScreenChange}
        orderMoreMode={orderMoreMode || lifecycle === GUEST_LIFECYCLE.ORDER_MORE}
        onAddExtra={onAddExtra}
        extraAdded={extraAdded}
      />
    ) : effectiveIndex === 1 ? (
      <OffersScreen interactive={interactive} onAdvance={onScreenChange} />
    ) : effectiveIndex === 2 ? (
      <CartScreen
        interactive={interactive}
        onAdvance={onScreenChange}
        onPlaceOrder={onPlaceOrder}
        cartLines={cartLines}
        billTotal={billTotal}
      />
    ) : effectiveIndex === 3 ? (
      <OrdersScreen
        lifecycle={lifecycle}
        orderId={orderId}
        cartLines={cartLines}
        billTotal={billTotal}
        showToast={showOrdersToast}
      />
    ) : (
      <TrackScreen lifecycle={lifecycle} etaMinutes={etaMinutes} showBigTimer={showBigTimer} />
    )

  const tabIndex = lifecycle === GUEST_LIFECYCLE.PAY || lifecycle === GUEST_LIFECYCLE.EBILL ? -1 : effectiveIndex

  const goTo = (index, e) => {
    e.stopPropagation()
    onScreenChange?.(index)
  }

  return (
    <div
      className={`phone-mockup-shell ${interactive ? 'phone-mockup-interactive' : ''} ${lifecycle === GUEST_LIFECYCLE.EBILL ? 'phone-mockup-whatsapp' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="phone-mockup-notch" />
      <div className="phone-mockup-screen">
        {lifecycle !== GUEST_LIFECYCLE.EBILL && (
          <div className="phone-mockup-status">
            <span>9:41</span>
            <span className="phone-mockup-signal">●●●</span>
          </div>
        )}
        <div
          className={`phone-mockup-content ${lifecycle === GUEST_LIFECYCLE.EBILL ? 'phone-mockup-content-wa' : ''}`}
          key={`${tabIndex}-${lifecycle}-${billTotal}-${showWhatsAppBillOpen}`}
        >
          {content}
        </div>
        {lifecycle !== GUEST_LIFECYCLE.PAY && lifecycle !== GUEST_LIFECYCLE.EBILL && (
          <div className="phone-mockup-tabbar" role="tablist" aria-label="Guest app tabs">
            {SCREENS.map((tab, i) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={i === tabIndex}
                className={`${i === tabIndex ? 'active' : ''} ${tab.id === 'orders' && (lifecycle === GUEST_LIFECYCLE.PLACED || showOrdersToast) ? 'has-badge' : ''}`}
                onClick={(e) => goTo(i, e)}
              >
                {tab.id === 'cart' ? (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5 inline" /> {tab.tab}
                  </>
                ) : tab.id === 'orders' ? (
                  <>
                    <Bell className="h-3.5 w-3.5 inline" /> {tab.tab}
                  </>
                ) : (
                  tab.tab
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="phone-mockup-side phone-mockup-side-left" />
      <div className="phone-mockup-side phone-mockup-side-right" />
    </div>
  )
}
