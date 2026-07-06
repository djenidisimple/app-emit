'use client'
import { Menu as ArkMenu } from '@ark-ui/react/menu'

export const Menu = Object.assign(ArkMenu.Root, {
  Root: ArkMenu.Root,
  Trigger: ArkMenu.Trigger,
  Content: ArkMenu.Content,
  Item: ArkMenu.Item,
  ItemText: ArkMenu.ItemText,
  ItemGroup: ArkMenu.ItemGroup,
  ItemGroupLabel: ArkMenu.ItemGroupLabel,
  Context: ArkMenu.Context,
  Positioner: ArkMenu.Positioner,
  Separator: ArkMenu.Separator,
})
