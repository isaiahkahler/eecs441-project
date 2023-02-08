
import { initializeApp, cert } from 'firebase-admin/app'
import * as serviceAccount from "../../class-connect-f7b87-firebase-adminsdk-e6e6u-7b597ba335.json";

export const app = initializeApp({
  credential: cert(serviceAccount as any),
  databaseURL: "https://class-connect-f7b87-default-rtdb.firebaseio.com"
});
