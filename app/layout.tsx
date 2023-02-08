"use client";

import './globals.css'
import { app } from '@/components/data/firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useStore } from '@/components/data/store'
import { useEffect } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const auth = getAuth(app);
  const setUser = useStore(state => state.setUser);

  useEffect(() => {
    let unsubscribe = onAuthStateChanged(auth, (user) => {
      // update the state 
      setUser(user);
      console.log('auth state changed', user)
    }, (error) => {
      console.error(`Couldn't set user from onAuthStateChanged: ${error}`)
      setUser(null);
    });

    return () => unsubscribe();
  }, [auth, setUser]);

  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>{children}</body>
    </html>
  )
}
