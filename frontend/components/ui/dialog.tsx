'use client'
import { Dialog as ArkDialog } from '@ark-ui/react/dialog'
import { css, cx } from 'styled-system/css'

export const Dialog = Object.assign(
  ArkDialog.Root,
  {
    Root: ArkDialog.Root,
    Trigger: ArkDialog.Trigger,
    Content: ArkDialog.Content,
    Title: ArkDialog.Title,
    Description: ArkDialog.Description,
    CloseTrigger: ArkDialog.CloseTrigger,
    Close: ArkDialog.CloseTrigger,
    Backdrop: ArkDialog.Backdrop,
    Positioner: ArkDialog.Positioner,
    Context: ArkDialog.Context,
  }
)
