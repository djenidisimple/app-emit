'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'
import { cx } from 'styled-system/css'
import { text, type TextVariantProps } from 'styled-system/recipes'

type TextProps = ComponentProps<typeof ark.p> & TextVariantProps

export const Text = forwardRef<HTMLParagraphElement, TextProps>(function Text(props, ref) {
  const { size, variant, className, ...rest } = props
  const recipeClass = text({ size, variant })
  return <ark.p ref={ref} className={cx(recipeClass, className)} {...rest} />
})
