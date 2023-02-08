"use client";
import { useStore } from '@/components/data/store'
import { child, get, getDatabase, onValue, ref, set, Unsubscribe } from 'firebase/database'
import { usePathname } from 'next/navigation'
import { app } from '@/components/data/firebase'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { useEffect, useState } from 'react'
import OwnerView from './ownerView';
import ParticipantView from './participantView';

export interface Room {
  owner: string,
  expiration: number,
  participants?: Participants,
  queue?: QueueParticipant

}

interface Participants {
  [participant: string]: string
}

interface QueueParticipant {
  [participant: string]: number
}

export default function ClassClient() {
  const pathname = usePathname() || '/';
  const code = pathname.substr(1).toUpperCase();
  const auth = getAuth(app);
  const database = getDatabase(app);

  const [room, setRoom] = useState<Room | null | false>();

  const user = useStore(state => state.user);

  const [subscription, setSubscription] = useState<Unsubscribe | null>(null);


  // effect: sign in the user with an anonymous account
  useEffect(() => {
    console.log('signing in')
    signInAnonymously(auth).catch(error => console.error(`Couldn't sign in: ${error}`));
  }, [auth]);

  // effect: get the room with id `code` once and store it in room
  useEffect(() => {
    if (!code) return;

    (async () => {
      try {
        const roomSnapshot = await get(child(ref(database), `rooms/${code}`));
        if (roomSnapshot.exists()) {
          // the room exists, so listen to updates
          setRoom(roomSnapshot.val());
          console.log('subscribed to room');
          let _subscription = onValue(ref(database, `rooms/${code}`), (snapshot) => {
            console.log('update room', snapshot.val());
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
  }, [code, database]);

  // if the room is owned by this user
  if (user && room && user.uid === room.owner) {
    return <OwnerView code={code} room={room} />
  }

  // if the room is not owned by this user
  if (user && room) {
    return <ParticipantView code={code} room={room} participant={user} />
  }


  if(room === false) return (
    <>
      <h1>uh oh! that room doesn't exist</h1>
    </>
  );

  // the room does not exist 
  return (
    <>
      class client!
      <p>the code is {code}</p>
      <p>the room is {room && JSON.stringify(room)}</p>
      {/* <p>the user is {user && JSON.stringify(user)}</p> */}

    </>
  );
}