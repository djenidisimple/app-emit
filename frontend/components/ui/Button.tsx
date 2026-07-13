'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'

type ButtonProps = ComponentProps<typeof ark.button> & {
  variant?: 'solid' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingText?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const { loading, loadingText, variant, size, className, children, ...rest } = props
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50"
  const variantClass = !variant || variant === 'solid' ? 'bg-accent text-white hover:bg-accent-dark'
    : variant === 'secondary' ? 'bg-white text-fg-default border border-border hover:bg-bg-muted'
    : variant === 'outline' ? 'border border-border bg-transparent hover:bg-bg-muted'
    : variant === 'ghost' ? 'bg-transparent hover:bg-bg-muted'
    : variant === 'danger' ? 'bg-danger text-white hover:bg-red-700'
    : variant === 'success' ? 'bg-success text-white hover:bg-emerald-600'
    : 'bg-accent text-white'
  const sizeClass = !size || size === 'md' ? 'h-10 px-4 text-sm'
    : size === 'sm' ? 'h-8 px-3 text-xs rounded-lg'
    : size === 'lg' ? 'h-12 px-6 text-base rounded-lg'
    : 'h-10 px-4'
  const recipeClass = `${base} ${variantClass} ${sizeClass}`
  return (
    <ark.button
      ref={ref}
      className={`${recipeClass}${className ? ` ${className}` : ''}`}
      data-loading={loading ? '' : undefined}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? (
        <span style={{ display: 'contents' }}>
          <span className="absolute inline-flex">
            <svg className="animate-spin" width="1em" height="1em" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
          </span>
          <span style={{ visibility: 'hidden', display: 'contents' }}>{children}</span>
        </span>
      ) : children}
    </ark.button>
  )
})
