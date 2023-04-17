import { Participants, Room } from "./page";
import QRCode from 'react-qr-code'
import Button, { getButtonStyling, IconButton } from "@/components/ui/button";
import Layout from "@/components/ui/layout";
import Container from "@/components/ui/container";
import { getDatabase, ref, remove, set } from "firebase/database";
import { app } from "@/components/data/firebase";
import { getLightColor } from "@/components/ui/colors";
import { useEffect, useState } from "react";
import styles from './ownerView.module.css';
import Icon from "@mdi/react";
import { mdiAccountGroup, mdiClose, mdiExitToApp, mdiEyeOff, mdiNotificationClearAll } from "@mdi/js";
import ReactionsDisplay from "./components/reactions";
import SpeakerView from "./components/speaker";
import { useStore } from "@/components/data/store";
import { EnterNameForm, ParticipantControls } from "./participantView";

interface OwnerViewProps {
  code: string,
  displayCode: string,
  room: Room
}

export default function OwnerView(props: OwnerViewProps) {
  const { code, room, displayCode } = props;
  const { participants, queue, reactions } = room;
  const database = getDatabase(app);

  const [confirmDismiss, setConfirmDismiss] = useState(false);
  const [openModal, setOpenModal] = useState(false);


  const [name, setName] = useState<string | null>(null);

  // get or change name from the list of participants, if the user already joined 
  useEffect(() => {
    if (!room.participants) {
      setName(null);
      return;
    };
    if (room.owner in room.participants) {
      setName(room.participants[room.owner]);
    } else {
      setName(null);
    }
  }, [room, room.owner]);

    // function that adds the participant to the room once they have entered a name
    const setHostName = (_name: string) => {
      set(ref(database, `rooms/${code}/participants/${room.owner}`), _name);
    };

  if (room.ended) {
    return <RoomSummary room={room} code={code} />
  }

  // prompt the user to enter a name if they don't have one
  if (!name && room.participateAsHost) {
    return <EnterNameForm setParticipantName={setHostName} room={room} />
  };

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

      // set queueTime (variable tracks how long someone is at the top)
      set(ref(database, `rooms/${code}/queueTime`), Date.now());
      setConfirmDismiss(false);
    }
  }


  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {/* the display of speakers */}
        <div style={{ flexGrow: '1', height: '100vh', display: 'flex', justifyContent: 'center' }}>
          <SpeakerView room={room} code={code} participantId={room.participateAsHost ? room.owner : undefined} />
        </div>
        {/* show the leader board only if points are enabled */}
        {room.pointsEnabled && <div className={styles.pointsMenu}>
          <LeaderBoard room={room} />
        </div>}
      </div>

      {/* join code at the bottom */}
      {!room.participateAsHost && <h2 style={{ position: 'fixed', bottom: 0, textAlign: 'center', width: '100vw', zIndex: 502 }}>Join at SpeakUp.fyi/<strong>{displayCode}</strong></h2>}

      {/* qr code in bottom right */}
      <span className={styles.qrCode}>
        <QRCode value={`https://speakup.fyi/${displayCode}`} style={{ width: 'min(12vw, 12vh)', height: 'min(12vw, 12vh)' }} />
      </span>

      {/* top left corner container with buttons  */}
      <span style={{
        position: 'absolute',
        left: '1em',
        top: '1em',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        zIndex: 550
      }}>
        {/* indicator for number of participants */}
        <IconButton style={{ padding: '0.25em 0.5em' }} onClick={() => setOpenModal(true)}>
          <h2 style={{ display: 'inline', marginRight: '0.25em' }}>{participants ? Object.keys(participants).length : '0'}</h2><Icon path={mdiAccountGroup} size={1.5} />
        </IconButton>

        {/* button to clear all participants */}
        <IconButton onClick={dismissAll}>
          <Icon path={mdiNotificationClearAll} size={1.5} />
          {confirmDismiss && <p style={{ fontWeight: 'bold', paddingRight: '0.5em' }} className={styles.fadeOut}>Click again to dismiss all hands</p>}
        </IconButton>

        {/* end room button */}
        <IconButton onClick={() => {
          const close = confirm('Are you sure you want to end the room?');
          if (close) {
            set(ref(database, `rooms/${code}/ended`), true);
          }
        }}>
          <Icon path={mdiExitToApp} size={1.5} />
        </IconButton>
      </span>

      {/* if the host is participating, show the controls */}
      {room.participateAsHost && <ParticipantControls code={code} participantId={room.owner} room={room} >
      <h2 style={{  bottom: 0, textAlign: 'center', width: '100vw', zIndex: 502, marginTop: 0 }}>Join at SpeakUp.fyi/<strong>{displayCode}</strong></h2>
      </ParticipantControls>}

      {/* floating reactions */}
      {reactions && <ReactionsDisplay reactions={reactions} />}

      {/* modal to kick participants */}
      {openModal && <div className={styles.modalContainer}
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          setOpenModal(false);
        }}
      >
        <div className={styles.modal}>
          <h1>participants</h1>

          {/* close button */}
          <IconButton style={{ position: 'absolute', top: '1.5em', right: '1.5em', backgroundColor: "transparent", border: '1px solid #000' }} onClick={() => setOpenModal(false)}>
            <Icon path={mdiClose} size={1} color='#000' />
          </IconButton>

          <ParticipantList code={code} room={room} />
        </div>
      </div>}
    </>
  );
}


function WaitingRoom(props: OwnerViewProps) {
  const { code, room, displayCode } = props;
  const passcode = useStore(state => state.passcode);
  const hasPasscode = code !== displayCode;
  const [showPasscode, setShowPasscode] = useState(true);

  const database = getDatabase(app);

  // set the property 'started' on the room to 'true'
  const handleStartRoom = () => {
    set(ref(database, `rooms/${code}/started`), true);
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
            <div style={{ width: '70%', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '2rem' }}>
              <h1>Go to speakup.fyi/<strong style={{ fontWeight: 'bolder' }}>{displayCode}</strong></h1>

              {/* show passcode if one is set */}
              {!showPasscode && hasPasscode && <Button onClick={() => setShowPasscode(true)} disabled={showPasscode}>
                <h2>Click to show passcode</h2>
              </Button>}
              {showPasscode && hasPasscode && <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1>Passcode: <strong style={{ fontWeight: 'bolder' }}>{passcode}</strong></h1>
                <button style={{ appearance: 'none', border: 'none', backgroundColor: 'transparent', marginLeft: '1rem' }} onClick={() => setShowPasscode(false)}>
                  <Icon path={mdiEyeOff} size={1.2} />
                </button>
              </div>}

            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <QRCode value={`https://speakup.fyi/${displayCode}`} style={{ width: 'min(15vw, 15vh)', height: 'min(15vw, 15vh)' }} />
              <p style={{ margin: '0.5em' }}>or scan to join</p>
            </div>
          </div>

        </div>

        <hr />

        <h2>participants:</h2>

        <ParticipantList code={code} room={room} />

        <span style={{ position: 'fixed', right: '2em', bottom: '2em' }}>

          <Button onClick={handleStartRoom}><h2>Start →</h2></Button>
        </span>
      </Container>
    </Layout >
  );
}

interface RoomSummaryProps {
  room: Room,
  code: string
}

export function RoomSummary(props: RoomSummaryProps) {
  const { room, code } = props;
  return (
    <Layout>
      <Container>
        <div>
          <h1 style={{ textAlign: 'center' }}>The Room has Ended</h1>

        </div>

        <hr />

        <h2>participants:</h2>
        <ParticipantList room={room} code={code} disableKick />

        {room.points && <LeaderBoard room={room} />}

      </Container>
    </Layout>
  );
}

function ParticipantList(props: { code: string, room: Room, disableKick?: boolean }) {
  const { code, room, disableKick } = { ...props };
  const [kickConfirm, setKickConfirm] = useState<string | null>();
  const database = getDatabase(app);

  const handleKickParticipant = (id: string) => {
    if (!kickConfirm) {
      setKickConfirm(id);
      setTimeout(() => setKickConfirm(null), 4000);
    } else if (kickConfirm === id) {
      // kick player
      remove(ref(database, `rooms/${code}/participants/${id}`));
      if (room.queue && id in room.queue) {
        remove(ref(database, `rooms/${code}/queue/${id}`));
      }
      if (room.points && id in room.points) {
        remove(ref(database, `rooms/${code}/points/${id}`));
      }
      setKickConfirm(null);
    } else {
      // clicked another name
      setKickConfirm(null);
    }

  };

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
      }}>
        {room.participants && Object.entries(room.participants).map(([id, name], index) =>
          <span key={id} style={{ margin: '0 .5em' }}>
            <Button onClick={() => handleKickParticipant(id)} style={{ backgroundColor: convertUidToColor(id) }} disabled={disableKick}>
              <h3 className={kickConfirm === id ? styles.fadeOut : ''} style={{ color: "#000" }}>{kickConfirm === id ? 'click again to kick' : name}</h3>
            </Button>
          </span>
        )}
      </div>
    </>
  );
}

interface LeaderBoardProps {
  room: Room
}

function LeaderBoard(props: LeaderBoardProps) {
  const { room } = props;
  const { participants } = room;
  return (
    <>
      <h1 style={{ textAlign: 'center' }}>Leaderboard</h1>
      {participants && room.points && Object.entries(room.points).sort((a, b) => b[1] - a[1]).map(([key, value]) =>
        <span className={getButtonStyling()} key={key} style={{ backgroundColor: convertUidToColor(key), color: "#000" }}>
          <h2>{participants[key]} - <p style={{ fontWeight: 'normal', display: 'inline' }}>{value} seconds</p></h2>
        </span>)}
    </>
  );
}

export function convertUidToColor(uid: string) {
  let index = 0;
  for (const letter of uid) {
    index += letter.charCodeAt(0);
  }
  return getLightColor(index);
}