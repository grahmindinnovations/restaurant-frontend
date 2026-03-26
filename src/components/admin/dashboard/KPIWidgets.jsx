import { Card, CardContent } from '../../ui/card'
import {
  IndianRupee,
  TrendingUp,
  ShoppingBag,
  Activity,
  ReceiptIndianRupee,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

const widgetConfig = [
  {
    key: 'totalRevenue',
    title: 'Total Revenue',
    icon: IndianRupee,
    format: 'currency',
  },
  {
    key: 'netProfit',
    title: 'Net Profit',
    icon: ReceiptIndianRupee,
    format: 'currency',
  },
  {
    key: 'growthPercent',
    title: 'Growth %',
    icon: TrendingUp,
    format: 'percent',
  },
  {
    key: 'totalOrders',
    title: 'Total Orders',
    icon: ShoppingBag,
    format: 'number',
  },
  {
    key: 'activeOrders',
    title: 'Active Orders',
    icon: Activity,
    format: 'number',
  },
  {
    key: 'todaySales',
    title: "Today's Sales",
    icon: IndianRupee,
    format: 'currency',
  },
  {
    key: 'monthlySales',
    title: 'Monthly Sales',
    icon: IndianRupee,
    format: 'currency',
  },
  {
    key: 'expenseSummary',
    title: 'Expense Summary',
    icon: ReceiptIndianRupee,
    format: 'currency',
  },
]

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export default function KPIWidgets({ kpis }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {widgetConfig.map((w) => {
        const Icon = w.icon
        const raw = kpis?.[w.key] ?? 0
        let value = raw
        let suffix = ''
        if (w.format === 'currency') {
          value = currencyFormatter.format(raw || 0)
        } else if (w.format === 'percent') {
          value = `${raw?.toFixed ? raw.toFixed(1) : Number(raw || 0).toFixed(1)}%`
        } else {
          value = raw?.toLocaleString
            ? raw.toLocaleString('en-IN')
            : new Intl.NumberFormat('en-IN').format(Number(raw || 0))
        }

        const trendPositive = w.key !== 'expenseSummary'
          ? Number(raw || 0) >= 0
          : Number(raw || 0) <= 0

        return (
          <Card
            key={w.key}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
                  {w.title}
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{value}{suffix}</div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                  {trendPositive ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
                  )}
                  <span>{trendPositive ? 'Healthy trend' : 'Monitor closely'}</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-rose-600/10 flex items-center justify-center text-rose-700">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}

