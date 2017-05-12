import {AngularFireModule} from "angularfire2";

export const firebaseConfig = {
  apiKey: "AIzaSyDAUp0tRd48ur-IRD4Bw4AJQ7OoslW355I",
  authDomain: "chiefsretro-163916.firebaseapp.com",
  databaseURL: "https://chiefsretro-163916.firebaseio.com",
  projectId: "chiefsretro-163916",
  storageBucket: "chiefsretro-163916.appspot.com",
  messagingSenderId: "917853947579"
};

export const firebase = AngularFireModule.initializeApp(firebaseConfig);
