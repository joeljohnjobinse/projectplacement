import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getCompanyLeaderboard(
  company?: string
) {
  if (!company) return []; // 🔥 critical guard

  const q = query(
    collection(db, "mock_attempts"),
    where("company", "==", company)
  );

  const snap = await getDocs(q);

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
