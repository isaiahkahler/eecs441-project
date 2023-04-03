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
import Button from '@/components/ui/button';
import useNoSleep from 'use-no-sleep';

export interface Room {
  owner: string,
  expiration: number,
  participants?: Participants,
  queue?: QueueParticipant
  started?: boolean,
  reactions?: Reaction
}

export interface Participants {
  [participant: string]: string
}

export interface QueueParticipant {
  [participant: string]: number
}

export interface Reaction {
  [timestamp: number]: string
}

export default function ClassClient() {
  const pathname = usePathname() || '/';
  const code = pathname.substr(1).toUpperCase();
  const auth = getAuth(app);
  const database = getDatabase(app);
  useNoSleep(true);

  const [room, setRoom] = useState<Room | null | false>();

  const user = useStore(state => state.user);

  // effect: sign in the user with an anonymous account
  useEffect(() => {
    console.log('signing in')
    signInAnonymously(auth).catch(error => console.error(`Couldn't sign in: ${error}`));
  }, [auth]);

  // effect: get the room with id `code` once and store it in room
  useEffect(() => {
    if (!code) return;
    if (!user) return;

    (async () => {
      try {
        const roomSnapshot = await get(child(ref(database), `rooms/${code}`));
        if (roomSnapshot.exists()) {
          // the room exists, so listen to updates
          setRoom(roomSnapshot.val());
          console.log('subscribed to room');
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
      }
    })();
  }, [code, database, user]);

  // if the room is owned by this user
  if (user && room && user.uid === room.owner) {
    return <OwnerView code={code} room={room} />
  }

  // if the room is not owned by this user
  if (user && room) {
    return <ParticipantView code={code} room={room} participant={user} />
  }


  if (room === false) return (
    <Layout>
      <Container>
        <h1 style={{ textAlign: 'center' }}>uh oh! that room doesn&apos;t exist</h1>
        <Button href='/'><p>← back to home</p></Button>
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