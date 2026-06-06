import { Button } from '../../components/ui/button'
import { Select } from '../../components/ui/select'
import { Trash2, Minus, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

export default function OrderPanel({
  cart,
  onInc,
  onDec,
  onRemove,
  gstRate = 0.05,
  gstEnabled = true,
  serviceChargeAmount = 150,
  serviceChargeEnabled = true,
  serviceChargeDineInOnly = true,
  orderId,
  diningType,
  onDiningChange,
  table,
  onTableChange,
  onPlaceOrder,
  tables,
  continuingOrder = false,
  activeOrderTableId = null,
}) {
  const subTotal = cart.reduce((s,i)=>s+i.qty*i.price,0)
  const [enableServiceTax, setEnableServiceTax] = useState(false)

  const serviceTaxEligible =
    !serviceChargeDineInOnly || diningType === 'Dine-in'
  const serviceCharge = useMemo(() => {
    if (!serviceChargeEnabled) return 0
    if (!enableServiceTax) return 0
    if (!serviceTaxEligible) return 0
    return Math.max(0, Number(serviceChargeAmount) || 0)
  }, [enableServiceTax, serviceTaxEligible, serviceChargeEnabled, serviceChargeAmount])

  const effectiveGstRate = gstEnabled ? Math.max(0, Number(gstRate) || 0) : 0
  const gst = Math.round(((subTotal + serviceCharge) * effectiveGstRate) * 100) / 100
  const total = Math.round(subTotal + serviceCharge + gst)
  const tableDisabled = diningType !== 'Dine-in'
  const tableOptions = Array.isArray(tables) ? tables : []

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
    <aside className="w-full min-h-screen bg-white border-l border-neutral-200 p-3 flex flex-col">
      <div className="text-sm font-medium text-neutral-500">Current order</div>
      <div className="text-lg font-semibold text-neutral-900 mt-0.5 mb-4">
        {orderId ? `#${orderId}` : 'New'}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <Select
          value={diningType}
          onChange={e=>onDiningChange?.(e.target.value)}
          className="rounded-xl border-neutral-200"
        >
          <option value="" disabled>Dining</option>
          <option value="Dine-in">Dine-in</option>
          <option value="Takeaway">Takeaway</option>
        </Select>
        <Select
          value={table}
          onChange={e=>onTableChange?.(e.target.value)}
          disabled={tableDisabled}
          className="rounded-xl border-neutral-200"
        >
          <option value="" disabled>
            {tableOptions.length === 0 ? 'No tables' : 'Table'}
          </option>
          {tableOptions.map(t => {
            const isBlocked =
              t.status === 'occupied' &&
              table !== t.id &&
              String(activeOrderTableId || '') !== String(t.id)
            const disabled = isBlocked
            const suffix = t.status === 'available' ? '' : ` · ${t.status}`
            return (
              <option key={t.id} value={t.id} disabled={disabled}>{t.id}{suffix}</option>
            )
          })}
        </Select>
      </div>

      {serviceChargeEnabled && serviceTaxEligible && serviceChargeAmount > 0 && (
        <label className="flex items-center justify-between gap-3 mb-3 px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50">
          <span className="text-sm text-neutral-700">
            Service charge (₹{Number(serviceChargeAmount).toFixed(0)})
          </span>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-neutral-300 accent-neutral-900"
            checked={enableServiceTax}
            onChange={(e) => setEnableServiceTax(e.target.checked)}
          />
        </label>
      )}

      <div className="flex-1 overflow-auto space-y-2 min-h-[8rem]">
        {cart.map(line=>(
          <div key={line.id} className="rounded-xl border border-neutral-200 p-3 flex items-center justify-between">
            <div className="min-w-0">
              <div className="font-medium text-neutral-900 truncate">{line.name}</div>
              <div className="text-sm text-neutral-500">₹{line.price.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button size="sm" variant="outline" onClick={()=>onDec(line.id)}><Minus size={14}/></Button>
              <span className="w-6 text-center text-sm font-medium">{line.qty}</span>
              <Button size="sm" variant="outline" onClick={()=>onInc(line.id)}><Plus size={14}/></Button>
              <Button size="sm" variant="ghost" onClick={()=>onRemove(line.id)}><Trash2 size={14}/></Button>
            </div>
          </div>
        ))}
        {cart.length===0 && (
          <p className="text-sm text-neutral-500 py-8 text-center">Add items from the menu</p>
        )}
      </div>

      <div className="border-t border-neutral-200 pt-3 space-y-1 text-sm text-neutral-600">
        <div className="flex justify-between"><span>Subtotal</span><span>₹{subTotal.toFixed(2)}</span></div>
        {serviceCharge > 0 && (
          <div className="flex justify-between">
            <span>Service</span>
            <span>₹{serviceCharge.toFixed(2)}</span>
          </div>
        )}
        {effectiveGstRate > 0 && (
          <div className="flex justify-between">
            <span>GST ({(effectiveGstRate * 100).toFixed(0)}%)</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-semibold text-neutral-900 pt-1">
          <span>Total</span><span>₹{total.toFixed(0)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button variant="default" className="col-span-2 rounded-xl" onClick={()=>handleAction('kot')}>
          {continuingOrder ? 'Send more to KOT' : 'Send KOT'}
        </Button>
        <Button variant="outline" className="rounded-xl" onClick={()=>handleAction('draft')}>
          {diningType === 'Dine-in' ? 'Save table' : 'Save draft'}
        </Button>
        <Button variant="outline" className="rounded-xl" onClick={()=>handleAction('bill')}>
          Bill
        </Button>
        <Button variant="outline" className="col-span-2 rounded-xl" onClick={()=>handleAction('print')}>
          Bill & print
        </Button>
      </div>
    </aside>
  )
}
