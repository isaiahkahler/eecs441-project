"use client";
import { useStore } from '@/components/data/store'
import { child, get, getDatabase, ref } from 'firebase/database'
import { usePathname } from 'next/navigation'
import { app } from '@/components/data/firebase'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { useEffect, useState } from 'react'

interface Room {
  manager: string,
  
}

export default function ClassClient() {
  const pathname = usePathname() || '/';
  const code = pathname.substr(1);
  const auth = getAuth(app);

  const [room, setRoom] = useState<Room | null | false>();

  const database = getDatabase(app);
  const dbRef = ref(database);

  const user = useStore(state => state.user);

  useEffect(() => {
    console.log('signing in')
    signInAnonymously(auth).catch(error => console.error(`Couldn't sign in: ${error}`));
  }, []);

  useEffect(() => {
    (async () => {
      console.log('getting room')
      try {
        // get the room with id `code` once
        const roomSnapshot = await get(child(dbRef, code));
        if (roomSnapshot.exists()) {
          setRoom(roomSnapshot.val());
        }

      } catch (error) {
        console.error(`Couldn't get room with id ${code}: ${error}`)
      }
    })();
  }, []);

  // if the room is owned by this user

  if (user && room && user.uid === room.manager) {

  }

  // if the room is not owned by this user


  // the room does not exist 

  return (
    <>
      class client!
      <p>the code is {code}</p>
      <p>the room is {room && JSON.stringify(room)}</p>
      <p>the user is {user && JSON.stringify(user)}</p>
      
    </>
  );
}