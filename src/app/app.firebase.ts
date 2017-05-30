import {AngularFireModule} from "angularfire2";

export const firebaseConfig = {
  apiKey: "AIzaSyDAUp0tRd48ur-IRD4Bw4AJQ7OoslW355I",
  authDomain: "chiefsretro-163916.firebaseapp.com",
  databaseURL: "https://chiefsretro-163916.firebaseio.com",
  projectId: "chiefsretro-163916",
  storageBucket: "chiefsretro-163916.appspot.com",
  messagingSenderId: "917853947579"
};

export const firebaseApp = AngularFireModule.initializeApp(firebaseConfig, 'firebaseApp');


export const firebaseAdminConfig = {
  apiKey: "AIzaSyA-c_6Jzz7jRjQ_wKjBRamI9kjpn6y3fhc",
  authDomain: "chiefsretro-admin.firebaseapp.com",
  databaseURL: "https://chiefsretro-admin.firebaseio.com",
  projectId: "chiefsretro-admin",
  storageBucket: "chiefsretro-admin.appspot.com",
  messagingSenderId: "240310378143"
};

export const firebaseAdminApp = AngularFireModule.initializeApp(firebaseAdminConfig, 'firebaseAdminApp');

