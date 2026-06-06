/** Use tables from API only — no hard-coded T1–T10 placeholders. */
export function normalizeTablesFromApi(list) {
  const arr = Array.isArray(list) ? list : []
  return arr
    .map((t) => ({
      id: String(t.id || ''),
      status: t.status || 'available',
      reservedBy: t.reservedBy || null,
      phone: t.phone || null,
      currentOrderId: t.currentOrderId || null,
      ...t,
    }))
    .filter((t) => t.id)
    .sort((a, b) =>
      String(a.id).localeCompare(String(b.id), undefined, { numeric: true }),
    )
}
