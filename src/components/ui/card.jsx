import { cn } from '../../lib/utils'

export function Card({ className, ...props }){ return <div className={cn('card-base shadow-soft', className)} {...props} /> }
export function CardContent({ className, ...props }){ return <div className={cn('p-4', className)} {...props} /> }
export function CardHeader({ className, ...props }){ return <div className={cn('p-4 pb-0', className)} {...props} /> }
export function CardTitle({ className, ...props }){ return <h3 className={cn('text-base font-semibold', className)} {...props} /> }
