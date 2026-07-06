'use client'
import { Select as ArkSelect } from '@ark-ui/react/select'

export const Select = Object.assign(ArkSelect.Root, {
  Root: ArkSelect.Root,
  Control: ArkSelect.Control,
  Trigger: ArkSelect.Trigger,
  ValueText: ArkSelect.ValueText,
  Content: ArkSelect.Content,
  Item: ArkSelect.Item,
  ItemText: ArkSelect.ItemText,
  ItemIndicator: ArkSelect.ItemIndicator,
  Label: ArkSelect.Label,
  ItemGroup: ArkSelect.ItemGroup,
  ItemGroupLabel: ArkSelect.ItemGroupLabel,
  Context: ArkSelect.Context,
  HiddenSelect: ArkSelect.HiddenSelect,
  Positioner: ArkSelect.Positioner,
})
