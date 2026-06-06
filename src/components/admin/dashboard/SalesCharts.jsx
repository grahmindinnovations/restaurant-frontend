import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { adminCard } from '../components/adminUi'

function formatNumber(value) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(value || 0))
}

function SimpleTooltip({ label, payload, labelFormatter }) {
  if (!payload || payload.length === 0) return null
  return (
    <div className="bg-white border border-neutral-200 rounded-md px-2.5 py-2 text-xs shadow-sm">
      <div className="font-semibold text-neutral-900 mb-1">
        {labelFormatter ? labelFormatter(label) : label}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-neutral-600">
          <span className="h-2 w-2 rounded-full bg-neutral-900" />
          <span>{p.name || p.dataKey}:</span>
          <span className="font-semibold text-neutral-900">{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function EmptyChart({ message }) {
  return (
    <div className="h-52 flex items-center justify-center text-xs text-neutral-400">{message}</div>
  )
}

export default function SalesCharts({ charts, showRankings = true }) {
  const dailySales = charts?.dailySales || []
  const monthlyRevenue = charts?.monthlyRevenue || []
  const productPerformance = charts?.productPerformance || []
  const staffProductivity = charts?.staffProductivity || []

  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-3">
      <Card className={adminCard}>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold text-neutral-900">
            Daily sales (14 days)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 h-56">
          {dailySales.length === 0 ? (
            <EmptyChart message="No paid orders in this period yet." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatNumber} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<SimpleTooltip labelFormatter={(d) => d} />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Sales"
                  stroke="#171717"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className={adminCard}>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold text-neutral-900">
            Monthly revenue (12 months)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 h-56">
          {monthlyRevenue.length === 0 ? (
            <EmptyChart message="No monthly revenue data yet." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="month" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatNumber} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<SimpleTooltip labelFormatter={(m) => m} />} />
                <Bar dataKey="value" name="Revenue" fill="#171717" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {showRankings && (
        <Card className={`${adminCard} xl:col-span-2`}>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold text-neutral-900">
              Top products & staff orders
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                Top products
              </p>
              <div className="space-y-1">
                {productPerformance.map((p) => (
                  <div key={p.name} className="flex justify-between text-xs">
                    <span className="text-neutral-700 truncate max-w-[12rem]">{p.name}</span>
                    <span className="font-medium text-neutral-900 tabular-nums">
                      {formatNumber(p.quantity)}
                    </span>
                  </div>
                ))}
                {productPerformance.length === 0 && (
                  <p className="text-xs text-neutral-400">No product data yet.</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                Staff (orders tagged)
              </p>
              <div className="space-y-1">
                {staffProductivity.map((s) => (
                  <div key={s.staffId} className="flex justify-between text-xs">
                    <span className="text-neutral-700 truncate max-w-[12rem]">{s.staffName}</span>
                    <span className="font-medium text-neutral-900 tabular-nums">{s.orders}</span>
                  </div>
                ))}
                {staffProductivity.length === 0 && (
                  <p className="text-xs text-neutral-400">No staff-tagged orders yet.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
