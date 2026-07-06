'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'
import { cx } from 'styled-system/css'
import { textarea, type TextareaVariantProps } from 'styled-system/recipes'

type TextareaProps = ComponentProps<typeof ark.textarea> & TextareaVariantProps

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(props, ref) {
  const { size, className, ...rest } = props
  const recipeClass = textarea({ size })
  return <ark.textarea ref={ref} className={cx(recipeClass, className)} {...rest} />
})
