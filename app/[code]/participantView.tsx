import { app } from "@/components/data/firebase";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
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


  // function that adds the participant to the room once they have entered a name
  const setParticipantName = (_name: string) => {
    set(ref(database, `rooms/${code}/participants/${participant.uid}`), _name);
  };

  const raiseLowerHand = () => {
    if (!room.queue) {
      set(ref(database, `rooms/${code}/queue/${participant.uid}`), Date.now());
      return;
    }

    // participant is in queue, lower hand
    if (participant.uid in room.queue) {
      remove(ref(database, `rooms/${code}/queue/${participant.uid}`));

    } else {
      // participant is not in queue, add to queue 
      set(ref(database, `rooms/${code}/queue/${participant.uid}`), Date.now());
    }
  }

  const handleEmojiClick = (emoji: string) => {
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
  if (!name) return <EnterNameForm setParticipantName={setParticipantName} />;

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
      <div style={{
        height: "90vh",
        display: "flex",
        flexDirection: "column"
      }}>
        <SpeakerView room={room} participant={participant} code={code} />


        <div style={{
          display: "flex",
          flex: 0,
          position: 'fixed',
          bottom: 0,
          zIndex: 600,
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <button style={{
            padding: '3em',
            borderRadius: '20px',
            border: 'none',
            boxShadow: '10px 5px 15px rgba(0,0,0,0.5)',
            backgroundColor: "#6173fb",
            margin: '1em',
            WebkitAppearance: 'none',
          }}
            onClick={raiseLowerHand}
          >
            <Image src={room.queue && participant.uid in room.queue ? lowerHandEmoji : raiseHandEmoji} width={75} height={75} alt='raise or lower hand'></Image>
            <p style={{ marginBottom: 0, color: '#000' }}>{room.queue && participant.uid in room.queue ? 'lower hand' : 'raise hand'}</p>
          </button>
          <EmojiMenu emojis={['👏', '🔥', '🤔', '😲', '🤣']} onEmojiClick={handleEmojiClick} />

        </div>
      </div>

      {reactions && <ReactionsDisplay reactions={reactions} />}

    </>
  );
}

interface EnterNameFormProps {
  setParticipantName: (name: string) => void
}

// todo: validate that the name isn't appropriate and isn't yet taken 
function EnterNameForm(props: EnterNameFormProps) {
  const [userInput, setUserInput] = useState('');
  const { setParticipantName } = props;

  return (
    <Layout>
      <Container>
        <h1>enter your name</h1>
        <Input
          type='text'
          value={userInput}
          onChange={(e) => setUserInput((e.target as HTMLInputElement).value)}
          style={{ width: '100%' }}
        />
        <Button onClick={() => setParticipantName(userInput)}><p>confirm</p></Button>
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