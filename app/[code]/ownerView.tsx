import { Room } from "./page";
import QRCode from 'react-qr-code'
import Button from "@/components/ui/button";
import Layout from "@/components/ui/layout";
import Container from "@/components/ui/container";
import Speaker from "@/components/ui/speaking";
import { getDatabase, ref, remove, set } from "firebase/database";
import { app } from "@/components/data/firebase";
import { getColor } from "@/components/ui/colors";
import { useState } from "react";
import styles from './ownerView.module.css';

interface OwnerViewProps {
  code: string,
  room: Room
}

export default function OwnerView(props: OwnerViewProps) {
  const { code, room } = props;


  if (!room.started) {
    return <WaitingRoom {...props} />
  }

  let queue = room.queue ? Object.entries(room.queue)
    .sort((a, b) => a[1] - b[1])
    .map(([uid, time]) => {
      return room.participants && room.participants[uid] ? room.participants[uid] : 'undefined';
    })
    .filter(item => item !== undefined && item !== null && item !== '') : [];

  return (
    <>
      <Speaker queue={queue} />
      <h1>Owner View</h1>
      <h1>the code is {code}</h1>
      <p>participants:</p>
      {room && room.participants && Object.entries(room.participants).map(([uid, name]) => <p key={uid}>{name}</p>)}

      <h2>queue:</h2>
      <ol>
        {room.queue && Object.entries(room.queue).sort((a, b) => b[1] - a[1]).map(([uid, time]) => { return (<li key={uid}>{room.participants && room.participants[uid]}</li>) })}
      </ol>
      {/* {JSON.stringify(room.queue ? Object.entries(room.queue).sort((a,b) => b[1] - a[1]) : {})} */}
    </>
  );
}


function WaitingRoom(props: OwnerViewProps) {
  const { code, room } = props;
  const { participants } = room;

  const database = getDatabase(app);

  const [kickConfirm, setKickConfirm] = useState<string | null>();

  // set the property 'started' on the room to 'true'
  const handleStartRoom = () => {
    set(ref(database, `rooms/${code}/started`), true);
  };

  const handleKickParticipant = (id: string) => {
    if (!kickConfirm) {
      setKickConfirm(id);
      setTimeout(() => setKickConfirm(null), 4000);
    } else if (kickConfirm === id) {
      // kick player
      remove(ref(database, `rooms/${code}/participants/${id}`));
      console.log(1)
      setKickConfirm(null);
    } else {
      // clicked another name
      console.log(2)
      setKickConfirm(null);
    }
    
  };


  return (
    <Layout>
      <Container>
        <div>
          <h1 style={{ textAlign: 'center' }}>Join this Room!</h1>

          <div style={{
            display: 'flex',
            flexDirection: 'row'
          }}>
            <div style={{ width: '70%', display: 'flex', alignItems: 'center' }}>
              <h1>Go to speakup.fyi/<strong style={{ fontWeight: 'bolder' }}>{code}</strong></h1>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <QRCode value={`https://speakup.fyi/${code}`} style={{ width: 'min(15vw, 15vh)', height: 'min(15vw, 15vh)' }} />
              <p style={{ margin: '0.5em' }}>or scan to join</p>
            </div>
          </div>

        </div>

        <hr />

        <h2>participants:</h2>

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap'
        }}>
          {participants && Object.entries(participants).map(([id, name], index) =>
            <span key={id} style={{margin: '0 .5em'}}>
              <Button onClick={() => handleKickParticipant(id)} style={{backgroundColor: getColor(index)}}>
                <h3 className={kickConfirm === id ? styles.fadeOut : ''}>{kickConfirm === id ? 'click again to kick' : name}</h3>
                </Button>
            </span>
          )}

        </div>

        <span style={{ position: 'fixed', right: '2em', bottom: '2em' }}>

          <Button onClick={handleStartRoom}><h2>Start →</h2></Button>
        </span>
      </Container>
    </Layout>
  );
}