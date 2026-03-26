import * as React from 'react'
import { cn } from '../../lib/utils'

const SelectPartsContext = React.createContext(null)

function Select({ value, onValueChange, children, ...props }) {
  const childArray = React.Children.toArray(children)
  const trigger = childArray.find((c) => React.isValidElement(c) && c.type?.displayName === 'SelectTrigger')
  const content = childArray.find((c) => React.isValidElement(c) && c.type?.displayName === 'SelectContent')
  const triggerClassName = React.isValidElement(trigger) ? trigger.props?.className : undefined

  const items = []
  if (React.isValidElement(content)) {
    const contentChildren = React.Children.toArray(content.props?.children)
    for (const node of contentChildren) {
      if (!React.isValidElement(node)) continue
      if (node.type?.displayName !== 'SelectItem') continue
      items.push({ value: node.props?.value, label: node.props?.children })
    }
  }

  const placeholder =
    React.isValidElement(trigger)
      ? React.Children.toArray(trigger.props?.children).find(
          (c) => React.isValidElement(c) && c.type?.displayName === 'SelectValue',
        )?.props?.placeholder
      : undefined

  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        triggerClassName,
      )}
      {...props}
    >
      {placeholder != null && String(value ?? '').length === 0 && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {items.map((it) => (
        <option key={String(it.value)} value={it.value}>
          {it.label}
        </option>
      ))}
    </select>
  )
}

function SelectGroup({ children }) {
  return <>{children}</>
}

function SelectValue() {
  return null
}
SelectValue.displayName = 'SelectValue'

const SelectTrigger = React.forwardRef(({ className, children }, ref) => {
  return (
    <div ref={ref} className={className} data-select-trigger>
      {children}
    </div>
  )
})
SelectTrigger.displayName = 'SelectTrigger'

function SelectContent({ children }) {
  return <SelectPartsContext.Provider value={children} />
}
SelectContent.displayName = 'SelectContent'

function SelectLabel({ children }) {
  return <>{children}</>
}
SelectLabel.displayName = 'SelectLabel'

const SelectItem = React.forwardRef(({ children }, ref) => {
  return <div ref={ref}>{children}</div>
})
SelectItem.displayName = 'SelectItem'

function SelectSeparator() {
  return null
}
SelectSeparator.displayName = 'SelectSeparator'

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator }

