'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'
import { cx } from 'styled-system/css'
import { button, type ButtonVariantProps } from 'styled-system/recipes'

type CloseButtonProps = ComponentProps<typeof ark.button> & ButtonVariantProps

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  function CloseButton(props, ref) {
    const { variant, size, className, ...rest } = props
    const recipeClass = button({ variant, size })
    return (
      <ark.button ref={ref} className={cx(recipeClass, className)} aria-label="Close" {...rest}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
      </ark.button>
    )
  }
)
