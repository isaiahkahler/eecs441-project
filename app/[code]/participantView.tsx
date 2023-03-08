import { app } from "@/components/data/firebase";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { User } from "firebase/auth";
import { getDatabase, ref, remove, set } from "firebase/database";
import { useEffect, useState } from "react";
import { Room } from "./page";
import EmojiMenu from "@/components/ui/emoji";
import Speaker from "@/components/ui/speaking";
import Image from "next/image"
import twemoji from "twemoji"

interface ParticipantViewProps {
  code: string,
  room: Room,
  participant: User
}

export default function ParticipantView(props: ParticipantViewProps) {
  const { code, room, participant } = props;
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
    if(participant.uid in room.queue) {
      remove(ref(database, `rooms/${code}/queue/${participant.uid}`));

    } else {
      // participant is not in queue, add to queue 
      set(ref(database, `rooms/${code}/queue/${participant.uid}`), Date.now());
    }
  }

  // get or change name from the list of participants, if the user already joined 
  useEffect(() => {
    if(!room.participants) return;
    if(participant.uid in room.participants) {
      setName(room.participants[participant.uid]);
    }
  }, [room, participant]);

  // prompt the user to enter a name if they don't have one
  if (!name) return <EnterNameForm setParticipantName={setParticipantName} />;

  let queue = room.queue ? Object.entries(room.queue)
    .sort((a,b) => a[1] - b[1])
    .map(([uid, time]) => {
      return room.participants && room.participants[uid] ? room.participants[uid] : undefined;
    })
    .filter(item => item !== undefined && item !== null) : [];

  const regex = /<img.*?src="(.*?)"/;
  let lowerHandEmoji = twemoji.parse("🙇").match(regex)[1];
  let raiseHandEmoji = twemoji.parse("🙋").match(regex)[1];

  return (
    
    <>
    <div style={{
      height: "90vh",
      display: "flex",
      flexDirection: "column"
    }}>
       <Speaker style={{flex:"auto"}} queue={queue}/>


      <div style={{
        display: "flex",
        backgroundColor: "lavender",
        flex: 0
      }}>
        <Button style={{flex:"auto"}} onClick={raiseLowerHand}>
          <div>
            <p>{room.queue && participant.uid in room.queue ? 'lower hand' : 'raise hand'}</p>
            <Image src={room.queue && participant.uid in room.queue ? lowerHandEmoji : raiseHandEmoji} width={75} height={75}></Image>
          </div>
        </Button>
        <EmojiMenu style={{flex:"auto"}} participant={participant} emojis={['❤️', '👍️', '🔥', '🤔']} />
      </div>
    </div>

      <h1>Client View</h1>
      <h2>participants:</h2>
      {room && room.participants && Object.entries(room.participants).map(([uid, name]) => <p key={uid}>{name}</p>)}
      <h2>queue:</h2>
      
      {room.queue && Object.entries(room.queue).sort((a,b) => a[1] - b[1]).map(([uid, time]) => {return (<li key={uid}>{room.participants && room.participants[uid]}</li>)})}

    </>
  );
}

interface EnterNameFormProps {
  setParticipantName: (name: string) => void
}

// todo: validate that the name isn't appropriate and isn't yet taken 
function EnterNameForm (props: EnterNameFormProps) {
  const [userInput, setUserInput] = useState('');
  const {setParticipantName} = props;

  return (
    <>
      <h1>enter your name</h1>
      <Input type='text' value={userInput} onChange={(e) => setUserInput((e.target as HTMLInputElement).value)} />
      <Button onClick={() => setParticipantName(userInput)}><p>confirm</p></Button>
    </>
  );
}