import { useCallback, useEffect, useMemo, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import Sidebar from '../ReceptionSidebar'

import Header from '../../layouts/Header'

import { Button } from '../../components/ui/button'

import { Input } from '../../components/ui/input'

import { Select } from '../../components/ui/select'

import { apiFetch } from '../../services/api'

import PageNotice from '../components/PageNotice'

import { useReceptionAuth } from '../hooks/useReceptionAuth'

import { formatInr } from '../utils/orderTotals'



function formatMoney(amount) {

  return formatInr(Number(amount) || 0)

}



function formatExpenseDate(value) {

  if (!value) return '—'

  const dt =

    value?.toDate?.() ||

    (value instanceof Date ? value : typeof value === 'string' ? new Date(value) : null)

  if (!dt || Number.isNaN(dt.getTime())) return '—'

  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

}



function expenseInPeriod(expense, period) {

  if (period === 'all') return true

  const raw = expense?.createdAt || expense?.updatedAt

  const dt =

    raw?.toDate?.() ||

    (raw instanceof Date ? raw : raw ? new Date(raw) : null)

  if (!dt || Number.isNaN(dt.getTime())) return false

  const now = new Date()

  if (period === 'today') {

    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return dt >= start

  }

  if (period === 'month') {

    const start = new Date(now.getFullYear(), now.getMonth(), 1)

    return dt >= start

  }

  return true

}



const PERIOD_OPTIONS = [

  { id: 'today', label: 'Today' },

  { id: 'month', label: 'This month' },

  { id: 'all', label: 'All time' },

]



const DEFAULT_CATEGORIES = [

  'General',

  'Rent',

  'Salary',

  'Electricity',

  'Gas',

  'Supplies',

  'Maintenance',

  'Delivery',

  'Other',

]



export default function ReportsPage() {

  const navigate = useNavigate()

  const authReady = useReceptionAuth()

  const [loading, setLoading] = useState(true)

  const [period, setPeriod] = useState('today')

  const [summary, setSummary] = useState(null)

  const [expenses, setExpenses] = useState([])

  const [saving, setSaving] = useState(false)

  const [deletingId, setDeletingId] = useState(null)

  const [notice, setNotice] = useState(null)



  const [expenseCategory, setExpenseCategory] = useState('General')

  const [expenseAmount, setExpenseAmount] = useState('')

  const [expenseNote, setExpenseNote] = useState('')



  const categories = useMemo(() => {

    const fromData = expenses.map((x) => x.category).filter(Boolean)

    return Array.from(new Set([...DEFAULT_CATEGORIES, ...fromData]))

  }, [expenses])



  const load = useCallback(async () => {

    setLoading(true)

    setNotice(null)

    try {

      const [s, e] = await Promise.all([

        apiFetch(`/api/reports/summary?period=${encodeURIComponent(period)}`),

        apiFetch('/api/expenses'),

      ])

      setSummary(s)

      setExpenses(Array.isArray(e.expenses) ? e.expenses : [])

    } catch (err) {

      console.error('Reports load error:', err)

      const msg = String(err?.message || '')

      if (msg.includes('401')) {

        navigate('/login', { replace: true })

      } else {

        setNotice({ type: 'error', message: 'Failed to load reports. Please try again.' })

      }

    } finally {

      setLoading(false)

    }

  }, [navigate, period])



  useEffect(() => {

    if (!authReady) return

    load()

  }, [authReady, load])



  const visibleExpenses = useMemo(

    () => expenses.filter((x) => expenseInPeriod(x, period)),

    [expenses, period],

  )



  const addExpense = async () => {

    const amount = Number(expenseAmount)

    if (!Number.isFinite(amount) || amount <= 0) {

      setNotice({ type: 'error', message: 'Enter a valid expense amount.' })

      return

    }

    setSaving(true)

    setNotice(null)

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

      setNotice({ type: 'success', message: 'Expense added.' })

    } catch (err) {

      console.error('Expense create error:', err)

      setNotice({ type: 'error', message: 'Failed to add expense. Please try again.' })

    } finally {

      setSaving(false)

    }

  }



  const deleteExpense = async (id) => {

    if (!id) return

    setDeletingId(id)

    setNotice(null)

    try {

      await apiFetch(`/api/expenses/${id}`, { method: 'DELETE' })

      await load()

      setNotice({ type: 'success', message: 'Expense deleted.' })

    } catch (err) {

      console.error('Expense delete error:', err)

      setNotice({ type: 'error', message: 'Failed to delete expense. Please try again.' })

    } finally {

      setDeletingId(null)

    }

  }



  const sales = summary?.sales || {}

  const costs = summary?.costs || {}

  const profit = summary?.profit || {}

  const periodLabel = PERIOD_OPTIONS.find((p) => p.id === period)?.label || period



  const stats = [

    { label: 'Paid orders', value: loading ? '…' : String(sales.ordersCount || 0) },

    { label: 'Revenue', value: loading ? '…' : formatMoney(sales.revenue) },

    { label: 'Food cost', value: loading ? '…' : formatMoney(costs.cogs) },

    { label: 'Expenses', value: loading ? '…' : formatMoney(costs.expenses) },

    { label: 'Net profit', value: loading ? '…' : formatMoney(profit.net) },

  ]



  return (

    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[14rem_1fr] bg-neutral-100">

      <Sidebar />

      <div className="flex flex-col min-w-0">

        <Header title="Reports" showUserMenu showNotifications />



        <main className="p-2 md:p-3 space-y-2">

          <PageNotice message={notice?.message} />



          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-1.5">

            <div className="flex gap-1">

              {PERIOD_OPTIONS.map((p) => (

                <Button

                  key={p.id}

                  variant={period === p.id ? 'default' : 'outline'}

                  size="sm"

                  className="h-7 px-2 text-[11px] rounded-md"

                  onClick={() => setPeriod(p.id)}

                >

                  {p.label}

                </Button>

              ))}

            </div>

            <span className="text-[11px] text-neutral-500 hidden sm:inline">

              {periodLabel} · paid orders only

            </span>

            {stats.map((s, i) => (

              <span key={s.label} className="text-[11px] text-neutral-600 flex items-center gap-1">

                {i > 0 && <span className="text-neutral-300 mr-1 hidden lg:inline">|</span>}

                {s.label}{' '}

                <span className="font-semibold text-neutral-900">{s.value}</span>

              </span>

            ))}

            <Button

              variant="outline"

              size="sm"

              className="h-7 px-2 text-[11px] rounded-md ml-auto"

              onClick={load}

              disabled={loading}

            >

              {loading ? 'Refreshing…' : 'Refresh'}

            </Button>

          </div>



          <p className="text-[11px] text-neutral-500 px-0.5">

            Revenue uses the same totals as Billing (items + GST + service). KOT and unpaid bills

            are excluded. Food cost = qty × cost per dish — set in Admin → Inventory → Items Database.

          </p>



          <div className="rounded-lg border border-neutral-200 bg-white p-2 md:p-3">

            <div className="flex flex-wrap items-end gap-1.5 mb-2">

              <span className="text-xs font-semibold text-neutral-900 mr-1">Add expense</span>

              <Select

                value={expenseCategory}

                onChange={(e) => setExpenseCategory(e.target.value)}

                className="h-7 w-[7rem] text-xs rounded-md border-neutral-200 px-2"

              >

                {categories.map((c) => (

                  <option key={c} value={c}>

                    {c}

                  </option>

                ))}

              </Select>

              <Input

                placeholder="Amount"

                value={expenseAmount}

                onChange={(e) => setExpenseAmount(e.target.value)}

                className="h-7 w-24 text-xs rounded-md border-neutral-200 px-2"

                type="number"

                min="0"

                step="1"

              />

              <Input

                placeholder="Note"

                value={expenseNote}

                onChange={(e) => setExpenseNote(e.target.value)}

                className="h-7 flex-1 min-w-[6rem] text-xs rounded-md border-neutral-200 px-2"

              />

              <Button

                variant="default"

                size="sm"

                className="h-7 px-3 text-[11px] rounded-md"

                onClick={addExpense}

                disabled={saving}

              >

                {saving ? 'Saving…' : 'Add'}

              </Button>

            </div>



            <div className="overflow-x-auto">

              <table className="min-w-full text-sm">

                <thead className="bg-neutral-50 border-b border-neutral-200">

                  <tr className="text-left text-[11px] font-medium text-neutral-500 uppercase">

                    <th className="px-3 py-2">Date</th>

                    <th className="px-3 py-2">Category</th>

                    <th className="px-3 py-2">Note</th>

                    <th className="px-3 py-2 text-right">Amount</th>

                    <th className="px-3 py-2 text-right">Action</th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-neutral-100">

                  {loading && visibleExpenses.length === 0 ? (

                    <tr>

                      <td colSpan={5} className="px-3 py-8 text-center text-neutral-500 text-sm">

                        Loading expenses…

                      </td>

                    </tr>

                  ) : visibleExpenses.length === 0 ? (

                    <tr>

                      <td colSpan={5} className="px-3 py-8 text-center text-neutral-500 text-sm">

                        No expenses for {periodLabel.toLowerCase()}. Add one above.

                      </td>

                    </tr>

                  ) : (

                    visibleExpenses.map((x) => (

                      <tr key={x.id} className="hover:bg-neutral-50/80">

                        <td className="px-3 py-2 text-neutral-500 text-xs whitespace-nowrap">

                          {formatExpenseDate(x.createdAt)}

                        </td>

                        <td className="px-3 py-2 text-neutral-800">{x.category || 'General'}</td>

                        <td className="px-3 py-2 text-neutral-500">{x.note || '—'}</td>

                        <td className="px-3 py-2 text-right font-medium text-neutral-900">

                          {formatMoney(x.amount)}

                        </td>

                        <td className="px-3 py-2 text-right">

                          <Button

                            variant="outline"

                            size="sm"

                            className="h-7 text-[11px] rounded-md"

                            disabled={deletingId === x.id}

                            onClick={() => deleteExpense(x.id)}

                          >

                            {deletingId === x.id ? '…' : 'Delete'}

                          </Button>

                        </td>

                      </tr>

                    ))

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


