import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getGlobalLeaderboard() {
  const snap = await getDocs(
    collection(db, "mock_attempts")
  );

  const map: Record<
    string,
    { score: number; total: number; attempts: number }
  > = {};

  snap.forEach(d => {
    const a = d.data();
    if (!a.userId) return;

    map[a.userId] ??= {
      score: 0,
      total: 0,
      attempts: 0,
    };

    map[a.userId].score += a.score;
    map[a.userId].total += a.total;
    map[a.userId].attempts += 1;
  });

  return Object.entries(map)
    .map(([userId, v]) => ({
      userId,
      avg: Math.round((v.score / v.total) * 100),
      attempts: v.attempts,
    }))
    .sort((a, b) => b.avg - a.avg);
}
