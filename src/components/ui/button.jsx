import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../../lib/utils'

const buttonVariants = {
  default: 'bg-primary text-primary-foreground hover:brightness-110',
  primary: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:brightness-110',
  secondary: 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:brightness-110',
  outline: 'border border-border bg-card hover:bg-accent text-foreground',
  ghost: 'hover:bg-accent text-foreground'
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
