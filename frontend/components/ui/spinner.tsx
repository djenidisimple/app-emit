'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'
import { cx } from 'styled-system/css'
import { spinner, type SpinnerVariantProps } from 'styled-system/recipes'

type SpinnerProps = ComponentProps<typeof ark.div> & SpinnerVariantProps

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(function Spinner(props, ref) {
  const { size, className, ...rest } = props
  const recipeClass = spinner({ size })
  return <ark.div ref={ref} className={cx(recipeClass, className)} {...rest} />
})
