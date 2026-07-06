'use client'
import { Tooltip as ArkTooltip } from '@ark-ui/react/tooltip'

export const Tooltip = Object.assign(ArkTooltip.Root, {
  Root: ArkTooltip.Root,
  Trigger: ArkTooltip.Trigger,
  Content: ArkTooltip.Content,
  Arrow: ArkTooltip.Arrow,
  ArrowTip: ArkTooltip.ArrowTip,
  Positioner: ArkTooltip.Positioner,
  Context: ArkTooltip.Context,
})
