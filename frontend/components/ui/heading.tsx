'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'

type HeadingProps = ComponentProps<typeof ark.h2>

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  function Heading(props, ref) {
    const { className, ...rest } = props
    return (
      <ark.h2
        ref={ref}
        className={`font-bold${className ? ` ${className}` : ''}`}
        {...rest}
      />
    )
  }
)
