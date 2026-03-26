import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../../lib/utils'

const buttonVariants = {
  default: 'bg-gray-900 text-white hover:bg-gray-800',
  primary: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:brightness-110',
  secondary: 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:brightness-110',
  outline: 'border border-gray-300 hover:bg-gray-50',
  ghost: 'hover:bg-gray-100'
}

const sizes = {
  sm: 'h-9 px-3 rounded-lg text-sm',
  md: 'h-10 px-4 rounded-lg',
  lg: 'h-11 px-5 rounded-xl text-base'
}

export const Button = forwardRef(({ className, asChild, variant='default', size='md', ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp ref={ref} className={cn('inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors', buttonVariants[variant], sizes[size], className)} {...props} />
  )
})
