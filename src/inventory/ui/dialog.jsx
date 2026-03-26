import * as React from 'react'
import { X } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button'

const DialogContext = React.createContext({ open: false, onOpenChange: () => {} })

function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open: Boolean(open), onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogTrigger({ children, ...props }) {
  const { onOpenChange } = React.useContext(DialogContext)
  return (
    <button type="button" onClick={() => onOpenChange?.(true)} {...props}>
      {children}
    </button>
  )
}

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/40 backdrop-blur-sm', className)}
    {...props}
  />
))
DialogOverlay.displayName = 'DialogOverlay'

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(DialogContext)
  if (!open) return null

  return (
    <>
      <DialogOverlay onClick={() => onOpenChange?.(false)} />
      <div
        ref={ref}
        className={cn(
          'fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-2xl border bg-background p-5 shadow-2xl outline-none',
          className,
        )}
        {...props}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 rounded-full"
          onClick={() => onOpenChange?.(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        {children}
      </div>
    </>
  )
})
DialogContent.displayName = 'DialogContent'

const DialogHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col gap-1 pr-10', className)} {...props} />
)

const DialogFooter = ({ className, ...props }) => (
  <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
)

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DialogDescription.displayName = 'DialogDescription'

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

