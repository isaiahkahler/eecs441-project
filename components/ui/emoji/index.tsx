import React, { CSSProperties, HTMLProps, PropsWithChildren } from 'react';
import Image from 'next/image';
import styles from './emoji.module.css';
import Button, { IconButton } from '@/components/ui/button';

import twemoji from "twemoji";
interface EmojiMenuProps {
  emojis: string[],
  style?: CSSProperties,
  onEmojiClick: (emoji: string) => void
}

export default function EmojiMenu(props: EmojiMenuProps) {
  const { emojis, onEmojiClick } = props;

  const regex = /<img.*?src="(.*?)"/;
  const emojiElements = emojis.map((emoji) => {
    let emojiSrc = (twemoji.parse(emoji, { folder: 'svg', ext: '.svg' }).match(regex) || ['', ''])[1];
    return (
      <IconButton className={styles.emojiButton} key={emoji} onClick={() => onEmojiClick(emoji)}>
        <Image src={emojiSrc} alt={`${emoji} reaction`} width={30} height={30} />
      </IconButton>
    );
  });

  return (
    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
      {emojiElements}
    </div>
  )
}
