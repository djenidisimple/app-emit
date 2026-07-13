'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'

type CardProps = ComponentProps<typeof ark.div>

const cardStyles = {
  root: "bg-surface border border-neutral-200 rounded-[8px] p-6",
  header: "text-lg font-semibold text-fg-default mb-4",
  body: "text-sm text-fg-muted",
  footer: "flex items-center gap-4 mt-4 pt-4 border-t border-border",
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(props, ref) {
  const { className, ...rest } = props
  return <ark.div ref={ref} className={`${cardStyles.root}${className ? ` ${className}` : ''}`} {...rest} />
})

export const CardHeader = (props: ComponentProps<typeof ark.h3>) => {
  const { className, ...rest } = props
  return <ark.h3 className={`${cardStyles.header}${className ? ` ${className}` : ''}`} {...rest} />
}

export const CardBody = (props: ComponentProps<typeof ark.div>) => {
  const { className, ...rest } = props
  return <ark.div className={`${cardStyles.body}${className ? ` ${className}` : ''}`} {...rest} />
}

export const CardFooter = (props: ComponentProps<typeof ark.div>) => {
  const { className, ...rest } = props
  return <ark.div className={`${cardStyles.footer}${className ? ` ${className}` : ''}`} {...rest} />
}
