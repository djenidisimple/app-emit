'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'

type TextProps = ComponentProps<typeof ark.p>

export const Text = forwardRef<HTMLParagraphElement, TextProps>(function Text(props, ref) {
  const { className, ...rest } = props
  const styles = "text-sm text-fg-default"
  return <ark.p ref={ref} className={`${styles}${className ? ` ${className}` : ''}`} {...rest} />
})
