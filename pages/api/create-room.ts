// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { ref, get, set } from 'firebase/database'
// import { app } from '../../components/data/firebase'


// var admin = require("firebase-admin");
import { initializeApp, cert, getApp, App } from 'firebase-admin/app'
import { DecodedIdToken, getAuth } from 'firebase-admin/auth'
import { getDatabase } from 'firebase-admin/database'

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
    credential: cert({
      type: "service_account",
      project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY
        ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/gm, "\n")
        : undefined,
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL
    } as any),
    databaseURL: "https://class-connect-f7b87-default-rtdb.firebaseio.com"
  });
} catch (error) {
  console.error(error);
  app = getApp();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  if (!app) {
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
