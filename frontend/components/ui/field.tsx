'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'
import { cx } from 'styled-system/css'
import { field } from 'styled-system/recipes'

type FieldProps = ComponentProps<typeof ark.div>

export const Field = Object.assign(
  forwardRef<HTMLDivElement, FieldProps>(function Field(props, ref) {
    const { className, ...rest } = props
    const styles = field()
    return <ark.div ref={ref} className={cx(styles.root, className)} {...rest} />
  }),
  {
    Label: function FieldLabel(props: ComponentProps<typeof ark.label>) {
      const { className, ...rest } = props
      const styles = field()
      return <ark.label className={cx(styles.label, className)} {...rest} />
    },
    HelperText: function FieldHelperText(props: ComponentProps<typeof ark.span>) {
      const { className, ...rest } = props
      const styles = field()
      return <ark.span className={cx(styles.helperText, className)} {...rest} />
    },
    ErrorText: function FieldErrorText(props: ComponentProps<typeof ark.span>) {
      const { className, ...rest } = props
      const styles = field()
      return <ark.span className={cx(styles.errorText, className)} {...rest} />
    },
  }
)
