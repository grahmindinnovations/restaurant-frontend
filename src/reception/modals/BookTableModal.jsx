import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'

export default function BookTableModal({ isOpen, onClose, tables, onBook }) {
  const [tableId, setTableId] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const bookableTables = useMemo(() => {
    if (!Array.isArray(tables)) return []
    return tables.filter((t) => (t.status || 'available') === 'available')
  }, [tables])

  useEffect(() => {
    if (!isOpen) return
    setError(null)
    setTableId('')
    setName('')
    setPhone('')
    setSubmitting(false)
  }, [isOpen])

  if (!isOpen) return null

  const submit = async () => {
    if (!tableId) {
      setError('Select a table.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await onBook?.({ tableId, name, phone })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="book-table-title"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <h2 id="book-table-title" className="text-sm font-semibold text-neutral-900">
            Book table
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3 space-y-3">
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Only <span className="font-medium text-neutral-700">available</span> tables can be booked.
            Reserved = guest name saved. Occupied = order in progress on POS.
          </p>

          {error && (
            <div
              className="rounded-lg border-2 border-red-600 bg-red-50 px-3 py-2 text-xs font-semibold text-red-900"
              role="alert"
            >
              {error}
            </div>
          )}

          {bookableTables.length === 0 ? (
            <p className="text-xs text-neutral-600 py-2">No available tables right now.</p>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Table</label>
                <Select
                  value={tableId}
                  onChange={(e) => {
                    setTableId(e.target.value)
                    if (e.target.value) setError(null)
                  }}
                  className="h-9 w-full rounded-lg border-neutral-200 text-sm"
                >
                  <option value="" disabled>
                    Choose table
                  </option>
                  {bookableTables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Optional"
                    className="h-9 rounded-lg border-neutral-200 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">Phone</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Optional"
                    className="h-9 rounded-lg border-neutral-200 text-sm"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-neutral-200 px-4 py-3 bg-neutral-50 rounded-b-xl">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-lg text-xs"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="h-8 rounded-lg text-xs"
            onClick={submit}
            disabled={submitting || bookableTables.length === 0}
          >
            {submitting ? 'Booking…' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  )
}
