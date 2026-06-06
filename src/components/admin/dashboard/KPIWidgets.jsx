import { Card, CardContent } from '../../ui/card'
import {
  IndianRupee,
  ShoppingBag,
  Activity,
  ReceiptIndianRupee,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import { adminCard } from '../components/adminUi'

const widgetConfig = [
  { key: 'todaySales', title: "Today's sales", icon: IndianRupee, format: 'currency' },
  { key: 'monthlySales', title: 'This month', icon: IndianRupee, format: 'currency' },
  { key: 'totalRevenue', title: 'Total revenue', icon: IndianRupee, format: 'currency' },
  { key: 'netProfit', title: 'Net profit', icon: ReceiptIndianRupee, format: 'currency' },
  { key: 'expenseSummary', title: 'Expenses', icon: ReceiptIndianRupee, format: 'currency' },
  { key: 'totalOrders', title: 'Orders', icon: ShoppingBag, format: 'number' },
  { key: 'activeOrders', title: 'Active', icon: Activity, format: 'number' },
  { key: 'staffCount', title: 'Staff', icon: Users, format: 'number' },
  { key: 'menuItemCount', title: 'Menu items', icon: UtensilsCrossed, format: 'number' },
]

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export default function KPIWidgets({ kpis }) {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
      {widgetConfig.map((w) => {
        const Icon = w.icon
        const raw = kpis?.[w.key] ?? 0
        let value
        if (w.format === 'currency') {
          value = currencyFormatter.format(raw || 0)
        } else {
          value = new Intl.NumberFormat('en-IN').format(Number(raw || 0))
        }

        return (
          <Card key={w.key} className={adminCard}>
            <CardContent className="p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide truncate">
                  {w.title}
                </div>
                <div className="mt-1 text-sm font-semibold text-neutral-900 tabular-nums">{value}</div>
              </div>
              <div className="h-8 w-8 shrink-0 rounded-md border border-neutral-200 bg-neutral-50 flex items-center justify-center text-neutral-600">
                <Icon className="h-3.5 w-3.5" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
