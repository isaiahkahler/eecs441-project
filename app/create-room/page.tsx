"use client";

import { getAuth, signInAnonymously } from 'firebase/auth'
import { app } from '@/components/data/firebase'
import { useEffect } from 'react'
import Layout from '@/components/ui/layout';
import Container from '@/components/ui/container';
import Nav from '@/components/ui/nav';
import Button, { LinkButton } from '@/components/ui/button';
import Link from 'next/link';
import { InputCheckbox } from '@/components/ui/input';
import {useRouter} from 'next/navigation'

export default function CreateRoom() {

  const auth = getAuth(app);
  const router = useRouter();


  // effect: get the user, sign in the user with an anonymous account if not signed in
  useEffect(() => {
    if (auth.currentUser) return;
    console.log('signing in')
    signInAnonymously(auth).catch(error => console.error(`Couldn't sign in: ${error}`));
  }, [auth]);




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
    <>
    <Nav />
      <Layout>
        <Container>

        <h1>Create Your Room</h1>
        <hr />
        <InputCheckbox label='Record list of participants' />
        <InputCheckbox label='Earn points' />
      <Button onClick={handleCreateRoom}><p>Start →</p></Button>
        </Container>
      </Layout>
    </>
  );
}