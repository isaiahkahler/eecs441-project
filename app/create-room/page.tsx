"use client";

import { getAuth, signInAnonymously } from 'firebase/auth'
import { app } from '@/components/data/firebase'
import { useEffect, useState } from 'react'
import Layout from '@/components/ui/layout';
import Container from '@/components/ui/container';
import Nav from '@/components/ui/nav';
import Button, { LinkButton } from '@/components/ui/button';
import { InputCheckbox } from '@/components/ui/input';
import { useRouter } from 'next/navigation'
import Icon from '@mdi/react';
import { mdiLoading } from '@mdi/js';

export default function CreateRoom() {

  const auth = getAuth(app);
  const router = useRouter();
  const [loading, setLoading] = useState(false);


  // effect: get the user, sign in the user with an anonymous account if not signed in
  useEffect(() => {
    if (auth.currentUser) return;
    console.log('signing in')
    signInAnonymously(auth).catch(error => console.error(`Couldn't sign in: ${error}`));
  }, [auth]);

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      if (!auth.currentUser) {
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
    } catch {
      //TODO: show the error to the user
      setLoading(false);
    }
  }


  return (
    <>
      <Nav />
      <Layout>
        <Container>

          <h1>Create Your Room</h1>
          <hr />
          <InputCheckbox label='Require passcode to join' />
          <InputCheckbox label='Record list of participants' />
          <InputCheckbox label='Earn points' />
          <InputCheckbox label='Disable reactions' />
          <InputCheckbox label='Custom reactions' />
          <InputCheckbox label='Enable responding ' />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1rem 0' }}>
            <Button disabled={loading} onClick={handleCreateRoom}><p>Start →</p></Button>
            {loading && <div style={{ position: 'absolute' }}>
              <Icon path={mdiLoading} size={1} color="#232323" spin />
            </div>}
          </div>

        </Container>
      </Layout>
    </>
  );
}