import React, { CSSProperties, HTMLProps, PropsWithChildren, useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './emoji.module.css';
import Button, { IconButton } from '@/components/ui/button';

import twemoji from "twemoji";
interface EmojiMenuProps {
  emojis: string[],
  onEmojiClick: (emoji: string) => void,

}

export function convertEmoji(emoji: string): string {
  const regex = /<img.*?src="(.*?)"/;
  return (twemoji.parse(emoji, { folder: 'svg', ext: '.svg' }).match(regex) || ['', ''])[1];
}

export default function EmojiMenu(props: EmojiMenuProps) {
  const { emojis, onEmojiClick } = props;
  const [reactionClicks, setReactionClicks] = useState<number[]>([]);
  const [coolDown, setCoolDown] = useState(false);

  const [coolDownInMilliseconds, setCoolDownInMilliseconds] = useState<number | null>(null);

  const onReactionClick = (emoji: string) => {
    // check if there has been more than 5 reactions in the last 5 seconds
    if (reactionClicks.length === 5 && (Date.now() - reactionClicks[0]) < (3 * 1000)) {
      // setCoolDown(true);
      console.log(`in ${(3 - (Date.now() - reactionClicks[0]) / 1000)} seconds`)
      if (coolDownInMilliseconds) return;
      setCoolDownInMilliseconds(3000 - (Date.now() - reactionClicks[0]));
      return;
    }
    setReactionClicks(prev => prev.length === 5 ? [...prev.slice(1), Date.now()] : [...prev, Date.now()]);
    onEmojiClick(emoji);
  }

  // listen to coolDownInMilliseconds and update coolDown accordingly
  useEffect(() => {
    if (!coolDownInMilliseconds) {
      setCoolDown(false);
      return;
    }
    setCoolDown(true);
    const timeout = setTimeout(() => {
      setCoolDownInMilliseconds(null);
      setCoolDown(false);
    }, coolDownInMilliseconds);
    return () => clearTimeout(timeout);
  }, [coolDownInMilliseconds]);

  return (
    <div className={styles.emojiMenu}>
      {emojis.map(emoji => <IconButton className={styles.emojiButton} key={emoji} onClick={() => onReactionClick(emoji)}>
        <Image src={convertEmoji(emoji)} alt={`${emoji} reaction`} width={30} height={30} />
      </IconButton>)}
      {coolDown && <span className={styles.warningContainer}><p>too many reactions</p></span>}
    </div>
  )
}
