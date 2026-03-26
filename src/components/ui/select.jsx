import { cn } from '../../lib/utils'

export function Select({ className, children, ...props }){
  return <select className={cn('h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200', className)} {...props}>{children}</select>
}
