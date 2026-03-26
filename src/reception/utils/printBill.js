function toDateValue(raw) {
  if (!raw) return null
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw
  if (typeof raw?.toDate === 'function') {
    const d = raw.toDate()
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null
  }
  if (typeof raw === 'string' || typeof raw === 'number') {
    const d = new Date(raw)
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

function currency(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0.00'
  return n.toFixed(2)
}

function escapeHtml(input) {
  return String(input ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function buildReceiptHtml(order) {
  const id = String(order?.id || '')
  const createdAt =
    toDateValue(order?.createdAt) || toDateValue(order?.created_at) || toDateValue(order?.updatedAt) || new Date()
  const type = String(order?.type || '').toLowerCase()
  const table = order?.table ? String(order.table) : ''
  const items = Array.isArray(order?.items) ? order.items : []
  
  // Extract bill metadata if available (from POS order panel)
  const bill = order?.bill || {}
  
  const subTotal = bill.subTotal !== undefined 
    ? Number(bill.subTotal) 
    : items.reduce((sum, it) => sum + Number(it?.qty || 0) * Number(it?.price || 0), 0)
    
  const serviceCharge = Number(bill.serviceCharge) || 0
  const gst = Number(bill.gst) || 0
  
  // Fallback to order total if explicit bill object is missing
  const explicitTotal = Number(order?.total)
  const total = bill.total !== undefined 
    ? Number(bill.total) 
    : (Number.isFinite(explicitTotal) ? explicitTotal : (subTotal + serviceCharge + gst))

  const header = `
    <div class="center">
      <div class="title">${escapeHtml(import.meta.env.VITE_RESTAURANT_NAME || 'Restaurant')}</div>
      <div class="muted">${escapeHtml(import.meta.env.VITE_RESTAURANT_ADDRESS || '')}</div>
      <div class="muted">${escapeHtml(import.meta.env.VITE_RESTAURANT_PHONE || '')}</div>
    </div>
    <div class="hr"></div>
    <div class="row"><span>Bill No:</span><span>${escapeHtml(id)}</span></div>
    <div class="row"><span>Date:</span><span>${escapeHtml(createdAt.toLocaleString())}</span></div>
    <div class="row"><span>Type:</span><span>${escapeHtml(type === 'takeaway' ? 'Parcel' : 'Dine-in')}</span></div>
    ${table ? `<div class="row"><span>Table:</span><span>${escapeHtml(table)}</span></div>` : ''}
    <div class="hr"></div>
  `

  const lines = items
    .map((it) => {
      const name = String(it?.name || '')
      const qty = Number(it?.qty || 0)
      const price = Number(it?.price || 0)
      const lineTotal = qty * price
      return `
        <div class="item">
          <div class="item-name">${escapeHtml(name)}</div>
          <div class="item-meta">
            <span>${escapeHtml(String(qty))} x ₹${escapeHtml(currency(price))}</span>
            <span>₹${escapeHtml(currency(lineTotal))}</span>
          </div>
        </div>
      `
    })
    .join('')

  let footerBreakdown = ''
  if (serviceCharge > 0 || gst > 0) {
    footerBreakdown += `<div class="hr"></div>`
    footerBreakdown += `<div class="row text-sm"><span>Subtotal</span><span>₹${escapeHtml(currency(subTotal))}</span></div>`
    if (serviceCharge > 0) {
      footerBreakdown += `<div class="row text-sm"><span>Service Tax</span><span>₹${escapeHtml(currency(serviceCharge))}</span></div>`
    }
    if (gst > 0) {
      footerBreakdown += `<div class="row text-sm"><span>GST</span><span>₹${escapeHtml(currency(gst))}</span></div>`
    }
  }

  const footer = `
    ${footerBreakdown}
    <div class="hr"></div>
    <div class="row total"><span>Total</span><span>₹${escapeHtml(currency(total))}</span></div>
    <div class="hr"></div>
    <div class="center muted">Thank you. Visit again!</div>
  `

  const styles = `
    <style>
      @page { margin: 8mm; }
      body { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; color: #0f172a; }
      .wrap { max-width: 320px; margin: 0 auto; font-size: 12px; }
      .title { font-weight: 800; font-size: 16px; }
      .muted { color: #475569; }
      .center { text-align: center; }
      .hr { border-top: 1px dashed #cbd5e1; margin: 10px 0; }
      .row { display: flex; justify-content: space-between; gap: 12px; }
      .text-sm { font-size: 11px; color: #334155; margin-top: 2px; }
      .item { margin: 10px 0; }
      .item-name { font-weight: 700; }
      .item-meta { display: flex; justify-content: space-between; gap: 12px; color: #334155; }
      .total { font-weight: 900; font-size: 14px; }
      .btns { display: none; }
      @media print { .btns { display: none; } }
    </style>
  `

  return `<!doctype html><html><head><meta charset="utf-8"/><title>Bill ${escapeHtml(id)}</title>${styles}</head><body><div class="wrap">${header}${lines}${footer}</div></body></html>`
}

export function printBill(order) {
  const html = buildReceiptHtml(order)
  
  let iframe = document.getElementById('receipt-print-iframe')
  if (!iframe) {
    iframe = document.createElement('iframe')
    iframe.id = 'receipt-print-iframe'
    iframe.style.position = 'absolute'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)
  }
  
  const doc = iframe.contentWindow.document
  doc.open()
  doc.write(html)
  doc.close()
  
  iframe.contentWindow.focus()
  
  setTimeout(() => {
    iframe.contentWindow.print()
  }, 200)
  
  return true
}
