'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'

type FieldProps = ComponentProps<typeof ark.div>

const fieldStyles = {
  root: "flex flex-col gap-1.5",
  label: "text-sm font-medium text-fg-default",
  helperText: "text-xs text-fg-muted",
  errorText: "text-xs text-danger",
}

export const Field = Object.assign(
  forwardRef<HTMLDivElement, FieldProps>(function Field(props, ref) {
    const { className, ...rest } = props
    return <ark.div ref={ref} className={`${fieldStyles.root}${className ? ` ${className}` : ''}`} {...rest} />
  }),
  {
    Label: function FieldLabel(props: ComponentProps<typeof ark.label>) {
      const { className, ...rest } = props
      return <ark.label className={`${fieldStyles.label}${className ? ` ${className}` : ''}`} {...rest} />
    },
    HelperText: function FieldHelperText(props: ComponentProps<typeof ark.span>) {
      const { className, ...rest } = props
      return <ark.span className={`${fieldStyles.helperText}${className ? ` ${className}` : ''}`} {...rest} />
    },
    ErrorText: function FieldErrorText(props: ComponentProps<typeof ark.span>) {
      const { className, ...rest } = props
      return <ark.span className={`${fieldStyles.errorText}${className ? ` ${className}` : ''}`} {...rest} />
    },
  }
)
