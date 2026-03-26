import { Link } from 'react-router-dom'
import { Users, FilePlus2, CalendarCheck, Banknote, UsersRound, Clock } from 'lucide-react'

const Card = ({ title, desc, to, icon: Icon }) => (
  <Link
    to={to}
    className="group relative bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden block"
  >
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
        <Icon size={22} />
      </div>
      <div className="flex-1 pt-0.5">
        <h4 className="text-[15px] font-bold text-slate-800 mb-1 group-hover:text-rose-700 transition-colors">
          {title}
        </h4>
        <p className="text-[13px] text-slate-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  </Link>
)

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage staff records, attendance, shifts and payroll.
          </p>
        </div>
        <div className="hidden rounded-xl border bg-card px-3 py-2 text-xs text-muted-foreground shadow-sm md:block">
          Staff Management
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card
          title="Staff List"
          desc="View and manage staff directory"
          to="/employee/staff/list"
          icon={Users}
        />
        <Card
          title="Staff Registry"
          desc="Add and onboard new staff"
          to="/employee/staff/add"
          icon={FilePlus2}
        />
        <Card
          title="Attendance"
          desc="Daily attendance and logs"
          to="/employee/staff/attendance"
          icon={CalendarCheck}
        />
        <Card
          title="Payroll"
          desc="Manage salary and payroll records"
          to="/employee/staff/payroll"
          icon={Banknote}
        />
        <Card
          title="Roles"
          desc="Define roles and access"
          to="/employee/staff/roles"
          icon={UsersRound}
        />
        <Card
          title="Shift Scheduling"
          desc="Create shifts and rosters"
          to="/employee/staff/shift"
          icon={Clock}
        />
      </div>
    </div>
  )
}
