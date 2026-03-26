import { useMemo, useState } from 'react'
import Modal from '../../components/common/Modal'
import { Button, Input, Label, FormGroup } from '../../components/common/Forms'

export default function BookTableModal({ isOpen, onClose, tables, onBook }) {
  const [tableId, setTableId] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const availableTables = useMemo(() => {
    if (!Array.isArray(tables)) return []
    return tables.filter(t => t.status !== 'occupied')
  }, [tables])

  if (!isOpen) return null

  const submit = async () => {
    if (!tableId) return alert('Select a table')
    await onBook?.({ tableId, name, phone })
    setTableId('')
    setName('')
    setPhone('')
  }

  return (
    <Modal
      title="Book Table"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>Confirm</Button>
        </>
      }
    >
      <FormGroup>
        <Label>Table</Label>
        <select
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          value={tableId}
          onChange={e => setTableId(e.target.value)}
        >
          <option value="" disabled>Select table</option>
          {availableTables.map(t => (
            <option key={t.id} value={t.id}>
              {t.id}{t.status === 'reserved' ? ' (reserved)' : ''}
            </option>
          ))}
        </select>
      </FormGroup>
      <FormGroup>
        <Label>Customer Name</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Optional" />
      </FormGroup>
      <FormGroup>
        <Label>Phone</Label>
        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Optional" />
      </FormGroup>
    </Modal>
  )
}

