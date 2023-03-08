import { Room } from "./page";
import Speaker from "@/components/ui/speaking";

interface OwnerViewProps {
  code: string,
  room: Room
}

export default function OwnerView (props: OwnerViewProps) {
  const {code, room} = props;

  let queue = room.queue ? Object.entries(room.queue)
    .sort((a,b) => a[1] - b[1])
    .map(([uid, time]) => {
      return room.participants && room.participants[uid] ? room.participants[uid] : undefined;
    })
    .filter(item => item !== undefined && item !== null) : [];

  return (
    <>
      <Speaker queue={queue}/>
      <h1>Owner View</h1>
      <h1>the code is {code}</h1>
      <p>participants:</p>
      {room && room.participants && Object.entries(room.participants).map(([uid, name]) => <p key={uid}>{name}</p>)}

      <h2>queue:</h2>
      <ol>
        {room.queue && Object.entries(room.queue).sort((a,b) => b[1] - a[1]).map(([uid, time]) => {return (<li key={uid}>{room.participants && room.participants[uid]}</li>)})}
      </ol>
      {/* {JSON.stringify(room.queue ? Object.entries(room.queue).sort((a,b) => b[1] - a[1]) : {})} */}
    </>
  );
}