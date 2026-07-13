'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'

type SpinnerProps = ComponentProps<typeof ark.div> & {
  size?: 'sm' | 'md' | 'lg'
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(function Spinner(props, ref) {
  const { size, className, ...rest } = props
  const base = "animate-spin rounded-full border-2 border-current border-t-transparent text-accent"
  const sizeClass = !size || size === 'md' ? 'w-5 h-5' : size === 'sm' ? 'w-4 h-4 border-[1.5px]' : size === 'lg' ? 'w-8 h-8 border-[3px]' : 'w-5 h-5'
  const recipeClass = `${base} ${sizeClass}`
  return <ark.div ref={ref} className={`${recipeClass}${className ? ` ${className}` : ''}`} {...rest} />
})
