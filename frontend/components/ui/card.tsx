'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'
import { cx } from 'styled-system/css'
import { card } from 'styled-system/recipes'

type CardProps = ComponentProps<typeof ark.div>

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(props, ref) {
  const { className, ...rest } = props
  const styles = card()
  return <ark.div ref={ref} className={cx(styles.root, className)} {...rest} />
})

export const CardHeader = (props: ComponentProps<typeof ark.h3>) => {
  const { className, ...rest } = props
  const styles = card()
  return <ark.h3 className={cx(styles.header, className)} {...rest} />
}

export const CardBody = (props: ComponentProps<typeof ark.div>) => {
  const { className, ...rest } = props
  const styles = card()
  return <ark.div className={cx(styles.body, className)} {...rest} />
}

export const CardFooter = (props: ComponentProps<typeof ark.div>) => {
  const { className, ...rest } = props
  const styles = card()
  return <ark.div className={cx(styles.footer, className)} {...rest} />
}
