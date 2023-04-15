import { app } from "@/components/data/firebase";
import Button from "@/components/ui/button";
import Input, { InputInvalidMessage } from "@/components/ui/input";
import { User } from "firebase/auth";
import { getDatabase, ref, remove, set } from "firebase/database";
import { useEffect, useState } from "react";
import { Room } from "./page";
import EmojiMenu from "@/components/ui/emoji";
import Image from "next/image"
import twemoji from "twemoji"
import Layout from "@/components/ui/layout";
import Container from "@/components/ui/container";
import ReactionsDisplay from "./components/reactions";
import SpeakerView from "./components/speaker";
import { profanity } from '@2toad/profanity';
import styles from './participantView.module.css'

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

  const [coolDown, setCoolDown] = useState(false);


  // function that adds the participant to the room once they have entered a name
  const setParticipantName = (_name: string) => {
    set(ref(database, `rooms/${code}/participants/${participant.uid}`), _name);
  };

  const raiseHand = () => {
    set(ref(database, `rooms/${code}/queue/${participant.uid}`), Date.now());
  }

  // temporary delete
  useEffect(() => {
    console.log('cooldown change:', coolDown)
  }, [coolDown]);

  const lowerHand = () => {
    remove(ref(database, `rooms/${code}/queue/${participant.uid}`));
    setCoolDown(true);
    setTimeout(() => setCoolDown(false), 3000);
  }

  const raiseLowerHand = () => {
    // no queue exists, user wants to raise hand
    if (!room.queue) {
      raiseHand();
      return;
    }

    // participant is in queue, lower hand
    if (participant.uid in room.queue) {
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

  // prompt the user to enter a name if they don't have one
  if (!name) return <EnterNameForm setParticipantName={setParticipantName} room={room} />;

  let queue = room.queue ? Object.entries(room.queue)
    .sort((a, b) => a[1] - b[1])
    .map(([uid, time]) => {
      return room.participants && room.participants[uid] ? room.participants[uid] : 'undefined';
    })
    .filter(item => item !== undefined && item !== null && item !== '') : [];

  const regex = /<img.*?src="(.*?)"/;
  let lowerHandEmoji = (twemoji.parse("🙇", { folder: 'svg', ext: '.svg' }).match(regex) || ['', ''])[1];
  let raiseHandEmoji = (twemoji.parse("🙋", { folder: 'svg', ext: '.svg' }).match(regex) || ['', ''])[1];

  if (!room.started) {
    return <WaitingRoom {...props} />
  }

  return (

    <>
      <div className={styles.participantView}>
        <SpeakerView room={room} participant={participant} code={code} />


        <div className={styles.controlsContainer}>
          <button className={styles.raiseLowerButton}
            disabled={coolDown}
            onClick={raiseLowerHand}
          >
            <Image src={room.queue && participant.uid in room.queue ? lowerHandEmoji : raiseHandEmoji} width={75} height={75} alt='raise or lower hand'></Image>
            <p className={styles.raiseLowerText}>{room.queue && participant.uid in room.queue ? 'lower hand' : 'raise hand'}</p>
            <div className={`${styles.raiseLowerCoolDownOverlay} ${coolDown ? styles.raiseLowerCoolDownOverlayAnimation : ''}`} />
          </button>
          <EmojiMenu emojis={['👏', '🔥', '🤔', '😲', '🤣']} onEmojiClick={handleReactionClick} />

        </div>
      </div>

      {reactions && <ReactionsDisplay reactions={reactions} />}

    </>
  );
}

interface EnterNameFormProps {
  setParticipantName: (name: string) => void,
  room: Room
}

// todo: validate that the name isn't appropriate and isn't yet taken 
function EnterNameForm(props: EnterNameFormProps) {
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
  return (
    <Layout>
      <Container>
        <h1>Waiting for the room to start...</h1>
        <h2>How to use SpeakUp:</h2>
        <p><strong>Raise your hand</strong> to join the queue.</p>
        <p><strong>SpeakUp!</strong> when its your turn.</p>
        <p><strong>Lower your hand</strong> when you&apos;re done talking.</p>
        <p>And <strong>React</strong> using emojis!</p>
      </Container>
    </Layout>
  );
}