'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'
import { css, cx } from 'styled-system/css'
import { button, type ButtonVariantProps } from 'styled-system/recipes'

type IconButtonProps = ComponentProps<typeof ark.button> & ButtonVariantProps

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(props, ref) {
    const { variant, size, className, ...rest } = props
    const recipeClass = button({ variant, size: size || 'sm' })
    return <ark.button ref={ref} className={cx(recipeClass, css({ aspectRatio: 'square', p: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }), className)} {...rest} />
  }
)
