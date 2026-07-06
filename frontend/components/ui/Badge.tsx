'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'
import { cx } from 'styled-system/css'
import { badge, type BadgeVariantProps } from 'styled-system/recipes'

type BadgeProps = ComponentProps<typeof ark.span> & BadgeVariantProps

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(props, ref) {
  const { variant, size, className, ...rest } = props
  const recipeClass = badge({ variant, size })
  return <ark.span ref={ref} className={cx(recipeClass, className)} {...rest} />
})
