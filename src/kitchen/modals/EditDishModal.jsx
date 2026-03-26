import Modal from '../../components/common/Modal'
import { Button, Input, Label, FormGroup } from '../../components/common/Forms'

export default function EditDishModal({ isOpen, onClose, dish, onSave, setDish }) {
  if (!isOpen) return null

  const submit = async () => {
    await onSave?.()
  }

  return (
    <Modal
      title="Edit Dish"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>Save</Button>
        </>
      }
    >
      <FormGroup>
        <Label>Dish Name</Label>
        <Input value={dish?.name || ''} disabled />
      </FormGroup>
      <FormGroup>
        <Label>Dish Size</Label>
        <Input
          placeholder="e.g. Regular / Small / Large"
          value={dish?.size || ''}
          onChange={e => setDish?.({ ...dish, size: e.target.value })}
        />
      </FormGroup>
      <FormGroup>
        <Label>Image URL</Label>
        <Input
          placeholder="https://..."
          value={dish?.image_url || ''}
          onChange={e => setDish?.({ ...dish, image_url: e.target.value })}
        />
      </FormGroup>
    </Modal>
  )
}

