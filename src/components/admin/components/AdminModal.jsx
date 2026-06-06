import { X } from 'lucide-react'
import { Button } from '../../ui/button'

export default function AdminModal({ title, onClose, children, footer }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-lg border border-neutral-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <h2 id="admin-modal-title" className="text-sm font-semibold text-neutral-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-500 hover:bg-neutral-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 py-3 space-y-3 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-neutral-200 px-4 py-3 bg-neutral-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function AdminModalActions({ onCancel, onSave, saveLabel = 'Save', saving = false }) {
  return (
    <>
      <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="button" size="sm" className="h-8 text-xs" disabled={saving} onClick={onSave}>
        {saving ? 'Saving…' : saveLabel}
      </Button>
    </>
  )
}
