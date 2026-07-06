'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'
import { cx } from 'styled-system/css'
import { kbd } from 'styled-system/recipes'

type KbdProps = ComponentProps<typeof ark.kbd>

export const Kbd = forwardRef<HTMLDivElement, KbdProps>(function Kbd(props, ref) {
  const { className, ...rest } = props
  const styles = kbd()
  return <ark.kbd ref={ref} className={cx(styles, className)} {...rest} />
})
