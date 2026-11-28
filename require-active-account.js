import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCzok_zQsToh-OzGUBCK4Omx8IELOU9CC4",
  authDomain: "sovva-e2c64.firebaseapp.com",
  databaseURL: "https://sovva-e2c64-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sovva-e2c64",
  storageBucket: "sovva-e2c64.firebasestorage.app",
  messagingSenderId: "71366651741",
  appId: "1:71366651741:web:7d26107a41f0291f1f82b4"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

function isAccountPermanentlyBanned(profile) {
  return Boolean(profile?.isBanned || profile?.sanction?.type === "account_ban");
}

export function requireActiveAccount(onReady) {
  let unsubProfile = null;
  let initializedForUid = null;

  onAuthStateChanged(auth, async (user) => {
    if (unsubProfile) {
      unsubProfile();
      unsubProfile = null;
    }

    if (!user) {
      window.location.replace("./index.html");
      return;
    }

    const snap = await get(ref(db, `users/${user.uid}`));
    const initialProfile = snap.exists() ? snap.val() : null;

    if (isAccountPermanentlyBanned(initialProfile)) {
      window.location.replace("./ban-screen.html");
      return;
    }

    if (typeof onReady === "function" && initializedForUid !== user.uid) {
      initializedForUid = user.uid;
      onReady(user, initialProfile);
    }

    unsubProfile = onValue(ref(db, `users/${user.uid}`), (liveSnap) => {
      const liveProfile = liveSnap.exists() ? liveSnap.val() : null;
      if (isAccountPermanentlyBanned(liveProfile)) {
        window.location.replace("./ban-screen.html");
      }
    });
  });
}
