'use client'
import { Avatar as ArkAvatar } from '@ark-ui/react/avatar'
import { css } from 'styled-system/css'
import { createStyleContext } from './utils'
import { avatar } from 'styled-system/recipes'

const { withProvider, withContext } = createStyleContext(avatar)

const AvatarRoot = withProvider(ArkAvatar.Root, 'root')
const AvatarFallback = withContext(ArkAvatar.Fallback, 'fallback')
const AvatarImage = withContext(ArkAvatar.Image, 'image')

export const Avatar = Object.assign(AvatarRoot, {
  Root: AvatarRoot,
  Fallback: AvatarFallback,
  Image: AvatarImage,
})
