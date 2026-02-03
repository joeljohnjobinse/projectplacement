import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type CreateAttemptInput = {
  quizId: string;
  quizTitle: string;
  company: string;
  role: string;
  userId: string;
  answers: Record<number, number>;
  score: number;
  total: number;
  durationSec: number;
};

export async function createMockAttempt(
  input: CreateAttemptInput
) {
  const ref = await addDoc(
    collection(db, "mock_attempts"),
    {
      ...input,
      submittedAt: serverTimestamp(),

      // derived fields (important for analytics / leaderboard)
      accuracy: input.score / input.total,
    }
  );

  return ref; // MUST return this
}
