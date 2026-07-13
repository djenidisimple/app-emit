'use client'
import { Checkbox as ArkCheckbox } from '@ark-ui/react/checkbox'
import { createStyleContext } from './utils'

const checkboxStyles = {
  root: "flex items-center gap-2",
  control: "peer h-4 w-4 shrink-0 rounded border border-border bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent data-[state=checked]:text-white",
  indicator: "text-white",
  label: "text-sm text-fg-default",
}

const { withProvider, withContext } = createStyleContext(() => checkboxStyles)

const CheckboxRoot = withProvider(ArkCheckbox.Root, 'root')
const CheckboxControl = withContext(ArkCheckbox.Control, 'control')
const CheckboxIndicator = withContext(ArkCheckbox.Indicator, 'indicator')
const CheckboxLabel = withContext(ArkCheckbox.Label, 'label')

export const Checkbox = Object.assign(CheckboxRoot, {
  Root: CheckboxRoot,
  Control: CheckboxControl,
  Indicator: CheckboxIndicator,
  Label: CheckboxLabel,
  Context: ArkCheckbox.Context,
  RootProvider: ArkCheckbox.RootProvider,
})
