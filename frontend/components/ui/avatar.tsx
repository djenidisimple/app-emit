'use client'
import { Avatar as ArkAvatar } from '@ark-ui/react/avatar'
import { createStyleContext } from './utils'

const avatarStyles = {
  root: "relative inline-flex items-center justify-center rounded-full overflow-hidden w-10 h-10 bg-bg-muted",
  fallback: "flex items-center justify-center w-full h-full text-sm font-semibold text-fg-default",
  image: "w-full h-full object-cover",
}

const { withProvider, withContext } = createStyleContext(() => avatarStyles)

const AvatarRoot = withProvider(ArkAvatar.Root, 'root')
const AvatarFallback = withContext(ArkAvatar.Fallback, 'fallback')
const AvatarImage = withContext(ArkAvatar.Image, 'image')

export const Avatar = Object.assign(AvatarRoot, {
  Root: AvatarRoot,
  Fallback: AvatarFallback,
  Image: AvatarImage,
})
