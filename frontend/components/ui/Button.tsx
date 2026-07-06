'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'
import { cx } from 'styled-system/css'
import { button, type ButtonVariantProps } from 'styled-system/recipes'

type ButtonProps = ComponentProps<typeof ark.button> & ButtonVariantProps & {
  loading?: boolean
  loadingText?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const { loading, loadingText, variant, size, className, children, ...rest } = props
  const recipeClass = button({ variant, size })
  return (
    <ark.button
      ref={ref}
      className={cx(recipeClass, className)}
      data-loading={loading ? '' : undefined}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? (
        <span style={{ display: 'contents' }}>
          <span style={{ position: 'absolute', display: 'inline-flex' }}>
            <svg width="1em" height="1em" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
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
