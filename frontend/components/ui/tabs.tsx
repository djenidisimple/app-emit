'use client'
import { Tabs as ArkTabs } from '@ark-ui/react/tabs'
import { createStyleContext } from './utils'

const tabsStyles = {
  root: "w-full",
  list: "flex items-center gap-1 border-b border-border",
  trigger: "px-4 py-2 text-sm font-medium text-fg-muted hover:text-fg-default data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent transition-colors",
  content: "pt-4",
}

const { withProvider, withContext } = createStyleContext(() => tabsStyles)

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
