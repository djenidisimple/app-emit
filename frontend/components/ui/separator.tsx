'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'

type SeparatorProps = ComponentProps<typeof ark.hr>

export const Separator = forwardRef<HTMLHRElement, SeparatorProps>(
  function Separator(props, ref) {
    const { className, ...rest } = props
    return (
      <ark.hr
        ref={ref}
        className={`shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px${className ? ` ${className}` : ''}`}
        {...rest}
      />
    )
  }
)
