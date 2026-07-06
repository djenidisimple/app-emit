'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'
import { cx } from 'styled-system/css'
import { link } from 'styled-system/recipes'

type LinkProps = ComponentProps<typeof ark.a>

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  const { className, ...rest } = props
  const recipeClass = link()
  return <ark.a ref={ref} className={cx(recipeClass, className)} {...rest} />
})
