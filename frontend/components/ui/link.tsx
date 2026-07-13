'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'

type LinkProps = ComponentProps<typeof ark.a>

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  const { className, ...rest } = props
  const recipeClass = "text-accent underline-offset-2 hover:underline cursor-pointer"
  return <ark.a ref={ref} className={`${recipeClass}${className ? ` ${className}` : ''}`} {...rest} />
})
