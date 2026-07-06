'use client'
import { Popover as ArkPopover } from '@ark-ui/react/popover'

export const Popover = Object.assign(ArkPopover.Root, {
  Root: ArkPopover.Root,
  Trigger: ArkPopover.Trigger,
  Content: ArkPopover.Content,
  Title: ArkPopover.Title,
  Description: ArkPopover.Description,
  Arrow: ArkPopover.Arrow,
  ArrowTip: ArkPopover.ArrowTip,
  CloseTrigger: ArkPopover.CloseTrigger,
  Context: ArkPopover.Context,
  Positioner: ArkPopover.Positioner,
})
