'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'

type KbdProps = ComponentProps<typeof ark.kbd>

export const Kbd = forwardRef<HTMLDivElement, KbdProps>(function Kbd(props, ref) {
  const { className, ...rest } = props
  const styles = "inline-flex items-center justify-center rounded-md border border-border bg-bg-muted px-1.5 py-0.5 text-xs font-mono text-fg-muted"
  return <ark.kbd ref={ref} className={`${styles}${className ? ` ${className}` : ''}`} {...rest} />
})
