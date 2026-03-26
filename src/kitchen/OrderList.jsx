import React from 'react'
import tw, { styled } from 'twin.macro'
import { Bell, Menu as MenuIcon, CheckCircle, ChevronDown } from 'lucide-react'

const SectionHeader = tw.div`flex items-center justify-between mb-4`
const SectionTitle = tw.h3`text-lg font-bold text-slate-800`
const FilterBtn = tw.button`flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50`

const OrderCard = tw.div`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow mb-4 relative overflow-hidden`
const OrderHeader = tw.div`flex items-center justify-between mb-4`
const OrderSource = styled.span(({ type }) => [
  tw`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2`,
  type === 'reception'
    ? tw`bg-rose-100 text-rose-700`
    : tw`bg-emerald-100 text-emerald-700`,
])
const StageBadge = styled.span(({ stage }) => [
  tw`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border`,
  stage === 'pending' && tw`bg-amber-50 text-amber-800 border-amber-200`,
  stage === 'cooking' && tw`bg-blue-50 text-blue-700 border-blue-200`,
  stage === 'finished' && tw`bg-emerald-50 text-emerald-700 border-emerald-200`,
])
const OrderTime = tw.span`text-xs font-medium text-slate-400`
const OrderItems = tw.div`space-y-2 mb-4`
const ItemRow = tw.div`flex items-start justify-between text-sm`
const ItemName = tw.span`font-medium text-slate-700`
const ItemQty = tw.span`font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded`
const OrderFooter = tw.div`flex items-center justify-between pt-4 border-t border-slate-50`
const OrderId = tw.span`text-xs font-bold text-slate-400`
const StageBtn = styled.button(({ active, variant }) => [
  tw`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border disabled:opacity-50 disabled:cursor-not-allowed`,
  !active && tw`bg-white text-slate-600 border-slate-200 hover:bg-slate-50`,
  active && variant === 'pending' && tw`bg-amber-600 text-white border-amber-600`,
  active && variant === 'cooking' && tw`bg-blue-600 text-white border-blue-600`,
  active && variant === 'finished' && tw`bg-emerald-600 text-white border-emerald-600`,
])

function normalizeStage(status) {
  if (!status) return 'pending'
  const s = String(status).toLowerCase()
  if (s === 'completed' || s === 'finished' || s === 'ready' || s === 'delivered' || s === 'paid') return 'finished'
  if (s === 'cooking' || s === 'preparing') return 'cooking'
  return 'pending'
}

export default function OrderList({ orders, title = 'Orders', onStageChange }) {
  return (
    <div>
      <SectionHeader>
        <SectionTitle>{title}</SectionTitle>
        <FilterBtn>
          All Orders <ChevronDown size={14} />
        </FilterBtn>
      </SectionHeader>

      {orders.map((order, i) => (
        <OrderCard key={i} className="group">
          {(() => {
            const stage = normalizeStage(order.status)
            return (
              <>
          <OrderHeader>
            <div className="flex items-center gap-3">
              <OrderSource type={order.type}>
                {order.type === 'reception' ? <Bell size={12} /> : <MenuIcon size={12} />}
                {order.source}
              </OrderSource>
              {order.table && (
                <span className="text-xs font-mono text-slate-400 border border-slate-200 px-1.5 rounded bg-slate-50">{order.table}</span>
              )}
              <StageBadge stage={stage}>{stage}</StageBadge>
            </div>
            <OrderTime>{order.time}</OrderTime>
          </OrderHeader>

          <OrderItems>
            {order.items.map((item, j) => (
              <ItemRow key={j}>
                <div className="flex items-center gap-2">
                  <ItemQty>{item.qty}x</ItemQty>
                  <ItemName>{item.name}</ItemName>
                </div>
              </ItemRow>
            ))}
          </OrderItems>

          <OrderFooter>
            <OrderId>{order.id}</OrderId>
            <div className="flex items-center gap-2">
              <StageBtn
                type="button"
                variant="pending"
                active={stage === 'pending'}
                disabled={stage === 'pending'}
                onClick={() => onStageChange?.(order, 'pending')}
              >
                Pending
              </StageBtn>
              <StageBtn
                type="button"
                variant="cooking"
                active={stage === 'cooking'}
                disabled={stage === 'cooking'}
                onClick={() => onStageChange?.(order, 'cooking')}
              >
                Cooking
              </StageBtn>
              <StageBtn
                type="button"
                variant="finished"
                active={stage === 'finished'}
                disabled={stage === 'finished'}
                onClick={() => onStageChange?.(order, 'completed')}
              >
                <CheckCircle size={14} className="inline mr-1" /> Finished
              </StageBtn>
            </div>
          </OrderFooter>
              </>
            )
          })()}
        </OrderCard>
      ))}
    </div>
  )
}

