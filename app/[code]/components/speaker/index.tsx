import { app } from '@/components/data/firebase';
import { useStore } from '@/components/data/store';
import { IconButton } from '@/components/ui/button';
import { mdiArrowDownRight } from '@mdi/js';
import Icon from '@mdi/react';
import { User } from 'firebase/auth';
import { getDatabase, ref, remove, set } from 'firebase/database';
import { useEffect, useState } from 'react';
import { convertUidToColor } from '../../ownerView';
import { Room } from '../../page';
import styles from './speaker.module.css'

interface SpeakerViewProps {
  room: Room,
  participant?: User,
  code: string
}

export default function SpeakerView(props: SpeakerViewProps) {
  const { room, code } = props;
  const { queue, participants, points } = room;
  const ownUid = props.participant ? props.participant.uid : null;
  const database = getDatabase(app);


  const [currentTime, setCurrentTime] = useState(Date.now());
  const [lastPerson, setLastPerson] = useState<[string, number] | null>(null);
  const [gainPoints, setGainPoints] = useState<number | null>(null);

  const [lastQueueTime, setLastQueueTime] = useState<number>(0);
  const queueTime = room.queueTime ? room.queueTime : 0;

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
    if (firstInLine === null && lastPerson === null) {
      return
    }

    // console.log('update last person');
    setLastPerson(firstInLine);
    setLastQueueTime(queueTime);
    setCurrentTime(Date.now());
  }, [firstInLine, lastPerson, queueTime]);

  // when the user leaves the top of the queue, award them points
  useEffect(() => {
    if (firstInLine && lastPerson && firstInLine[0] == lastPerson[0] && firstInLine[1] == lastPerson[1]) {
      return
    }
    if (lastPerson && lastPerson[0] === ownUid) {
      // console.log(`you were at the top for ${queueTime - lastQueueTime}`)
      const timeDifference = queueTime - lastQueueTime;
      if (timeDifference > 5000) {
        setGainPoints(timeDifference); 
      }
    } 
  }, [firstInLine, lastPerson, ownUid, queueTime, lastQueueTime])

  // give the user points once
  useEffect(() => {
    if(!gainPoints) return;
    if(!ownUid) return;

    const currentPoints = points ? (ownUid in points ? points[ownUid] : 0) : 0;
    // console.log('setting points! current:', currentPoints, 'new:', Math.floor(gainPoints / 1000))
    set(ref(database, `rooms/${code}/points/${ownUid}`), currentPoints + Math.floor(gainPoints / 1000));
    setGainPoints(null);
  }, [code, database, gainPoints, ownUid, points])

  // clear the first speaker if the admin clicks the dismiss button
  const dismissFirstSpeaker = () => {
    if (!firstInLine) return;
    // remove from queue
    remove(ref(database, `rooms/${code}/queue/${firstInLine[0]}`));

    // set queueTime
    set(ref(database, `rooms/${code}/queueTime`), Date.now());
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
        {/* message displayed if queue is empty */}
        {!room.queue && <div className={`${styles.speakingCard} ${styles.fadeIn}`} style={{ boxShadow: 'none', border: '1px solid #aaa' }}>
          <h1>The Queue is Empty</h1>
          <h2>Raise your hand to join</h2>
        </div>}

        {firstInLine &&
          <div
            className={`${styles.fadeInUp} ${styles.speakingCard}`}
            style={{
              maxWidth: '680px',
              backgroundColor: convertUidToColor(firstInLine[0]),
              position: 'relative',
            }}>
            {/* timer */}
            <h2 style={{
              position: 'absolute',
              right: '1em',
              top: '0em',
              color: 'inherit'
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
        position: 'relative'

      }}>

        {others && others.map(([uid, timestamp], index) =>
          <div
            key={uid}
            className={`${styles.fadeInUp} ${styles.speakingCard}`}
            style={{
              maxWidth: `calc(680px - ${(index + 1) * 50}px)`,
              backgroundColor: convertUidToColor(uid),
              position: 'absolute',
              zIndex: `${500 - index}`,
              top: `${index * 24}vmin`,
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