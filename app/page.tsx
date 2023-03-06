"use client";
import { useState } from 'react'
import Button, { IconButton, LinkButton } from '../components/ui/button'
import Input from '../components/ui/input'

import Icon from '@mdi/react'
import { mdiArrowRightCircle } from '@mdi/js'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { app } from '@/components/data/firebase'
import styles from './landing.module.css'
import Link from 'next/link';

export default function Home() {

  const [code, setCode] = useState('');

  const auth = getAuth(app);


  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '90vh'
    }}>
      <h1 style={{fontSize: 'min(20vw, 10vh)'}} className={styles.logoText}>SpeakUp!</h1>
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
          onChange={(e) => setCode((e.target as HTMLInputElement).value.replace(/[^a-z]/i, '').toUpperCase())}
        />
        <IconButton href={`/${code}`}>
          <Icon path={mdiArrowRightCircle} size={1} color='inherit' />
        </IconButton>
      </div>
      <p>OR</p>
      {/* <Button onClick={handleCreateRoom}><p>Create a Room</p></Button> */}
      <LinkButton href='/create-room'><p>Create a Room</p></LinkButton>
    </div>
  )
}
