import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function touchStreak(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const data = snap.data();

  const last = data?.lastActive;
  const now = today();

  if (last === now) return;

  let newStreak = 1;

  if (last === yesterday()) {
    newStreak = (data?.streak || 0) + 1;
  }

  await updateDoc(ref, {
    lastActive: now,
    streak: newStreak,
  });
}
