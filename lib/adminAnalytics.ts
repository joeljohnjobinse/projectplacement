import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getAverageScoreByCompany() {
  const q = query(
    collection(db, "mock_attempts"),
    where("status", "==", "completed")
  );

  const snap = await getDocs(q);

  const buckets: Record<
    string,
    { totalScore: number; totalQuestions: number; attempts: number }
  > = {};

  snap.forEach(doc => {
    const d = doc.data();

    if (!buckets[d.company]) {
      buckets[d.company] = {
        totalScore: 0,
        totalQuestions: 0,
        attempts: 0,
      };
    }

    buckets[d.company].totalScore += d.score;
    buckets[d.company].totalQuestions += d.total;
    buckets[d.company].attempts += 1;
  });

  return Object.entries(buckets).map(([company, stats]) => ({
    company,
    avgScorePercent: Math.round(
      (stats.totalScore / stats.totalQuestions) * 100
    ),
    attempts: stats.attempts,
  }));
}
