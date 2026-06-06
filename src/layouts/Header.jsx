import React, { useCallback, useEffect, useRef, useState } from 'react'
import tw, { styled } from 'twin.macro'
import {
  Menu as MenuIcon,
  Bell,
  Clock,
  ChevronDown,
  Calendar,
  User,
  LogOut,
  AlertTriangle,
} from 'lucide-react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../services/firebase'
import { apiFetch } from '../services/api'
import { useAuth } from '../auth'
import { canAccessPath, getActiveRole, roleForPath } from '../auth'

const HeaderWrapper = tw.header`h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30`
const PageTitle = tw.h2`text-lg font-semibold text-neutral-900 flex items-center gap-2`

const HeaderActions = tw.div`flex items-center gap-3`
const StatusIndicator = styled.button(({ status }) => [
  tw`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border shadow-sm transition-all hover:opacity-90 active:scale-95`,
  status === 'online' ? tw`text-green-700 bg-green-50 border-green-200` :
  status === 'busy' ? tw`text-amber-700 bg-amber-50 border-amber-200` :
  tw`text-neutral-500 bg-neutral-100 border-neutral-200`
])
const Dot = styled.span(({ status }) => [
  tw`w-2 h-2 rounded-full`,
  status === 'online' ? tw`bg-green-500 animate-pulse` :
  status === 'busy' ? tw`bg-amber-500` :
  tw`bg-neutral-400`
])
const IconButton = tw.button`relative p-2 text-neutral-500 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100`
const ClockDisplay = tw.div`flex items-center gap-2 text-sm font-medium text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-lg`

function displayName(user) {
  if (!user) return 'Staff'
  if (user.displayName?.trim()) return user.displayName.trim()
  const email = String(user.email || '').trim()
  if (email) return email.split('@')[0]
  return 'Staff'
}

export default function Header({
  title,
  kitchenStatus,
  onToggleStatus,
  onOpenSchedule,
  currentTime,
  showUserMenu = false,
  showNotifications = false,
}) {
  const navigate = useNavigate()
  const { allowedRoles } = useAuth()
  const [localTime, setLocalTime] = useState(() => new Date())
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [alertCount, setAlertCount] = useState(0)
  const [notifLoading, setNotifLoading] = useState(false)
  const menuRef = useRef(null)
  const notifRef = useRef(null)

  const loadNotifications = useCallback(async (opts = {}) => {
    if (!showNotifications) return
    const silent = Boolean(opts.silent)
    if (!silent) setNotifLoading(true)
    try {
      const activeRole =
        getActiveRole() ||
        roleForPath(window.location.pathname) ||
        (allowedRoles.includes('reception') ? 'reception' : allowedRoles[0] || 'reception')
      const res = await apiFetch(
        `/api/notifications?role=${encodeURIComponent(activeRole)}`,
      )
      setNotifications(Array.isArray(res.notifications) ? res.notifications : [])
      setAlertCount(Number(res.alertCount) || 0)
    } catch (e) {
      console.error('Failed to load notifications:', e)
      setNotifications([])
      setAlertCount(0)
    } finally {
      if (!silent) setNotifLoading(false)
    }
  }, [showNotifications, allowedRoles])

  useEffect(() => {
    if (currentTime) return
    const timer = setInterval(() => setLocalTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [currentTime])

  useEffect(() => {
    if (!showUserMenu || !auth) return
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [showUserMenu])

  useEffect(() => {
    if (!showNotifications || !auth) return
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) loadNotifications({ silent: true })
      else {
        setAlertCount(0)
        setNotifications([])
      }
    })
    const id = setInterval(() => loadNotifications({ silent: true }), 30_000)
    const onRefresh = () => loadNotifications({ silent: true })
    window.addEventListener('reception:notifications-refresh', onRefresh)
    return () => {
      unsub()
      clearInterval(id)
      window.removeEventListener('reception:notifications-refresh', onRefresh)
    }
  }, [showNotifications, loadNotifications])

  useEffect(() => {
    if (!menuOpen && !notifOpen) return
    const onDocClick = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen, notifOpen])

  const time = currentTime || localTime
  const showStatus = Boolean(kitchenStatus) && typeof onToggleStatus === 'function'
  const showSchedule = typeof onOpenSchedule === 'function'

  const handleLogout = async () => {
    setMenuOpen(false)
    setNotifOpen(false)
    try {
      if (auth) await signOut(auth)
    } catch (error) {
      console.error('Error logging out:', error)
    }
    navigate('/login', { replace: true })
  }

  const toggleNotif = () => {
    setNotifOpen((o) => {
      const next = !o
      if (next) {
        setMenuOpen(false)
        loadNotifications()
      }
      return next
    })
  }

  const name = displayName(user)
  const email = user?.email || ''

  return (
    <HeaderWrapper>
      <div className="flex items-center gap-4">
        <button type="button" className="lg:hidden p-2 text-neutral-500" aria-label="Menu">
          <MenuIcon size={24} />
        </button>
        <PageTitle>{title}</PageTitle>
      </div>

      <HeaderActions>
        <ClockDisplay>
          <Clock size={16} className="text-neutral-400" />
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </ClockDisplay>

        {showStatus && (
          <StatusIndicator status={kitchenStatus} onClick={onToggleStatus}>
            <Dot status={kitchenStatus} />
            {kitchenStatus === 'online' ? 'Online' : 'Offline'}
            <ChevronDown size={14} className="ml-1 text-neutral-400" />
          </StatusIndicator>
        )}

        {showSchedule && (
          <IconButton type="button" onClick={onOpenSchedule} title="Set Schedule">
            <Calendar size={20} />
          </IconButton>
        )}

        {showNotifications && (
          <div className="relative" ref={notifRef}>
            <IconButton
              type="button"
              aria-label={alertCount > 0 ? `Notifications, ${alertCount} alerts` : 'Notifications'}
              aria-expanded={notifOpen}
              onClick={toggleNotif}
            >
              <Bell size={20} />
              {alertCount > 0 && (
                <span
                  className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 border-2 border-white shadow-sm"
                  aria-hidden
                />
              )}
            </IconButton>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-900">Notifications</p>
                  {alertCount > 0 && (
                    <span className="text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
                      {alertCount} alert{alertCount === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                  {notifLoading && (
                    <p className="px-2 py-3 text-xs text-neutral-500">Loading…</p>
                  )}
                  {!notifLoading && notifications.length === 0 && (
                    <p className="px-2 py-3 text-xs text-neutral-500">No notifications</p>
                  )}
                  {!notifLoading &&
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="rounded-lg border border-neutral-100 px-3 py-2.5 mb-1 last:mb-0"
                      >
                        <div className="flex items-start gap-2">
                          {n.severity === 'warning' ? (
                            <AlertTriangle size={14} className="text-neutral-700 mt-0.5 shrink-0" />
                          ) : (
                            <Bell size={14} className="text-neutral-400 mt-0.5 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-neutral-900">{n.title}</p>
                            <p className="text-[11px] text-neutral-600 mt-0.5">{n.message}</p>
                            {n.href && canAccessPath(n.href, allowedRoles) && (
                              <Link
                                to={n.href}
                                className="inline-block mt-1.5 text-[11px] font-medium text-neutral-900 underline"
                                onClick={() => setNotifOpen(false)}
                              >
                                View →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {showUserMenu && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                setMenuOpen((o) => !o)
                setNotifOpen(false)
              }}
              className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-1 pl-1 pr-2.5 hover:bg-neutral-50 transition-colors"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                <User size={16} />
              </span>
              <span className="hidden sm:block text-left max-w-[8rem]">
                <span className="block text-sm font-medium text-neutral-900 truncate">{name}</span>
                <span className="block text-[11px] text-neutral-500 truncate">{email || 'Signed in'}</span>
              </span>
              <ChevronDown size={14} className={`text-neutral-400 shrink-0 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg z-50"
              >
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-sm font-semibold text-neutral-900 truncate">{name}</p>
                  {email && <p className="text-xs text-neutral-500 truncate mt-0.5">{email}</p>}
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  <LogOut size={16} className="text-neutral-500" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </HeaderActions>
    </HeaderWrapper>
  )
}
