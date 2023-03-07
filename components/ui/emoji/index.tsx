import React, { CSSProperties, HTMLProps, PropsWithChildren } from 'react';
import Image from 'next/image';
import styles from './emoji.module.css';
import Link, { LinkProps } from 'next/link';
import Button from '@/components/ui/button';
import { User } from "firebase/auth";
import { getDatabase, ref, remove, set, Database } from "firebase/database";
import { Room } from "@/app/[code]/page";
import { app } from "@/components/data/firebase";

import twemoji from "twemoji";
import kevinhart from '@/components/ui/emoji/imgs/kevinhart.jpeg';
import swagEmoji from '@/components/ui/emoji/imgs/swagEmoji.jpeg';

interface EmojiMenuProps {
  participant?: User,
  emojis: string[],
  style?: CSSProperties
}

function createEmojiHandler(emoji: String) {
    return async () => {
        console.log(emoji);
        return emoji;
    };
}

// this will hopefully phase out the above one
// because it will update the firebase
function createEmojiHandler2(emoji: string, code: string, database: Database) {
    return async () => {
        console.log(emoji);
        // TODO: not implemented in the firebase yet
        set(ref(database, `rooms/${code}/emojis`), emoji);
        return emoji;
    };
}

export default function EmojiMenu(props: EmojiMenuProps) {
  const { emojis } = props;

  const emojiElements = emojis.map((emoji) => {
    console.log(emoji)
    let emojiSrc = twemoji.parse(emoji);
    const regex = /<img.*?src="(.*?)"/;
    const matches = emojiSrc.match(regex);
    emojiSrc = matches[1];
    console.log(emojiSrc);
    return (
        <Button className={styles.emojiButton} key={emoji} onClick={createEmojiHandler(emoji)}>
          <Image className={styles.emojiPicture} src={emojiSrc} alt={emoji} height={50} width={50} />
        </Button>
      );
  });

  return (
    <div className={styles.emojiMenu} style={props.style}>
      {emojiElements}
    </div>
  )
}
