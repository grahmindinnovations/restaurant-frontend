/** Inline banner for order saved, table booked, errors, etc. */
export default function PageNotice({ message }) {
  if (!message) return null
  return (
    <div
      className="mb-2 rounded-lg border-2 border-red-600 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-900"
      role="status"
    >
      {message}
    </div>
  )
}
