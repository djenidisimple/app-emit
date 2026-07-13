'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'

type SkeletonProps = ComponentProps<typeof ark.div>

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(props, ref) {
  const { className, ...rest } = props
  const styles = "animate-pulse rounded-lg bg-bg-muted"
  return <ark.div ref={ref} className={`${styles}${className ? ` ${className}` : ''}`} {...rest} />
})
