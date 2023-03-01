import React, { CSSProperties, HTMLProps, PropsWithChildren } from 'react'
import Image from 'next/image'
import styles from './emoji.module.css'
import Link, { LinkProps } from 'next/link'
import Button from '@/components/ui/button'
import { User } from "firebase/auth"

import kevinhart from '@/components/ui/emoji/imgs/kevinhart.jpeg'
import swagEmoji from '@/components/ui/emoji/imgs/swagEmoji.jpeg'

interface EmojiMenuProps {
  participant?: User,
  emojis: string[]
}

function createEmojiHandler(emoji: String) {
    return async () => {
        console.log(emoji);
        return emoji
    }
}

export default function EmojiMenu(props: EmojiMenuProps) {
  const { emojis } = props;

  const emojiElements = emojis.map((emoji) => {
    const emojiSrc = emoji === 'kevinhart' ? kevinhart : swagEmoji;
    return (
        <Button className={styles.emojiButton} key={emoji} onClick={createEmojiHandler(emoji)}>
          <Image src={emojiSrc} alt={emoji} height={50} width={50} />
        </Button>
      );
  });

  return (
    <div className={styles.emojiMenu}>
      {emojiElements}
    </div>
  )
}
