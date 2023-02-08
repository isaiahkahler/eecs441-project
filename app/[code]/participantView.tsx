import { app } from "@/components/data/firebase";
import Button from "@/components/ui/button";
import CustomInput from "@/components/ui/input";
import { User } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { useEffect, useState } from "react";
import { Room } from "./page";


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

  // get or change name from the list of participants, if the user already joined 
  useEffect(() => {
    if(!room.participants) return;
    if(participant.uid in room.participants) {
      setName(room.participants[participant.uid]);
    }
  }, [room, participant]);

  // prompt the user to enter a name if they don't have one
  if (!name) return <EnterNameForm setParticipantName={setParticipantName} />;

  return (
    <>
      <h1>Client View</h1>
      <p>participants:</p>
      {room && room.participants && Object.entries(room.participants).map(([uid, name]) => <p key={uid}>{name}</p>)}
      <button onClick={() => {
        console.log('go do')
        alert(participant.uid)
      }}><p>click</p></button>
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
      <CustomInput type='text' value={userInput} onChange={(e) => setUserInput((e.target as HTMLInputElement).value)} />
      <Button onClick={() => setParticipantName(userInput)}><p>confirm</p></Button>
    </>
  );
}