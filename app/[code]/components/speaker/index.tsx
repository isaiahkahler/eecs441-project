import { app } from '@/components/data/firebase';
import { useStore } from '@/components/data/store';
import { IconButton } from '@/components/ui/button';
import { getLightColor } from '@/components/ui/colors';
import { mdiArrowDownRight } from '@mdi/js';
import Icon from '@mdi/react';
import { User } from 'firebase/auth';
import { getDatabase, ref, remove } from 'firebase/database';
import { useEffect, useState } from 'react';
import { Room } from '../../page';
import styles from './speaker.module.css'

interface SpeakerViewProps {
  room: Room,
  participant?: User,
  code: string
}

export default function SpeakerView(props: SpeakerViewProps) {
  const { room, code } = props;
  const { queue, participants } = room;
  const ownUid = props.participant ? props.participant.uid : null;
  const database = getDatabase(app);


  const [currentTime, setCurrentTime] = useState(Date.now());
  const [queueTime, setQueueTime] = useState(Date.now());
  const [lastPerson, setLastPerson] = useState<[string, number] | null>(null);

  const user = useStore(state => state.user);

  // update the current time every second
  useEffect(() => {
    const updateTime = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(updateTime);
    }
  }, []);

  // find the first in line
  // [participant uid, timestamp of hand raise]
  let sortedQueue = queue ? Object.entries(queue)
    .sort((a, b) => a[1] - b[1])
    .filter(item => item !== undefined && item !== null) : [];

  const firstInLine = sortedQueue.length > 0 ? sortedQueue[0] : null;
  const others = sortedQueue.length > 1 ? sortedQueue.slice(1) : null;

  // if the first person in line changes, update the timer 
  useEffect(() => {
    if (firstInLine && lastPerson && firstInLine[0] == lastPerson[0] && firstInLine[1] == lastPerson[1]) {
      return
    }

    console.log('update timer')
    setLastPerson(firstInLine);
    setQueueTime(Date.now());
    setCurrentTime(Date.now());
  }, [firstInLine, lastPerson]);

  // clear the first speaker if the admin clicks the dismiss button
  const dismissFirstSpeaker = () => {
    if(!firstInLine) return;
    remove(ref(database, `rooms/${code}/queue/${firstInLine[0]}`));
  }

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
            }}>{Math.floor((currentTime - queueTime) / 1000)}</h2>

            {/* admin button to dismiss speaker */}
            {user && user.uid && user.uid === room.owner && <IconButton
              style={{ position: 'absolute', right: '1em', bottom: '0em' }}
              onClick={dismissFirstSpeaker}
            >
              <Icon path={mdiArrowDownRight} size={1} />
            </IconButton>}

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