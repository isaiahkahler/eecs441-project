"use client";
import { useState } from 'react'
import Button, { IconButton } from '../components/ui/button'
import Input from '../components/ui/input'
import {useRouter} from 'next/navigation'

import Icon from '@mdi/react'
import { mdiArrowRightCircle } from '@mdi/js'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { app } from '@/components/data/firebase'

export default function Home() {

  const [code, setCode] = useState('');

  const router = useRouter();
  const auth = getAuth(app);

  const handleCreateRoom = async () => {
    await signInAnonymously(auth);
    if(!auth.currentUser) {
      console.error('couldn\'t sign in')
      return;
    }
    const token = await auth.currentUser.getIdToken();
    const data = await fetch('/api/create-room', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const jsonData = await data.json();
    jsonData.code && router.push(`/${jsonData.code}`);
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '90vh'
    }}>
      <h1>SpeakUp!</h1>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Input
          placeholder='Class Code'
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^a-z]/i, '').toUpperCase())}
        />
        <IconButton href={`/${code}`}>
          <Icon path={mdiArrowRightCircle} size={1} />
        </IconButton>
      </div>
      <p>OR</p>
      <Button onClick={handleCreateRoom}><p>Create a Room</p></Button>
    </div>
  )
}
