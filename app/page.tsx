"use client";
import { useState } from 'react'
import { LinkButton, TransparentButton } from '../components/ui/button'
import Input from '../components/ui/input'
import styles from './landing.module.css'
import Link from 'next/link';

export default function Home() {

  const [code, setCode] = useState('');

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
          placeholder='Room Code'
          maxLength={6}
          value={code}
          onChange={(e) => setCode((e.target as HTMLInputElement).value.replace(/[^a-z]/i, '').toUpperCase())}
        />
        <LinkButton href={`/${code}`}>Join →</LinkButton>
      </div>
      <p>OR</p>
      <TransparentButton>
        <Link href='/create-room'>Create a Room</Link>
      </TransparentButton>
    </div>
  )
}
