import Image from "next/image";
import twemoji from "twemoji";
import { Reaction } from "../page";
import styles from './reactions.module.css'

interface ReactionsDisplayProps {
  reactions: Reaction
}

export default function ReactionsDisplay(props: ReactionsDisplayProps) {
  const { reactions } = props;
  return (
    <>
      {reactions && Object.entries(reactions).map(([timestamp, reaction]) =>
        <span key={timestamp} style={{
          position: 'absolute',
          bottom: '0',
          left: `${parseInt(timestamp) % 100}vw`,
          pointerEvents: 'none'
        }}
          className={styles.fadeUpOutWiggle}
        >
          <Image src={twemoji.parse(reaction).match(/<img.*?src="(.*?)"/)[1]} alt={reaction} height={50} width={50} />
        </span>
      )}
    </>
  );
}