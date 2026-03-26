import * as React from 'react'

import { cn } from '../../lib/utils'

const Separator = React.forwardRef(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden={decorative ? 'true' : undefined}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  ),
)
Separator.displayName = 'Separator'

export { Separator }

