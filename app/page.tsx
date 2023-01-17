"use client";
import { useState } from 'react'
import { LinkButton, IconButton } from '../components/ui/button'
import Input from '../components/ui/input'
import { getAuth, signInAnonymously } from 'firebase/auth'
import {app} from '../components/data/firebase'

import Icon from '@mdi/react'
import { mdiArrowRightCircle } from '@mdi/js'

export default function Home() {

  const [code, setCode] = useState('');
  const auth = getAuth(app);
  signInAnonymously(auth);


  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '90vh'
    }}>
      <h1>Class Connect</h1>
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
      <LinkButton href='/create'><p>Create a Room</p></LinkButton>
    </div>
  )
}
