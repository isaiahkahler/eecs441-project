import { Room } from "./page";

interface OwnerViewProps {
  code: string,
  room: Room
}

export default function OwnerView (props: OwnerViewProps) {
  const {code, room} = props;

  return (
    <>
      <h1>Owner View</h1>
      <h1>the code is {code}</h1>
      <p>participants:</p>
      {room && room.participants && Object.entries(room.participants).map(([uid, name]) => <p key={uid}>{name}</p>)}

      <h2>queue:</h2>
      
      {room.queue && Object.entries(room.queue).sort((a,b) => b[1] - a[1]).map(([uid, time]) => {return (<li key={uid}>{room.participants && room.participants[uid]}</li>)})}

      {/* {JSON.stringify(room.queue ? Object.entries(room.queue).sort((a,b) => b[1] - a[1]) : {})} */}
    </>
  );
}