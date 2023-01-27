// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { ref, get, getDatabase } from 'firebase/database'
import { app } from '../../components/data/firebase'

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const db = getDatabase(app);
  let roomExists = true;
  let randomCode = '';
  while (roomExists) {
    randomCode = makeid(6);
    console.log('random code:', randomCode)
    const roomRef = ref(db, `rooms/${randomCode}`);
    const roomData = await get(roomRef);
    if (!roomData.exists()) {
      roomExists = false;
      console.log('room doesnt exist!')
    }
  }



  res.status(200).json({ code: randomCode })
}
