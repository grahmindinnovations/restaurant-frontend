import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Input = forwardRef(({ className, ...props }, ref) => {
  return <input ref={ref} className={cn('flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200', className)} {...props} />
})
