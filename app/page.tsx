"use client";
import { useState } from 'react'
import Button, { IconButton, LinkButton, SpanButton } from '../components/ui/button'
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
      <h1 style={{ fontSize: 'min(20vw, 10vh)' }} className={styles.logoText}>SpeakUp!</h1>
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
        <LinkButton href={`/${code}`}>Join →</LinkButton>
      </div>
      <p>OR</p>
      <SpanButton style={{ backgroundColor: 'transparent', color: '#000', border: '1px solid #eaeaea' }}>
        <Link style={{ color: '#232323' }} href='/create-room'>Create a Room</Link>
      </SpanButton>

    </div>
  )
}
