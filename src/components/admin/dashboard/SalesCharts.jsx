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

function formatNumber(value) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(
    Number(value || 0)
  )
}

function SimpleTooltip({ label, payload, labelFormatter }) {
  if (!payload || payload.length === 0) return null
  return (
    <div className="bg-white/95 border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-xs">
      <div className="font-semibold text-slate-800 mb-1">
        {labelFormatter ? labelFormatter(label) : label}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-slate-600">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color || '#e11d48' }}
          />
          <span>{p.name || p.dataKey}:</span>
          <span className="font-semibold">{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function SalesCharts({ charts }) {
  const dailySales = charts?.dailySales || []
  const monthlyRevenue = charts?.monthlyRevenue || []
  const yearlyGrowth = charts?.yearlyGrowth || []
  const productPerformance = charts?.productPerformance || []
  const staffProductivity = charts?.staffProductivity || []

  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Daily Sales (Last 14 days)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={formatNumber}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<SimpleTooltip labelFormatter={(d) => `Date: ${d}`} />}
              />
              <Line
                type="monotone"
                dataKey="value"
                name="Sales"
                stroke="#e11d48"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Monthly Revenue (Last 12 months)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={formatNumber}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<SimpleTooltip labelFormatter={(m) => `Month: ${m}`} />}
              />
              <Bar dataKey="value" name="Revenue" fill="#0f172a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Yearly Growth</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yearlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={formatNumber}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<SimpleTooltip labelFormatter={(y) => `Year: ${y}`} />}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Product & Staff Performance</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
              Top Products
            </div>
            <div className="space-y-1.5">
              {productPerformance.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-slate-700 truncate max-w-[10rem]">
                    {p.name}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {formatNumber(p.quantity)}
                  </span>
                </div>
              ))}
              {productPerformance.length === 0 && (
                <div className="text-xs text-slate-400">No product data yet.</div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
              Staff Productivity
            </div>
            <div className="space-y-1.5">
              {staffProductivity.map((s) => (
                <div
                  key={s.staffId}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-slate-700 truncate max-w-[10rem]">
                    {s.staffName}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {formatNumber(s.orders)} orders
                  </span>
                </div>
              ))}
              {staffProductivity.length === 0 && (
                <div className="text-xs text-slate-400">No staff data yet.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

