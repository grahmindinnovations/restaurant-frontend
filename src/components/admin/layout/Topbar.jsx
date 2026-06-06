import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Clock, ChevronDown, LogOut, User } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../../services/firebase'

export default function Topbar({ adminUser }) {
  const navigate = useNavigate()
  const [now, setNow] = useState(new Date())
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  const name =
    adminUser?.profile?.name ||
    adminUser?.firebase?.displayName ||
    adminUser?.profile?.email ||
    adminUser?.firebase?.email ||
    'Admin'

  const email = adminUser?.profile?.email || adminUser?.firebase?.email || ''

  const handleLogout = async () => {
    setMenuOpen(false)
    try {
      if (auth) await signOut(auth)
    } catch (e) {
      console.error('Admin logout failed', e)
    }
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sticky top-0 z-10">
      <div>
        <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
          Admin
        </p>
        <p className="text-sm font-semibold text-neutral-900">{name}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-600 border border-neutral-200 rounded-md px-2.5 py-1">
          <CalendarDays className="h-3.5 w-3.5 text-neutral-400" />
          <span>{now.toLocaleDateString()}</span>
          <span className="text-neutral-300">|</span>
          <Clock className="h-3.5 w-3.5 text-neutral-400" />
          <span>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-1 pl-1 pr-2.5 hover:bg-neutral-50 transition-colors"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
              <User className="h-4 w-4" />
            </span>
            <span className="hidden sm:block text-left max-w-[8rem]">
              <span className="block text-sm font-medium text-neutral-900 truncate">{name}</span>
              <span className="block text-[11px] text-neutral-500 truncate">
                {email || 'Signed in'}
              </span>
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-neutral-400 shrink-0 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg z-50"
            >
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="text-sm font-semibold text-neutral-900 truncate">{name}</p>
                {email && (
                  <p className="text-xs text-neutral-500 truncate mt-0.5">{email}</p>
                )}
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                <LogOut className="h-4 w-4 text-neutral-500" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
