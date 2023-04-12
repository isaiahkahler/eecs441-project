import { Room } from "./page";
import QRCode from 'react-qr-code'
import Button, { IconButton } from "@/components/ui/button";
import Layout from "@/components/ui/layout";
import Container from "@/components/ui/container";
import { getDatabase, ref, remove, set } from "firebase/database";
import { app } from "@/components/data/firebase";
import { getColor } from "@/components/ui/colors";
import { useState } from "react";
import styles from './ownerView.module.css';
import Icon from "@mdi/react";
import { mdiAccountGroup, mdiClose, mdiNotificationClearAll } from "@mdi/js";
import twemoji from "twemoji";
import Image from "next/image";
import ReactionsDisplay from "./components/reactions";
import SpeakerView from "./components/speaker";
import { database } from "firebase-admin";

interface OwnerViewProps {
  code: string,
  room: Room
}


export default function OwnerView(props: OwnerViewProps) {
  const { code, room } = props;
  const { participants, queue, reactions } = room;
  const database = getDatabase(app);

  const [confirmDismiss, setConfirmDismiss] = useState(false);
  const [kickConfirm, setKickConfirm] = useState<string | null>();
  const [openModal, setOpenModal] = useState(false);


  if (!room.started) {
    return <WaitingRoom {...props} />
  }

  // clear all the participants if the clear all button is clicked
  const dismissAll = () => {
    if (!confirmDismiss) {
      setConfirmDismiss(true);
      setTimeout(() => setConfirmDismiss(false), 4000);
      return;
    } else {
      remove(ref(database, `rooms/${code}/queue`))
      setConfirmDismiss(false);
    }
  }


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
    <>
      <SpeakerView room={room} code={code} />

      <h2 style={{ position: 'fixed', bottom: 0, textAlign: 'center', width: '100vw', zIndex: 502 }}>Join at SpeakUp.fyi/<strong>{code}</strong></h2>

      <span style={{ position: 'fixed', bottom: '1em', right: '1em' }}>
        <QRCode value={`https://speakup.fyi/${code}`} style={{ width: 'min(15vw, 15vh)', height: 'min(15vw, 15vh)' }} />
      </span>

      {/* top left corner container with buttons  */}
      <span style={{
        position: 'absolute',
        left: '1em',
        top: '1em',
        display: 'flex',
        flexDirection: 'column',
        // justifyContent: 'flex-start'
        alignItems: 'flex-start'
      }}>
        {/* indicator for number of participants */}
        <IconButton style={{ padding: '0.25em 0.5em' }} onClick={() => setOpenModal(true)}>
          <h2 style={{ display: 'inline', marginRight: '0.25em' }}>{participants ? Object.keys(participants).length : '0'}</h2><Icon path={mdiAccountGroup} size={1.5} />
        </IconButton>
        {/* button to clear all participants */}
        {/* <span style={{display: 'flex'}}> */}
        <IconButton onClick={dismissAll}>
          <Icon path={mdiNotificationClearAll} size={1.5} />
          {confirmDismiss && <p style={{ fontWeight: 'bold', paddingRight: '0.5em' }} className={styles.fadeOut}>Click again to dismiss all hands</p>}
        </IconButton>
        {/* </span> */}
      </span>

      {reactions && <ReactionsDisplay reactions={reactions} />}


      {openModal && <div style={{
        position: 'fixed',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        top: 0,
        backgroundColor: "rgba(0,0,0,0.25)"
      }}
        onClick={(e) => {
          if(e.target !== e.currentTarget) return;
          console.log('clicked outside')
        }}
      >
        <div style={{
          width: 'min(680px, 90vw)',
          height: '80vh',
          backgroundColor: "#fff",
          borderRadius: '20px',
          padding: '1rem 1.5rem',
          position: 'relative'
        }}>
          <h1>participants</h1>

          <IconButton style={{position: 'absolute', top: '1.5em', right: '1.5em', backgroundColor: "transparent", border: '1px solid #000'}} onClick={() => setOpenModal(false)}>
            <Icon path={mdiClose} size={1} color='#000' />
          </IconButton>

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap'
          }}>
            {participants && Object.entries(participants).map(([id, name], index) =>
              <span key={id} style={{ margin: '0 .5em' }}>
                <Button onClick={() => handleKickParticipant(id)} style={{ backgroundColor: getColor(index) }}>
                  <h3 className={kickConfirm === id ? styles.fadeOut : ''}>{kickConfirm === id ? 'click again to kick' : name}</h3>
                </Button>
              </span>
            )}

          </div>
        </div>
      </div>}
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
            <span key={id} style={{ margin: '0 .5em' }}>
              <Button onClick={() => handleKickParticipant(id)} style={{ backgroundColor: getColor(index) }}>
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