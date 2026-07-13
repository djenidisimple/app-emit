'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'

type IconButtonProps = ComponentProps<typeof ark.button> & {
  variant?: 'solid' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(props, ref) {
    const { variant, size, className, ...rest } = props
    const base = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50"
    const variantClass = !variant || variant === 'solid' ? 'bg-accent text-white hover:bg-accent-dark' : 'bg-transparent hover:bg-bg-muted text-fg-muted'
    const sizeClass = !size || size === 'md' ? 'h-10 w-10' : size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
    const recipeClass = `${base} ${variantClass} ${sizeClass}`
    return <ark.button ref={ref} className={`${recipeClass}${className ? ` ${className}` : ''}`} {...rest} />
  }
)
