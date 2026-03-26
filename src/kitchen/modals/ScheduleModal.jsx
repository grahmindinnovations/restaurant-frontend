import React from 'react'
import Modal from '../../components/common/Modal'
import { Button, Input, Label, FormGroup } from '../../components/common/Forms'

export default function ScheduleModal({ isOpen, onClose, onSave, config, setConfig }) {
  if (!isOpen) return null

  return (
    <Modal
      title="Set Kitchen Schedule"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onSave}>Save Schedule</Button>
        </>
      }
    >
      <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-600 mb-2">
        Set the operating hours for the kitchen. The system will automatically mark the kitchen as 'Offline' outside these hours.
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormGroup>
          <Label>Opening Time</Label>
          <Input 
            type="time" 
            value={config.opening_time}
            onChange={e => setConfig({...config, opening_time: e.target.value})}
          />
        </FormGroup>
        <FormGroup>
          <Label>Closing Time</Label>
          <Input 
            type="time" 
            value={config.closing_time}
            onChange={e => setConfig({...config, closing_time: e.target.value})}
          />
        </FormGroup>
      </div>
    </Modal>
  )
}

