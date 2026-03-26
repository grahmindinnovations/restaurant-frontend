import { Button } from '../../components/ui/button'
import { Select } from '../../components/ui/select'
import { Trash2, Minus, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

export default function OrderPanel({ cart, onInc, onDec, onRemove, gstRate=0.05, serviceChargeRate=0, onAction, orderId, diningType, onDiningChange, table, onTableChange, onPlaceOrder, tables }){
  const subTotal = cart.reduce((s,i)=>s+i.qty*i.price,0)
  const [enableServiceTax, setEnableServiceTax] = useState(false)

  const serviceTaxEligible = diningType === 'Dine-in'
  const serviceCharge = useMemo(() => {
    if (!enableServiceTax) return 0
    if (!serviceTaxEligible) return 0
    return 150
  }, [enableServiceTax, serviceTaxEligible])

  const gst = Math.round(((subTotal+serviceCharge)*gstRate)*100)/100
  const total = Math.round(subTotal + serviceCharge + gst)
  const tableDisabled = diningType !== 'Dine-in'
  const tableOptions = Array.isArray(tables) && tables.length > 0 ? tables : [
    { id: 'T1', status: 'available' },
    { id: 'T2', status: 'available' },
    { id: 'T3', status: 'available' },
  ]

  const handleAction = (type) => {
    onPlaceOrder && onPlaceOrder(type, {
      subTotal,
      serviceCharge,
      gst,
      total,
      enableServiceTax: enableServiceTax && serviceTaxEligible,
    })
  }

  return (
    <aside className="w-full lg:w-96 h-screen bg-white border-l border-gray-200 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-semibold">{orderId ? `Order #${orderId}` : 'Order'}</div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Select value={diningType} onChange={e=>onDiningChange?.(e.target.value)}>
          <option value="" disabled>Select Dining</option>
          <option value="Dine-in">Dine-in</option>
          <option value="Takeaway">Takeaway (Parcel)</option>
        </Select>
        <Select value={table} onChange={e=>onTableChange?.(e.target.value)} disabled={tableDisabled}>
          <option value="" disabled>Select Table</option>
          {tableOptions.map(t => {
            const isBlocked = t.status === 'occupied'
            const disabled = isBlocked && table !== t.id
            const suffix = t.status === 'available' ? '' : ` (${t.status})`
            return (
              <option key={t.id} value={t.id} disabled={disabled}>{t.id}{suffix}</option>
            )
          })}
        </Select>
      </div>
      {diningType === 'Dine-in' && (
        <label className="flex items-center justify-between gap-3 mb-3 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-700">Add Service Tax</span>
            <span className="text-xs text-slate-500">
              Adds ₹150 to the bill
            </span>
          </div>
          <input
            type="checkbox"
            className="h-5 w-5 accent-rose-600"
            checked={enableServiceTax}
            onChange={(e) => setEnableServiceTax(e.target.checked)}
          />
        </label>
      )}
      <div className="flex-1 overflow-auto space-y-2">
        {cart.map(line=>(
          <div key={line.id} className="border rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{line.name}</div>
              <div className="text-sm text-gray-500">₹{line.price.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={()=>onDec(line.id)}><Minus size={16}/></Button>
              <div className="w-8 text-center">{line.qty}</div>
              <Button size="sm" variant="outline" onClick={()=>onInc(line.id)}><Plus size={16}/></Button>
              <Button size="sm" variant="outline" onClick={()=>onRemove(line.id)}><Trash2 size={16}/></Button>
            </div>
          </div>
        ))}
        {cart.length===0 && <div className="text-sm text-gray-500">No items yet</div>}
      </div>
      <div className="border-t pt-3 space-y-1">
        <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subTotal.toFixed(2)}</span></div>
        {serviceCharge > 0 && <div className="flex justify-between text-sm"><span>Service tax</span><span>₹{serviceCharge.toFixed(2)}</span></div>}
        <div className="flex justify-between text-sm"><span>GST ({(gstRate*100).toFixed(0)}%)</span><span>₹{gst.toFixed(2)}</span></div>
        <div className="flex justify-between text-lg font-semibold pt-1"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <Button variant="secondary" onClick={()=>handleAction('kot')}>KOT Print</Button>
        <Button variant="outline" onClick={()=>handleAction('draft')}>
          {diningType === 'Dine-in' ? 'Save Table' : 'Draft Order'}
        </Button>
        <Button variant="primary" className="hover:brightness-100" onClick={()=>handleAction('bill')}>Bill & Payment</Button>
        <Button className="bg-green-600 text-white hover:bg-green-500" onClick={()=>handleAction('print')}>Bill & Print</Button>
      </div>
    </aside>
  )
}
