'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'
import { css, cx } from 'styled-system/css'

type SeparatorProps = ComponentProps<typeof ark.hr>

export const Separator = forwardRef<HTMLHRElement, SeparatorProps>(
  function Separator(props, ref) {
    const { className, ...rest } = props
    return (
      <ark.hr
        ref={ref}
        className={cx(css({ borderColor: 'border.default' }), className)}
        {...rest}
      />
    )
  }
)
