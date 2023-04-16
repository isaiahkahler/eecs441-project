"use client";

import { getAuth, signInAnonymously } from 'firebase/auth'
import { app } from '@/components/data/firebase'
import { useEffect, useState } from 'react'
import Layout from '@/components/ui/layout';
import Container from '@/components/ui/container';
import Nav from '@/components/ui/nav';
import Button, { LinkButton } from '@/components/ui/button';
import Input, { InputCheckbox } from '@/components/ui/input';
import { useRouter } from 'next/navigation'
import Icon from '@mdi/react';
import { mdiLoading } from '@mdi/js';
import { useStore } from '@/components/data/store';

import EmojiMenu from '@/components/ui/emoji';
import EmojiPicker from 'emoji-picker-react';


function makePasscode(length: number) {
  var result = '';
  var characters = 'abcdefghijklmnopqrstuvwxyz-_!@#$%^*';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export default function CreateRoom() {

  const auth = getAuth(app);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [requirePasscode, setRequirePasscode] = useState(false);
  const [points, setPoints] = useState(false);
  const [disableReactions, setDisableReactions] = useState(false);
  const [customReactions, setCustomReactions] = useState(false);

  const [passcodeValue, setPasscodeValue] = useState(makePasscode(6));

  const setPasscode = useStore(state => state.setPasscode);

  const [emojiList, setEmojiList] = useState<string[]>(['👏', '🔥', '🤔', '😲', '🤣']);
  const [pickingEmoji, setPickingEmoji] = useState<string | null>(null)


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

      // get params for the request
      const options: any = {
        passcode: requirePasscode && passcodeValue,
        disableReactions: disableReactions,
        customReactions: !disableReactions && customReactions && emojiList
      };
      const badKeys = Object.keys(options).filter((key) => !options[key]);
      for (const key of badKeys) {
        delete options[key];
      }
      const urlParameters = new URLSearchParams(options).toString();

      const token = await auth.currentUser.getIdToken();
      const data = await fetch(`/api/create-room${urlParameters ? '?' + urlParameters : ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const jsonData = await data.json();

      // if there is a passcode, save it in global state
      if (requirePasscode) setPasscode(passcodeValue);

      // navigate to the room
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
          <InputCheckbox label='Require passcode to join' checked={requirePasscode} onChange={e => setRequirePasscode(e.currentTarget.checked)} />
          {requirePasscode && <div>
            <h3 style={{ display: 'inline', marginRight: '1rem' }}>passcode:</h3>
            <Input value={passcodeValue} onChange={e => setPasscodeValue(e.currentTarget.value)} />
          </div>}
          <InputCheckbox label='Earn points' checked={points} onChange={e => setPoints(e.currentTarget.checked)} />
          <InputCheckbox label='Disable reactions' checked={disableReactions} onChange={e => setDisableReactions(e.currentTarget.checked)} />
          {!disableReactions && <div style={{ marginLeft: '2rem' }}>
            <InputCheckbox label='Custom reactions' checked={customReactions} onChange={e => setCustomReactions(e.currentTarget.checked)} />
            {customReactions && <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <EmojiMenu emojis={emojiList} onEmojiClick={(emoji) => setPickingEmoji(emoji)} />
              {pickingEmoji && <EmojiPicker onEmojiClick={(emoji) => {
                const newList = emojiList.map(_emoji => _emoji === pickingEmoji ? emoji.emoji : _emoji);
                setPickingEmoji(null);
                setEmojiList(newList);
              }} skinTonesDisabled previewConfig={{showPreview: false}} />}
            </div>}
          </div>}
          {/* <InputCheckbox label='Enable responding ' /> */}
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