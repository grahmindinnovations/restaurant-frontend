/** Orders that can be reopened on POS to add more items / KOT. */
export function canContinueOrder(order) {
  const status = String(order?.status || '').toLowerCase()
  return status === 'kot' || status === 'billed'
}

/** Active orders that can be voided (guest left, wrong order, etc.). */
export function canCancelOrder(order) {
  const status = String(order?.status || '').toLowerCase()
  return status === 'kot' || status === 'billed' || status === 'received' || status === 'pending'
}

export function cartItemsFromOrder(order) {
  const items = Array.isArray(order?.items) ? order.items : []
  return items.map((i) => ({
    id: i.id,
    name: i.name || '',
    price: Number(i.price) || 0,
    qty: Number(i.qty) || 1,
  }))
}
