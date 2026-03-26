import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-sm',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground',
        success: 'border-emerald-200 bg-emerald-500/10 text-emerald-800',
        warning: 'border-amber-200 bg-amber-500/10 text-amber-900',
        destructive: 'border-red-200 bg-red-500/10 text-red-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}

