import React, { CSSProperties, HTMLProps, PropsWithChildren } from 'react'
import styles from './emoji.module.css'
import Link, { LinkProps } from 'next/link'
import Button from '@/components/ui/button'
import { User } from "firebase/auth"

interface EmojiMenuProps {
  participant: User,
  emojis: string[]
}

const handleEmitEmoji = async () => {
  return;
}

export default function EmojiMenu(props: EmojiMenuProps) {
  const { emojis } = props;

  const emojiElements = emojis.map((emoji) => {
    const emojiSrc = `@/components/ui/emoji/imgs/${emoji}.jpeg`;
    return <img src={emojiSrc} alt={emoji} key={emoji} />;
  });

  return (
    <div className={styles.emojiMenu}>
      {emojiElements}
    </div>
  )
}
