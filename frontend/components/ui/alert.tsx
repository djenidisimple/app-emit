'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'

type AlertProps = ComponentProps<typeof ark.div> & {
  status?: string
}

const alertStyles = {
  root: "flex items-start gap-3 rounded-lg border p-4",
  title: "text-sm font-semibold text-fg-default",
  description: "text-sm text-fg-muted",
}

export const Alert = Object.assign(
  forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    const { status, className, ...rest } = props
    return <ark.div ref={ref} className={`${alertStyles.root}${className ? ` ${className}` : ''}`} {...rest} />
  }),
  {
    Title: function AlertTitle(props: ComponentProps<typeof ark.div>) {
      const { className, ...rest } = props
      return <ark.div className={`${alertStyles.title}${className ? ` ${className}` : ''}`} {...rest} />
    },
    Description: function AlertDescription(props: ComponentProps<typeof ark.div>) {
      const { className, ...rest } = props
      return <ark.div className={`${alertStyles.description}${className ? ` ${className}` : ''}`} {...rest} />
    },
  }
)
