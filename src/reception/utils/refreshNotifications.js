export function refreshReceptionNotifications() {
  window.dispatchEvent(new Event('reception:notifications-refresh'))
}
