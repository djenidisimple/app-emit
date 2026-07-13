'use client'
import { Progress as ArkProgress } from '@ark-ui/react/progress'
import { createStyleContext } from './utils'

const progressStyles = {
  root: "flex flex-col gap-2",
  track: "w-full h-2 rounded-full bg-bg-muted overflow-hidden",
  range: "h-full rounded-full bg-accent transition-all duration-500",
  label: "text-sm font-medium text-fg-default",
  valueText: "text-sm text-fg-muted",
}

const { withProvider, withContext } = createStyleContext(() => progressStyles)

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
