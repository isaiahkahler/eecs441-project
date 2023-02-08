// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { ref, get, set } from 'firebase/database'
// import { app } from '../../components/data/firebase'


// var admin = require("firebase-admin");
import { initializeApp, cert, getApp, App } from 'firebase-admin/app'
import { DecodedIdToken, getAuth } from 'firebase-admin/auth'
import { getDatabase } from 'firebase-admin/database'
import * as serviceAccount from "../../class-connect-f7b87-firebase-adminsdk-e6e6u-7b597ba335.json";


type Data = {
  code: string
}

function makeid(length: number) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

let app: App | null = null;
try {
  app = initializeApp({
    credential: cert(serviceAccount as any),
    databaseURL: "https://class-connect-f7b87-default-rtdb.firebaseio.com"
  });
} catch (error) {
  app = getApp();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  if(!app) {
    res.status(500);
    return;
  }
  const auth = getAuth(app);

  const authorizationHeader = req.headers['authorization'];

  if (!authorizationHeader) {
    res.status(401).send('No Authorization header' as any);
    return;
  }

  let userToken: DecodedIdToken | null = null;
  try {
    const token = authorizationHeader.split(' ')[1];
    userToken = await auth.verifyIdToken(token, true);
  } catch (error) {
    res.status(401).send('Authorization failed' as any);
    return;
  }

  const db = getDatabase(app);
  let roomExists = true;
  let randomCode = '';
  while (roomExists) {
    randomCode = makeid(6);
    console.log('random code:', randomCode)
    const roomRef = ref(db as any, `rooms/${randomCode}`);
    const roomData = await get(roomRef);
    if (!roomData.exists()) {
      roomExists = false;
      console.log('room doesnt exist!')

      await set(ref(db as any, `rooms/${randomCode}`), {
        owner: userToken.uid,
        expiration: Date.now() + (1000 * 60 * 60 * 24 * 2)
      });
      console.log('made room!')

    }
  }



  res.status(200).json({ code: randomCode })
}
