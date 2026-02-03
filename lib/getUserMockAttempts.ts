import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getUserMockAttempts(userId: string) {
  const q = query(
    collection(db, "mock_attempts"),
    where("userId", "==", userId),
    orderBy("submittedAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
  }));
}
