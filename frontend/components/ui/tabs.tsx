'use client'
import { Tabs as ArkTabs } from '@ark-ui/react/tabs'
import { createStyleContext } from './utils'
import { tabs } from 'styled-system/recipes'

const { withProvider, withContext } = createStyleContext(tabs)

const TabsRoot = withProvider(ArkTabs.Root, 'root')
const TabsList = withContext(ArkTabs.List, 'list')
const TabsTrigger = withContext(ArkTabs.Trigger, 'trigger')
const TabsContent = withContext(ArkTabs.Content, 'content')

export const Tabs = Object.assign(TabsRoot, {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
  Context: ArkTabs.Context,
})
