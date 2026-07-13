'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'

type TextareaProps = ComponentProps<typeof ark.textarea> & {
  size?: 'sm' | 'md' | 'lg'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(props, ref) {
  const { size, className, ...rest } = props
  const base = "flex w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-fg-default placeholder:text-fg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50 h-auto min-h-[80px]"
  const sizeClass = !size || size === 'md' ? '' : size === 'sm' ? 'text-xs' : size === 'lg' ? '' : ''
  const recipeClass = `${base}${sizeClass ? ` ${sizeClass}` : ''}`
  return <ark.textarea ref={ref} className={`${recipeClass}${className ? ` ${className}` : ''}`} {...rest} />
})
