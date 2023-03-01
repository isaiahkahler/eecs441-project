import React, { CSSProperties, HTMLProps, PropsWithChildren } from 'react'
import styles from './emoji.module.css'
import Link, { LinkProps } from 'next/link'
import Button from '@/components/ui/button'
import { User } from "firebase/auth"

interface EmojiMenuProps {
  participant: User, // believe this will be necessary?
  // of course reactions could be anonymous for first implementation
  emojis: string[] // this will match up to image in imgs
}

const handleEmitEmoji = async () => {
  return;
}

export default function EmojiMenu(props: EmojiMenuProps) {
  /*
  Will have a bunch of buttons to emit emojis
  */
  return (
    <>
    </>
  )
}