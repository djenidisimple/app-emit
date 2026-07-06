'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'
import { cx } from 'styled-system/css'
import { input, type InputVariantProps } from 'styled-system/recipes'

type InputProps = ComponentProps<typeof ark.input> & InputVariantProps

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const { size, className, ...rest } = props
  const recipeClass = input({ size })
  return <ark.input ref={ref} className={cx(recipeClass, className)} {...rest} />
})
