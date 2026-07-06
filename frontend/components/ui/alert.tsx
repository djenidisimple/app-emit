'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'
import { cx } from 'styled-system/css'
import { alert } from 'styled-system/recipes'

type AlertProps = ComponentProps<typeof ark.div> & {
  status?: string
}

export const Alert = Object.assign(
  forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    const { status, className, ...rest } = props
    const styles = alert({ status })
    return <ark.div ref={ref} className={cx(styles.root, className)} {...rest} />
  }),
  {
    Title: function AlertTitle(props: ComponentProps<typeof ark.div>) {
      const { className, ...rest } = props
      const styles = alert()
      return <ark.div className={cx(styles.title, className)} {...rest} />
    },
    Description: function AlertDescription(props: ComponentProps<typeof ark.div>) {
      const { className, ...rest } = props
      const styles = alert()
      return <ark.div className={cx(styles.description, className)} {...rest} />
    },
  }
)
