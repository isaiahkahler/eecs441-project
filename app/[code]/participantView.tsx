import { app } from "@/components/data/firebase";
import Button from "@/components/ui/button";
import Input, { InputInvalidMessage } from "@/components/ui/input";
import { User } from "firebase/auth";
import { getDatabase, ref, remove, set } from "firebase/database";
import { PropsWithChildren, useEffect, useState } from "react";
import { Room } from "./page";
import EmojiMenu, { convertEmoji } from "@/components/ui/emoji";
import Image from "next/image"
import Layout from "@/components/ui/layout";
import Container from "@/components/ui/container";
import ReactionsDisplay from "./components/reactions";
import SpeakerView from "./components/speaker";
import { profanity } from '@2toad/profanity';
import styles from './participantView.module.css'
import { RoomSummary } from "./ownerView";

interface ParticipantViewProps {
  code: string,
  room: Room,
  participant: User
}

export default function ParticipantView(props: ParticipantViewProps) {
  const { code, room, participant } = props;
  const { reactions } = room;
  const database = getDatabase(app);

  const [name, setName] = useState<string | null>(null);

  // get or change name from the list of participants, if the user already joined 
  useEffect(() => {
    if (!room.participants) {
      setName(null);
      return;
    };
    if (participant.uid in room.participants) {
      setName(room.participants[participant.uid]);
    } else {
      setName(null);
    }
  }, [room, participant]);

  // function that adds the participant to the room once they have entered a name
  const setParticipantName = (_name: string) => {
    set(ref(database, `rooms/${code}/participants/${participant.uid}`), _name);
  };



  if (room.ended) {
    return <RoomSummary room={room} code={code} />
  }


  // prompt the user to enter a name if they don't have one
  if (!name) return <EnterNameForm setParticipantName={setParticipantName} room={room} />;

  if (!room.started) {
    return <WaitingRoom {...props} />
  }

  return (

    <>
      <div className={styles.participantView}>
        <SpeakerView room={room} participantId={participant ? participant.uid : undefined} code={code} />


        <ParticipantControls room={room} code={code} participantId={participant.uid} />
      </div>

      {reactions && <ReactionsDisplay reactions={reactions} />}


    </>
  );
}

interface PointsMessage {
  room: Room,
  uid: string
}

function PointsMessage(props: PointsMessage) {
  const { room, uid } = props;
  const sortedPoints = room.points ? Object.entries(room.points).sort((a, b) => a[1] - b[1]) : [];
  const myIndex = sortedPoints.findIndex(element => element[0] == uid);
  let tag = '';
  if(myIndex === -1) {
    return (
      <p>You have {room.points ? (uid in room.points ? room.points[uid] : 0) : 0} points. {tag}</p>
    );
  }
  if (myIndex + 1 < sortedPoints.length && myIndex !== -1 && room.participants) {
    if (sortedPoints[myIndex + 1][1] === sortedPoints[myIndex][1]) {
      tag = ` You're tied with ${room.participants[sortedPoints[myIndex + 1][0]]}!`
    } else {
      tag = `You're ${sortedPoints[myIndex + 1][1] - sortedPoints[myIndex][1]} points behind ${room.participants[sortedPoints[myIndex + 1][0]]}!`
    }
  } else if (myIndex + 1 === sortedPoints.length) {
    tag = `You have the highest score!`
  }
  return (
    <p>You have {room.points ? (uid in room.points ? room.points[uid] : 0) : 0} points. {tag}</p>
  );
}




interface EnterNameFormProps {
  setParticipantName: (name: string) => void,
  room: Room
}

// todo: validate that the name isn't appropriate and isn't yet taken 
export function EnterNameForm(props: EnterNameFormProps) {
  const [userInput, setUserInput] = useState('');
  const [hasProfanityError, setHasProfanityError] = useState(false);
  const [hasDuplicateError, setHasDuplicateError] = useState(false);
  const { setParticipantName, room } = props;

  const participantNames = room.participants ? Object.values(room.participants) : [];

  return (
    <Layout>
      <Container>
        <h1>enter your name</h1>
        <Input
          type='text'
          value={userInput}
          onChange={(e) => setUserInput((e.target as HTMLInputElement).value)}
          style={{ width: '100%' }}
          isValid={!hasProfanityError && !hasDuplicateError}
        />
        <InputInvalidMessage isValid={!hasProfanityError} >Please choose a different name.</InputInvalidMessage>
        <InputInvalidMessage isValid={!hasDuplicateError} >That name already exists in this room.</InputInvalidMessage>
        <Button onClick={() => {
          if (profanity.exists(userInput)) {
            setHasProfanityError(true);
            setUserInput('');
            return;
          }
          if (participantNames.includes(userInput)) {
            setHasDuplicateError(true);
            setUserInput('');
            return;
          }

          setParticipantName(userInput)
        }}><p>confirm</p></Button>
      </Container>
    </Layout>
  );
}

function WaitingRoom(props: ParticipantViewProps) {
  const { room } = props;
  return (
    <Layout>
      <Container>
        <h1>Waiting for the room to start...</h1>
        <h2>How to use SpeakUp:</h2>

        <div className={styles.instructionBlock}>
          <Image src={convertEmoji('🙋')} width={40} height={40} alt='raise hand emoji' />
          <p style={{ fontSize: 'large' }}><strong>Raise your hand</strong> to join the queue.</p>
        </div>

        <div className={styles.instructionBlock}>
          <p><strong>SpeakUp!</strong> when its your turn.</p>
          <Image src={convertEmoji('🗣️')} width={40} height={40} alt='raise hand emoji' />
        </div>

        <div className={styles.instructionBlock}>
          <Image src={convertEmoji('🙇')} width={40} height={40} alt='raise hand emoji' />
          <p><strong>Lower your hand</strong> when you&apos;re done talking.</p>
        </div>

        {!room.disableReactions && <div className={styles.instructionBlock}>
          <p>And <strong>React</strong> using emojis!</p>
          <Image src={convertEmoji('👏')} width={40} height={40} alt='raise hand emoji' />
        </div>}

      </Container>
    </Layout>
  );
}

interface ParticipantControlsProps {
  room: Room,
  code: string,
  participantId: string
}

export function ParticipantControls(props: PropsWithChildren<ParticipantControlsProps>) {
  const { room, code, participantId, children } = props;

  const [coolDown, setCoolDown] = useState(false);
  const database = getDatabase(app);

  let sortedQueue = room.queue ? Object.entries(room.queue)
    .sort((a, b) => a[1] - b[1])
    .filter(item => item !== undefined && item !== null) : [];

  const firstInLine = sortedQueue.length > 0 ? sortedQueue[0] : null;

  const raiseHand = () => {
    set(ref(database, `rooms/${code}/queue/${participantId}`), Date.now());

    // set queue time if they are the first in the queue (variable tracks how long someone is at the top)
    if (!room.queue) {
      set(ref(database, `rooms/${code}/queueTime`), Date.now());
    }
  }

  const lowerHand = () => {
    // remove from queue
    remove(ref(database, `rooms/${code}/queue/${participantId}`));
    // set queueTime (variable tracks how long someone is at the top)
    if (firstInLine && firstInLine[0] === participantId) {
      set(ref(database, `rooms/${code}/queueTime`), Date.now());
    }
    setCoolDown(true);
    setTimeout(() => setCoolDown(false), 2000);
  }

  const raiseLowerHand = () => {
    // no queue exists, user wants to raise hand
    if (!room.queue) {
      raiseHand();
      return;
    }

    // participant is in queue, lower hand
    if (participantId in room.queue) {
      lowerHand();
    } else {
      // participant is not in queue, add to queue 
      raiseHand();
    }
  }

  const handleReactionClick = (emoji: string) => {
    (async () => {
      // console.log(emoji);
      const reactionPath = `rooms/${code}/reactions/${Date.now()}`;
      set(ref(database, reactionPath), emoji);

      setTimeout(() => {
        remove(ref(database, reactionPath));
      }, 5000);
    })();
  }

  return (
    <div className={styles.controlsContainer}>
      <button className={styles.raiseLowerButton}
        disabled={coolDown}
        onClick={raiseLowerHand}
      >
        <Image src={room.queue && participantId in room.queue ? convertEmoji("🙇") : convertEmoji("🙋")} width={75} height={75} alt='raise or lower hand'></Image>
        <p className={styles.raiseLowerText}>{room.queue && participantId in room.queue ? 'lower hand' : 'raise hand'}</p>
        <div className={`${styles.raiseLowerCoolDownOverlay} ${coolDown ? styles.raiseLowerCoolDownOverlayAnimation : ''}`} />
      </button>
      {!room.disableReactions && <EmojiMenu emojis={room.customReactions ? room.customReactions.split(',') : ['👏', '🔥', '🤔', '😲', '🤣']} onEmojiClick={handleReactionClick} />}

      {room.pointsEnabled && participantId && <PointsMessage room={room} uid={participantId} />}
      {children}
    </div>
  );
}