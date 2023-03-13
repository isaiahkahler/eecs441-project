import { getLightColor } from '@/components/ui/colors';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Room } from '../../page';
import styles from './speaker.module.css'

interface SpeakerViewProps {
  room: Room,
  participant?: User
}

export default function SpeakerView(props: SpeakerViewProps) {
  const { room } = props;
  const { queue, participants } = room;
  const ownUid = props.participant ? props.participant.uid : null;

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const updateTime = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(updateTime);
    }
  }, []);

  let sortedQueue = queue ? Object.entries(queue)
    .sort((a, b) => a[1] - b[1])
    .filter(item => item !== undefined && item !== null) : [];

  const firstInLine = sortedQueue.length > 0 ? sortedQueue[0] : null;
  const others = sortedQueue.length > 1 ? sortedQueue.slice(1) : null;

  return (
    <>
      {/* container for the first speaker */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2em 0'
      }}>

        {firstInLine &&
          <div
            className={`${styles.fadeIn} ${styles.speakingCard}`}
            style={{
              maxWidth: '680px',
              backgroundColor: getLightColor(firstInLine[1]),
              position: 'relative',
            }}>
            <h2 style={{
              position: 'absolute',
              right: '1em',
              top: '0em'
            }}>{Math.floor((currentTime - firstInLine[1]) / 1000)}</h2>

            <h1 style={{
              fontSize: '10vmin',
              margin: '0'
            }}>
              {ownUid && ownUid === firstInLine[0] ? 'you' : (participants ? participants[firstInLine[0]] : '')}
            </h1>
            <p>{ownUid && ownUid === firstInLine[0] ? 'are speaking' : 'is speaking'}</p>
          </div>
        }

      </div>

      {/* container for the other speakers in line */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // padding: '0 1em',
        position: 'relative'

      }}>

        {others && others.map(([uid, timestamp], index) =>
          <div
            key={uid}
            className={`${styles.fadeIn} ${styles.speakingCard}`}
            style={{
              maxWidth: `calc(680px - ${(index + 1) * 50}px)`,
              backgroundColor: getLightColor(timestamp),
              position: 'absolute',
              zIndex: `${500 - index}`,
              top: `${index * 24}vmin`,
              // margin: '2em'
            }}>
            <h1 style={{
              fontSize: `calc(10vmin - ${(index + 1) * 10}px)`,
              margin: '0'
            }}>
              {ownUid && ownUid === uid ? 'you' : (participants ? participants[uid] : '')}
            </h1>
            {index === 0 ? <p>{ownUid && ownUid === uid ? 'are next' : 'is next'}</p> : <p>after</p>}
          </div>
        )}
      </div>
    </>
  );
}