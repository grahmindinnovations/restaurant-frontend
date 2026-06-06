export default function AdminNotice({ message, variant = 'info' }) {
  if (!message) return null
  const styles =
    variant === 'error'
      ? 'border-neutral-900 bg-neutral-100 text-neutral-900'
      : variant === 'success'
        ? 'border-green-200 bg-green-50 text-green-900'
        : 'border-neutral-200 bg-neutral-50 text-neutral-800'
  return (
    <p className={`text-xs rounded-md border px-3 py-2 ${styles}`} role="status">
      {message}
    </p>
  )
}
