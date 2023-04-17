import { app } from '@/components/data/firebase';
import { useStore } from '@/components/data/store';
import { IconButton } from '@/components/ui/button';
import { mdiArrowDownRight } from '@mdi/js';
import Icon from '@mdi/react';
import { User } from 'firebase/auth';
import { getDatabase, ref, remove, set } from 'firebase/database';
import React, { HTMLProps, PropsWithChildren, useEffect, useId, useState } from 'react';
import { convertUidToColor } from '../../ownerView';
import { Participants, QueueParticipant, Room } from '../../page';
import styles from './speaker.module.css'

interface SpeakerViewProps {
  room: Room,
  participantId?: string,
  code: string
}

export default function SpeakerView(props: SpeakerViewProps) {
  const { room, code, participantId } = props;
  const { queue, participants, points } = room;
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

  const [lastSortedQueue, setLastSortedQueue] = useState(sortedQueue);
  const [exitingParticipants, setExitingParticipants] = useState<string[]>([]);

  function getQueuePosition(uid: string) {
    return lastSortedQueue.findIndex(value => value[0] === uid);
  }

  useEffect(() => {
    function arrayEquals(a: [string, number][], b: [string, number][]) {
      return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val[0] === b[index][0] && val[1] === b[index][1]);
    }

    let sortedQueue = queue ? Object.entries(queue)
      .sort((a, b) => a[1] - b[1])
      .filter(item => item !== undefined && item !== null) : [];

    if (arrayEquals(sortedQueue, lastSortedQueue)) {
      return;
    }

    const newKeys = new Set(sortedQueue.map(item => item[0]));
    const deletedKeys = lastSortedQueue.map(item => item[0]).filter((uid) => !newKeys.has(uid));
    if (deletedKeys.length === 0) {
      setLastSortedQueue(sortedQueue);
    } else {
      setTimeout(() => setLastSortedQueue(sortedQueue), 500);
    }
    setExitingParticipants(deletedKeys);
  }, [lastSortedQueue, queue]);

  // if the first person in line changes, update the timer 
  useEffect(() => {
    if (firstInLine && lastPerson && firstInLine[0] == lastPerson[0] && firstInLine[1] == lastPerson[1]) {
      return
    }
    if (firstInLine === null && lastPerson === null) {
      return
    }

    console.log('update last person', firstInLine && firstInLine[0]);
    setLastPerson(firstInLine);
    setLastQueueTime(queueTime);
    setCurrentTime(Date.now());
  }, [firstInLine, lastPerson, queueTime]);

  // when the user leaves the top of the queue, award them points
  useEffect(() => {
    if (firstInLine && lastPerson && firstInLine[0] == lastPerson[0] && firstInLine[1] == lastPerson[1]) {
      return
    }
    if (lastPerson && lastPerson[0] === participantId) {
      // console.log(`you were at the top for ${queueTime - lastQueueTime}`)
      const timeDifference = queueTime - lastQueueTime;
      if (timeDifference > 5000) {
        setGainPoints(timeDifference);
      }
    }
  }, [firstInLine, lastPerson, participantId, queueTime, lastQueueTime])

  // give the user points once
  useEffect(() => {
    if (!gainPoints) return;
    if (!participantId) return;

    const currentPoints = points ? (participantId in points ? points[participantId] : 0) : 0;
    // console.log('setting points! current:', currentPoints, 'new:', Math.floor(gainPoints / 1000))
    set(ref(database, `rooms/${code}/points/${participantId}`), currentPoints + Math.floor(gainPoints / 1000));
    setGainPoints(null);
  }, [code, database, gainPoints, participantId, points])

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
      <div style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        justifyContent: 'center'
      }}>

        <div style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '2em 0',
          maxWidth: '680px',
          position: 'relative',
          margin: '0 1rem'
        }}>

          {participants && Object.entries(participants).map(([uid, participantName]) => {
            const index = getQueuePosition(uid);
            const isMyself = participantId && participantId === uid;
            if (index === -1 || index > 9) {
              return <></>;
            }

            return (
              <div
                key={uid}
                className={`${styles.speakingCard} ${styles.fadeIn} ${(exitingParticipants.includes(uid)) ? styles.fadeOut : styles.fadeIn}`}
                style={{
                  position: 'absolute',
                  backgroundColor: convertUidToColor(uid),
                  zIndex: `${500 - index}`,
                  width: '100%',
                  transform: `translate3d(0,${(Math.log10(index + 1) * 100) * 3}%,0) scale(${1 - (index / 10)})`,
                  transition: '500ms'
                }}>
                {index === 0 && <h2 style={{
                  position: 'absolute',
                  right: '1em',
                  top: '0em',
                  color: 'inherit'
                }}>{Math.floor((currentTime - queueTime) / 1000)}</h2>}

                {index === 0 && user && user.uid && user.uid === room.owner && <IconButton
                  style={{ position: 'absolute', right: '1em', bottom: '0em' }}
                  onClick={dismissFirstSpeaker}
                >
                  <Icon path={mdiArrowDownRight} size={1} />
                </IconButton>}

                <h1>
                  {participantId && participantId === uid && participantId !== room.owner ? 'you' : participantName}
                </h1>
                <p>{index === 0 ? (isMyself ? 'are speaking' : 'is speaking') : (index === 1 ? (isMyself ? 'are next' : 'is next') : 'after')}</p>
              </div>
            );

          })}

        </div>
      </div>
    </>
  );
}

