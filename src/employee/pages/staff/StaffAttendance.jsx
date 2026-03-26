import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../../services/api'

function pad2(n) {
  const x = Number(n)
  return x < 10 ? `0${x}` : String(x)
}

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function nowHHMM() {
  const d = new Date()
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function toMinutes(val) {
  const m = String(val || '').match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const h = Number(m[1])
  const mm = Number(m[2])
  if (!Number.isFinite(h) || !Number.isFinite(mm)) return null
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null
  return h * 60 + mm
}

function lateMinutes(checkIn, shiftStart) {
  const cin = toMinutes(checkIn)
  const ss = toMinutes(shiftStart)
  if (cin == null || ss == null) return 0
  return Math.max(0, cin - ss)
}

export default function StaffAttendance() {
  const [date, setDate] = useState(() => todayKey())
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState(null)
  const [staff, setStaff] = useState([])
  const [recordsByStaff, setRecordsByStaff] = useState({})
  const [draftShift, setDraftShift] = useState({})

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [staffRes, attRes] = await Promise.all([
          apiFetch('/api/staff'),
          apiFetch(`/api/attendance?date=${encodeURIComponent(date)}`),
        ])

        const staffList = Array.isArray(staffRes?.staff) ? staffRes.staff : []
        const recs = Array.isArray(attRes?.records) ? attRes.records : []

        const byStaff = {}
        for (const r of recs) {
          if (r?.staff_id) byStaff[String(r.staff_id)] = r
        }

        const shiftMap = {}
        for (const s of staffList) {
          shiftMap[String(s.id)] = {
            shift_start: String(s.shift_start || '10:00'),
            shift_end: String(s.shift_end || '18:00'),
          }
        }

        if (cancelled) return
        setStaff(staffList)
        setRecordsByStaff(byStaff)
        setDraftShift(shiftMap)
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load attendance')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [date])

  const rows = useMemo(() => {
    return staff.map((s) => {
      const id = String(s.id)
      const r = recordsByStaff[id] || null
      const shift = draftShift[id] || { shift_start: '10:00', shift_end: '18:00' }
      const checkIn = String(r?.check_in || '')
      const shiftStart = String(r?.shift_start || shift.shift_start || '10:00')
      const lm = r?.late_minutes != null ? Number(r.late_minutes) : lateMinutes(checkIn, shiftStart)
      return {
        id,
        name: s.name || '',
        role: s.role || '',
        status: String(r?.status || (checkIn ? 'Present' : 'Absent')),
        shiftStart,
        shiftEnd: String(r?.shift_end || shift.shift_end || '18:00'),
        checkIn,
        checkOut: String(r?.check_out || ''),
        late: Number.isFinite(lm) ? lm : 0,
      }
    })
  }, [staff, recordsByStaff, draftShift])

  const setShiftField = (staffId, field, value) => {
    setDraftShift((prev) => ({
      ...prev,
      [staffId]: {
        ...(prev[staffId] || { shift_start: '10:00', shift_end: '18:00' }),
        [field]: value,
      },
    }))
  }

  const saveShift = async (staffId) => {
    const next = draftShift[staffId]
    if (!next) return
    setSavingId(staffId)
    setError(null)
    try {
      await apiFetch(`/api/staff/${encodeURIComponent(staffId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          shift_start: String(next.shift_start || '10:00'),
          shift_end: String(next.shift_end || '18:00'),
        }),
      })
    } catch (e) {
      setError(e?.message || 'Failed to save shift')
    } finally {
      setSavingId(null)
    }
  }

  const mark = async (staffId, action, time) => {
    setSavingId(staffId)
    setError(null)
    try {
      const shift = draftShift[staffId] || { shift_start: '10:00', shift_end: '18:00' }
      const res = await apiFetch('/api/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({
          staffId,
          date,
          action,
          time: time || nowHHMM(),
          shiftStart: shift.shift_start,
          shiftEnd: shift.shift_end,
        }),
      })
      const rec = res?.record
      if (rec?.staff_id) {
        setRecordsByStaff((prev) => ({ ...prev, [String(rec.staff_id)]: rec }))
      }
    } catch (e) {
      setError(e?.message || 'Failed to mark attendance')
    } finally {
      setSavingId(null)
    }
  }

  const setStatus = async (staffId, status) => {
    setSavingId(staffId)
    setError(null)
    try {
      const shift = draftShift[staffId] || { shift_start: '10:00', shift_end: '18:00' }
      const res = await apiFetch('/api/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({
          staffId,
          date,
          status,
          shiftStart: shift.shift_start,
          shiftEnd: shift.shift_end,
        }),
      })
      const rec = res?.record
      if (rec?.staff_id) {
        setRecordsByStaff((prev) => ({ ...prev, [String(rec.staff_id)]: rec }))
      }
    } catch (e) {
      setError(e?.message || 'Failed to update status')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Staff Attendance</h1>
          <p className="text-sm text-muted-foreground">
            Mark check-in/check-out time and manage shift schedule.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground">Date</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-500">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500">Shift</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500">Check In</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500">Check Out</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-500">Late</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-500">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((r) => {
                const shiftDraft = draftShift[r.id] || { shift_start: '10:00', shift_end: '18:00' }
                const busy = savingId === r.id
                return (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-800">{r.name}</td>
                    <td className="px-4 py-3 text-slate-600">{r.role}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={shiftDraft.shift_start}
                          onChange={(e) => setShiftField(r.id, 'shift_start', e.target.value)}
                          className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-sm outline-none"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                          type="time"
                          value={shiftDraft.shift_end}
                          onChange={(e) => setShiftField(r.id, 'shift_end', e.target.value)}
                          className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-sm outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => saveShift(r.id)}
                          disabled={busy}
                          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-60"
                        >
                          {busy ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-800">{r.checkIn || '—'}</span>
                        <button
                          type="button"
                          onClick={() => mark(r.id, 'check_in')}
                          disabled={busy}
                          className="h-9 px-3 rounded-xl bg-rose-600 text-white font-semibold hover:opacity-90 disabled:opacity-60"
                        >
                          In
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-800">{r.checkOut || '—'}</span>
                        <button
                          type="button"
                          onClick={() => mark(r.id, 'check_out')}
                          disabled={busy}
                          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-60"
                        >
                          Out
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-800">
                      {r.late > 0 ? `${r.late}m` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={r.status}
                        onChange={(e) => setStatus(r.id, e.target.value)}
                        disabled={busy}
                        className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-sm outline-none disabled:opacity-60"
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Half Day">Half Day</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => mark(r.id, 'check_in', nowHHMM())}
                          className="h-9 px-3 rounded-xl border border-transparent bg-slate-900 text-white font-semibold hover:opacity-90 disabled:opacity-60"
                        >
                          Now
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  No staff found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
