export function refreshReceptionTables() {
  window.dispatchEvent(new Event('reception:tables-refresh'))
}
