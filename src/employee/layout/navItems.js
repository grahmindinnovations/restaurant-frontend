import { LayoutGrid, Users, FilePlus2, CalendarCheck, Banknote, Shield, Clock } from 'lucide-react'

export const navItems = [
  { label: 'Dashboard', to: '/employee/dashboard', icon: LayoutGrid },
  { label: 'Staff List', to: '/employee/staff/list', icon: Users },
  { label: 'Staff Registry', to: '/employee/staff/add', icon: FilePlus2 },
  { label: 'Attendance', to: '/employee/staff/attendance', icon: CalendarCheck },
  { label: 'Payroll', to: '/employee/staff/payroll', icon: Banknote },
  { label: 'Roles', to: '/employee/staff/roles', icon: Shield },
  { label: 'Shift', to: '/employee/staff/shift', icon: Clock },
]
