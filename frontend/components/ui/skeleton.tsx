'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'
import { cx } from 'styled-system/css'
import { skeleton } from 'styled-system/recipes'

type SkeletonProps = ComponentProps<typeof ark.div>

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(props, ref) {
  const { className, ...rest } = props
  const styles = skeleton()
  return <ark.div ref={ref} className={cx(styles, className)} {...rest} />
})
