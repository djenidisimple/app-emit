'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'

type InputProps = ComponentProps<typeof ark.input> & {
  size?: 'sm' | 'md' | 'lg'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const { size, className, ...rest } = props
  const base = "flex w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-fg-default placeholder:text-fg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50"
  const sizeClass = !size || size === 'md' ? 'h-10' : size === 'sm' ? 'h-8 text-xs' : size === 'lg' ? 'h-12' : 'h-10'
  const recipeClass = `${base} ${sizeClass}`
  return <ark.input ref={ref} className={`${recipeClass}${className ? ` ${className}` : ''}`} {...rest} />
})
