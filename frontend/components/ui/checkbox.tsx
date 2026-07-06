'use client'
import { Checkbox as ArkCheckbox } from '@ark-ui/react/checkbox'
import { createStyleContext } from './utils'
import { checkbox } from 'styled-system/recipes'

const { withProvider, withContext } = createStyleContext(checkbox)

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
