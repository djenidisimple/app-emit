'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'

type BadgeProps = ComponentProps<typeof ark.span> & {
  variant?: 'subtle' | 'outline' | 'solid'
  size?: 'sm' | 'md' | 'lg'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(props, ref) {
  const { variant, size, className, ...rest } = props
  const base = "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap"
  const variantClass = !variant || variant === 'subtle' ? 'bg-accent-light text-accent'
    : variant === 'outline' ? 'border border-border text-fg-default bg-transparent'
    : variant === 'solid' ? 'bg-accent text-white'
    : 'bg-accent-light text-accent'
  const sizeClass = !size || size === 'md' ? 'px-2.5 py-0.5 text-xs'
    : size === 'sm' ? 'px-2 py-0.5 text-[10px]'
    : size === 'lg' ? 'px-3 py-1 text-sm'
    : 'px-2.5 py-0.5 text-xs'
  const recipeClass = `${base} ${variantClass} ${sizeClass}`
  return <ark.span ref={ref} className={`${recipeClass}${className ? ` ${className}` : ''}`} {...rest} />
})
