"use client";
import { useStore } from '@/components/data/store'
import { child, get, getDatabase, onValue, ref, set, Unsubscribe } from 'firebase/database'
import { usePathname } from 'next/navigation'
import { app } from '@/components/data/firebase'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { useEffect, useState } from 'react'
import OwnerView from './ownerView';
import ParticipantView from './participantView';
import Layout from '@/components/ui/layout';
import Container from '@/components/ui/container';
import Button, { LinkButton } from '@/components/ui/button';
import useNoSleep from 'use-no-sleep';
import CryptoJS from 'crypto-js';
import Input, { InputInvalidMessage } from '@/components/ui/input';

export interface Room {
  owner: string,
  expiration: number,
  participants?: Participants,
  queue?: QueueParticipant
  started?: boolean,
  reactions?: Reaction,
  ended?: true,
  hasPasscode?: true,
  disableReactions?: true,
  customReactions?: string,
  pointsEnabled?: true,
  points?: ParticipantPoints,
  queueTime?: number,
  participateAsHost?: boolean
}

export interface Participants {
  [participant: string]: string
}

export interface QueueParticipant {
  [participant: string]: number
}

export interface ParticipantPoints {
  [participant: string]: number
}

export interface Reaction {
  [timestamp: number]: string
}

export default function ClassClient() {
  const pathname = usePathname() || '/';
  const displayCode = pathname.substr(1).toUpperCase();
  const auth = getAuth(app);
  const database = getDatabase(app);
  // useNoSleep(true);

  const [room, setRoom] = useState<Room | null | false>();

  const user = useStore(state => state.user);
  const passcode = useStore(state => state.passcode);
  const setPasscode = useStore(state => state.setPasscode);

  const code = passcode ? CryptoJS.MD5(displayCode + passcode).toString() : displayCode;

  // effect: sign in the user with an anonymous account
  useEffect(() => {
    // console.log('signing in')
    signInAnonymously(auth).catch(error => console.error(`Couldn't sign in: ${error}`));
  }, [auth]);

  useEffect(() => {
    if(passcode && room === false) {
      setPasscode(null);
    }
  }, [passcode, room, setPasscode]);

  // effect: get the room with id `code` once and store it in room
  useEffect(() => {
    if (!code) return;
    if (!user) return;

    (async () => {
      try {
        console.log(`trying room ${code}`);

        const roomSnapshot = await get(child(ref(database), `rooms/${code}`));
        if (roomSnapshot.exists()) {
          // the room exists, so listen to updates
          setRoom(roomSnapshot.val());
          console.log(`subscribed to room ${code}`);
          let _subscription = onValue(ref(database, `rooms/${code}`), (snapshot) => {
            // console.log('update room', snapshot.val());
            setRoom(snapshot.val());
          });

          // unsubscribe when the component unfocuses
          return () => {
            _subscription();
            console.log('unsubscribed from room');
          }

        } else {
          // no room was found
          setRoom(false);
        }

      } catch (error) {
        console.error(`Couldn't get room with id ${code}: ${error}`)
        // TODO create a separate error message for this 
        setRoom(false);
      }
    })();
  }, [code, database, user]);

  // if the room is owned by this user
  if (user && room && user.uid === room.owner) {
    return <OwnerView code={code} displayCode={displayCode} room={room} />
  }

  // if the room is not owned by this user
  if (user && room) {
    // if the room has a passcode, it really just points to a different room
    if (room.hasPasscode) {
      return <EnterPasscodeView code={displayCode} setPasscode={setPasscode} />
    }

    return <ParticipantView code={code} room={room} participant={user} />
  }


  if (room === false) return (
    <Layout>
      <Container>
        <h1 style={{ textAlign: 'center' }}>uh oh! that room doesn&apos;t exist</h1>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LinkButton href='/'>← back to home</LinkButton>
        </div>
      </Container>
    </Layout>
  );

  // the room does not exist 
  return (
    <>
      loading...
    </>
  );
}

interface EnterPasscodeViewProps {
  code: string,
  setPasscode: (code: string) => void
}

function EnterPasscodeView(props: EnterPasscodeViewProps) {
  const { code, setPasscode } = props;
  const [userInput, setUserInput] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);
  const database = getDatabase(app);

  return (
    <Layout>
      <Container>
        <h1>enter the passcode</h1>
        <Input
          type='password'
          value={userInput}
          onChange={(e) => setUserInput((e.target as HTMLInputElement).value)}
          style={{ width: '100%' }}
          isValid={!isInvalid}
        />
        <InputInvalidMessage isValid={!isInvalid} >Incorrect passcode.</InputInvalidMessage>
        <Button onClick={() => {
          const hash = CryptoJS.MD5(code + userInput).toString();
          get(child(ref(database), `rooms/${hash}`)).then(roomSnapshot => {
            if (roomSnapshot.exists()) {
              setPasscode(userInput);
            } else {
              setIsInvalid(true);
            }
          });
        }}><p>join room</p></Button>
      </Container>
    </Layout>
  );
}