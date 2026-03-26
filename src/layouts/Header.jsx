import React, { useEffect, useState } from 'react'
import tw, { styled } from 'twin.macro'
import {
  Menu as MenuIcon,
  Bell,
  Clock,
  ChevronDown,
  Calendar
} from 'lucide-react'

const HeaderWrapper = tw.header`h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10`
const PageTitle = tw.h2`text-xl font-bold text-slate-800 flex items-center gap-2`

const HeaderActions = tw.div`flex items-center gap-6`
const StatusIndicator = styled.button(({ status }) => [
  tw`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border shadow-sm transition-all hover:opacity-90 active:scale-95`,
  status === 'online' ? tw`text-green-700 bg-green-50 border-green-200` :
  status === 'busy' ? tw`text-amber-700 bg-amber-50 border-amber-200` :
  tw`text-slate-500 bg-slate-100 border-slate-200`
])
const Dot = styled.span(({ status }) => [
  tw`w-2 h-2 rounded-full`,
  status === 'online' ? tw`bg-green-500 animate-pulse` :
  status === 'busy' ? tw`bg-amber-500` :
  tw`bg-slate-400`
])
const IconButton = tw.button`relative p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-full hover:bg-rose-50`
const NotificationBadge = tw.span`absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white`
const ClockDisplay = tw.div`flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg`

export default function Header({ 
  title, 
  kitchenStatus, 
  onToggleStatus, 
  onOpenSchedule, 
  currentTime 
}) {
  const [localTime, setLocalTime] = useState(() => new Date())

  useEffect(() => {
    if (currentTime) return
    const timer = setInterval(() => setLocalTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [currentTime])

  const time = currentTime || localTime
  const showStatus = Boolean(kitchenStatus) && typeof onToggleStatus === 'function'
  const showSchedule = typeof onOpenSchedule === 'function'

  return (
    <HeaderWrapper>
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 text-slate-500">
          <MenuIcon size={24} />
        </button>
        <PageTitle>{title}</PageTitle>
      </div>
      
      <HeaderActions>
        <ClockDisplay>
          <Clock size={16} className="text-slate-400" />
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </ClockDisplay>

        {showStatus && (
          <StatusIndicator status={kitchenStatus} onClick={onToggleStatus}>
            <Dot status={kitchenStatus} /> 
            {kitchenStatus === 'online' ? 'Online' : 'Offline'}
            <ChevronDown size={14} className="ml-1 text-slate-400" />
          </StatusIndicator>
        )}
        
        {showSchedule && (
          <IconButton onClick={onOpenSchedule} title="Set Schedule">
            <Calendar size={20} />
          </IconButton>
        )}

        <IconButton>
          <Bell size={20} />
          <NotificationBadge />
        </IconButton>
      </HeaderActions>
    </HeaderWrapper>
  )
}
