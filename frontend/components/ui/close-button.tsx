'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'

type CloseButtonProps = ComponentProps<typeof ark.button> & {
  size?: 'sm' | 'md' | 'lg'
}

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  function CloseButton(props, ref) {
    const { size, className, ...rest } = props
    const base = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50"
    const variantClass = "bg-transparent hover:bg-bg-muted text-fg-muted"
    const sizeClass = !size || size === 'md' ? 'h-10 w-10' : size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
    const recipeClass = `${base} ${variantClass} ${sizeClass}`
    return (
      <ark.button ref={ref} className={`${recipeClass}${className ? ` ${className}` : ''}`} aria-label="Close" {...rest}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
      </ark.button>
    )
  }
)
