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

export default function CreateRoom() {

  const auth = getAuth(app);

  // effect: get the user, sign in the user with an anonymous account if not signed in
  useEffect(() => {
    if (auth.currentUser) return;
    console.log('signing in')
    signInAnonymously(auth).catch(error => console.error(`Couldn't sign in: ${error}`));
  }, [auth]);



  return (
    <>
    <Nav />
      <Layout>
        <Container>

        <h1>Create Your Room</h1>
        <hr />
        <InputCheckbox label='Record list of participants' />
        <InputCheckbox label='Earn points' />
      <Button><p>Start →</p></Button>
        </Container>
      </Layout>
    </>
  );
}