'use client'
import { Progress as ArkProgress } from '@ark-ui/react/progress'
import { createStyleContext } from './utils'
import { progress } from 'styled-system/recipes'

const { withProvider, withContext } = createStyleContext(progress)

const ProgressRoot = withProvider(ArkProgress.Root, 'root')
const ProgressTrack = withContext(ArkProgress.Track, 'track')
const ProgressRange = withContext(ArkProgress.Range, 'range')
const ProgressLabel = withContext(ArkProgress.Label, 'label')
const ProgressValueText = withContext(ArkProgress.ValueText, 'valueText')

export const Progress = Object.assign(ProgressRoot, {
  Root: ProgressRoot,
  Track: ProgressTrack,
  Range: ProgressRange,
  Label: ProgressLabel,
  ValueText: ProgressValueText,
  Context: ArkProgress.Context,
})
