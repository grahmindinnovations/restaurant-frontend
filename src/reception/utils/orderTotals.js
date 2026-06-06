export function orderLineTotal(order) {
  const bill = order?.bill
  if (bill && Number.isFinite(Number(bill.total))) {
    return Math.round(Number(bill.total))
  }
  if (Number.isFinite(Number(order?.total))) {
    return Math.round(Number(order.total))
  }
  const items = Array.isArray(order?.items) ? order.items : []
  const sub = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0)
  const gst = Number(bill?.gst) || 0
  const service = Number(bill?.serviceCharge) || 0
  return Math.round(sub + gst + service)
}

export function formatInr(amount) {
  const n = Number(amount) || 0
  return `₹${n.toLocaleString('en-IN')}`
}
