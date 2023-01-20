"use client";
import { useState } from 'react'
import Button, { IconButton } from '../components/ui/button'
import Input from '../components/ui/input'
import { getAuth, signInAnonymously } from 'firebase/auth'
import {app} from '../components/data/firebase'
import {useRouter} from 'next/navigation'

import Icon from '@mdi/react'
import { mdiArrowRightCircle } from '@mdi/js'

export default function Home() {

  const [code, setCode] = useState('');
  const auth = getAuth(app);
  signInAnonymously(auth);

  const router = useRouter();


  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '90vh'
    }}>
      <h1>SpeakEasy</h1>
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
          onChange={(e) => setCode(e.target.value.replace(/[^a-z]/i, ''))}
        />
        <IconButton href={`/${code}`}>
          <Icon path={mdiArrowRightCircle} size={1} />
        </IconButton>
      </div>
      <p>OR</p>
      <Button onClick={() => {
        (async () => {
          const data = await fetch('/api/create-room');
          const jsonData = await data.json();
          jsonData.code && router.push(`/${jsonData.code}`);
        })();
      }}><p>Create a Room</p></Button>
    </div>
  )
}
