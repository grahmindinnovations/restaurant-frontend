import React from 'react'
import Modal from '../../components/common/Modal'
import { Button, Input, Label, FormGroup } from '../../components/common/Forms'

export default function AddDishModal({ isOpen, onClose, onAdd, newDish, setNewDish }) {
  if (!isOpen) return null

  return (
    <Modal
      title="Add New Dish"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onAdd}>Add Dish</Button>
        </>
      }
    >
      <FormGroup>
        <Label>Dish Name</Label>
        <Input 
          placeholder="e.g. Chicken Biryani" 
          value={newDish.name}
          onChange={e => setNewDish({...newDish, name: e.target.value})}
        />
      </FormGroup>
      <FormGroup>
        <Label>Category</Label>
        <select
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          value={newDish.category || ''}
          onChange={e => setNewDish({ ...newDish, category: e.target.value })}
        >
          <option value="" disabled>Select category</option>
          <option value="Starters">Starters</option>
          <option value="Soups">Soups</option>
          <option value="Salads">Salads</option>
          <option value="Breads">Breads</option>
          <option value="Main Course">Main Course</option>
          <option value="Rice">Rice</option>
          <option value="Chinese">Chinese</option>
          <option value="Pasta">Pasta</option>
          <option value="Sandwiches">Sandwiches</option>
          <option value="Desserts">Desserts</option>
          <option value="Drinks">Drinks</option>
        </select>
      </FormGroup>
      <div className="grid grid-cols-2 gap-4">
        <FormGroup>
          <Label>Price (₹)</Label>
          <Input 
            type="number" 
            placeholder="0" 
            value={newDish.price}
            onChange={e => setNewDish({...newDish, price: e.target.value})}
          />
        </FormGroup>
        <FormGroup>
          <Label>Daily Qty</Label>
          <Input 
            type="number" 
            placeholder="50" 
            value={newDish.daily_quantity}
            onChange={e => setNewDish({...newDish, daily_quantity: e.target.value})}
          />
        </FormGroup>
      </div>
      <FormGroup>
        <Label>Dish Size</Label>
        <Input 
          placeholder="e.g. Regular / Small / Large" 
          value={newDish.size || ''}
          onChange={e => setNewDish({...newDish, size: e.target.value})}
        />
      </FormGroup>
      <FormGroup>
        <Label>Image URL</Label>
        <Input 
          placeholder="https://..." 
          value={newDish.image_url}
          onChange={e => setNewDish({...newDish, image_url: e.target.value})}
        />
      </FormGroup>
    </Modal>
  )
}

