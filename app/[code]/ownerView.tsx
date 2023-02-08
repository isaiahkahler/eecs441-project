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
    </>
  );
}