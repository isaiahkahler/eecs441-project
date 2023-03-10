import { Room } from "./page";
import QRCode from 'react-qr-code'
import Button from "@/components/ui/button";
import Layout from "@/components/ui/layout";
import Container from "@/components/ui/container";

interface OwnerViewProps {
  code: string,
  room: Room
}

export default function OwnerView(props: OwnerViewProps) {
  const { code, room } = props;

  if (!room.started) {
    return <WaitingRoom {...props} />
  }

  return (
    <>
      <h1>Owner View</h1>
      <h1>the code is {code}</h1>
      <p>participants:</p>
      {room && room.participants && Object.entries(room.participants).map(([uid, name]) => <p key={uid}>{name}</p>)}

      <h2>queue:</h2>

      {room.queue && Object.entries(room.queue).sort((a, b) => b[1] - a[1]).map(([uid, time]) => { return (<li key={uid}>{room.participants && room.participants[uid]}</li>) })}

      {/* {JSON.stringify(room.queue ? Object.entries(room.queue).sort((a,b) => b[1] - a[1]) : {})} */}
    </>
  );
}

interface WaitingRoomProps {
  code: string,
  room: Room
}

function WaitingRoom(props: WaitingRoomProps) {
  const { code, room } = props;
  return (
    <Layout>
      <Container>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h1>Join this Room!</h1>
          <h2>Go to speakup.fyi/<h1 style={{display: 'inline'}}>{code}</h1></h2>
          <p>or scan to join</p>
          <QRCode value={`https://speakup.fyi/${code}`} style={{ width: 'min(20vw, 20vh)' }} />
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          
        }}>

        </div>

        <Button><p>Start →</p></Button>
      </Container>
    </Layout>
  );
}