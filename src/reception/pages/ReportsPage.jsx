import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../ReceptionSidebar'
import Header from '../../layouts/Header'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { apiFetch } from '../../services/api'

function formatMoney(amount) {
  const n = Number(amount) || 0
  return `₹${n.toFixed(0)}`
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [expenseCategory, setExpenseCategory] = useState('General')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseNote, setExpenseNote] = useState('')

  const categories = useMemo(
    () => ['General', 'Rent', 'Salary', 'Electricity', 'Gas', 'Supplies', 'Maintenance', 'Delivery', 'Other'],
    []
  )

  const load = async () => {
    setLoading(true)
    try {
      const [s, e] = await Promise.all([
        apiFetch('/api/reports/summary'),
        apiFetch('/api/expenses'),
      ])
      setSummary(s)
      setExpenses(Array.isArray(e.expenses) ? e.expenses : [])
    } catch (err) {
      console.error('Reports load error:', err)
      alert('Failed to load reports data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const addExpense = async () => {
    const amount = Number(expenseAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Enter a valid expense amount.')
      return
    }
    setSaving(true)
    try {
      await apiFetch('/api/expenses', {
        method: 'POST',
        body: JSON.stringify({
          category: expenseCategory,
          amount,
          note: expenseNote,
        }),
      })
      setExpenseAmount('')
      setExpenseNote('')
      await load()
    } catch (err) {
      console.error('Expense create error:', err)
      alert('Failed to add expense.')
    } finally {
      setSaving(false)
    }
  }

  const deleteExpense = async (id) => {
    if (!id) return
    setDeletingId(id)
    try {
      await apiFetch(`/api/expenses/${id}`, { method: 'DELETE' })
      setExpenses((prev) => prev.filter((x) => x.id !== id))
      await load()
    } catch (err) {
      console.error('Expense delete error:', err)
      alert('Failed to delete expense.')
    } finally {
      setDeletingId(null)
    }
  }

  const sales = summary?.sales || {}
  const costs = summary?.costs || {}
  const profit = summary?.profit || {}

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[16rem_1fr] bg-slate-50">
      <Sidebar />
      <div className="flex flex-col min-w-0">
        <Header
          title={<span>Reception <span className="text-rose-700">Reports</span></span>}
        />

        <main className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <Card className="rounded-2xl border border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Sales Orders</CardTitle></CardHeader>
              <CardContent className="pt-2">
                <div className="text-3xl font-bold text-slate-900">{loading ? '—' : (sales.ordersCount || 0)}</div>
                <div className="text-xs text-slate-500 mt-1">Billed / Paid / Completed</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Total Sales</CardTitle></CardHeader>
              <CardContent className="pt-2">
                <div className="text-3xl font-bold text-slate-900">{loading ? '—' : formatMoney(sales.revenue)}</div>
                <div className="text-xs text-slate-500 mt-1">All time</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border border-slate-200 shadow-sm">
              <CardHeader><CardTitle>COGS (Food Cost)</CardTitle></CardHeader>
              <CardContent className="pt-2">
                <div className="text-3xl font-bold text-slate-900">{loading ? '—' : formatMoney(costs.cogs)}</div>
                <div className="text-xs text-slate-500 mt-1">Uses item cost_price</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Total Expenses</CardTitle></CardHeader>
              <CardContent className="pt-2">
                <div className="text-3xl font-bold text-slate-900">{loading ? '—' : formatMoney(costs.expenses)}</div>
                <div className="text-xs text-slate-500 mt-1">All time</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Net Profit</CardTitle></CardHeader>
              <CardContent className="pt-2">
                <div className="text-3xl font-bold text-slate-900">{loading ? '—' : formatMoney(profit.net)}</div>
                <div className="text-xs text-slate-500 mt-1">Sales − COGS − Expenses</div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
              <div>
                <div className="text-lg font-bold text-slate-900">Expenses</div>
                <div className="text-xs text-slate-500">Add daily expenses to get accurate profit.</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[12rem_10rem_1fr_auto] gap-2 w-full lg:w-auto">
                <Select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
                <Input
                  placeholder="Amount"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                />
                <Input
                  placeholder="Note (optional)"
                  value={expenseNote}
                  onChange={(e) => setExpenseNote(e.target.value)}
                />
                <Button onClick={addExpense} disabled={saving}>
                  {saving ? 'Saving...' : 'Add'}
                </Button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-slate-500">Category</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-500">Note</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-500">Amount</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {expenses.map((x) => (
                    <tr key={x.id}>
                      <td className="px-4 py-2 text-slate-700">{x.category || 'General'}</td>
                      <td className="px-4 py-2 text-slate-500">{x.note || '—'}</td>
                      <td className="px-4 py-2 text-right font-semibold text-slate-800">{formatMoney(x.amount)}</td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deletingId === x.id}
                          onClick={() => deleteExpense(x.id)}
                        >
                          {deletingId === x.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!loading && expenses.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-center text-slate-500" colSpan={4}>
                        No expenses added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
