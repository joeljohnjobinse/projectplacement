"use client";

import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { touchStreak } from "@/lib/streak";
import { completeToday } from "@/lib/campaign";

type Payload = {
  type: "aptitude" | "technical" | "hr";
  total: number;
  answers: (string | null)[];
  correct: string[];
};

export default function MockResult() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<Payload | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("mock_result");
    if (!raw) {
      router.push("/mock");
      return;
    }
    setData(JSON.parse(raw));
  }, []);

  const stats = useMemo(() => {
    if (!data) return null;
    let right = 0;
    data.correct.forEach((ans, i) => {
      if (data.answers[i] === ans) right++;
    });
    const wrong = data.total - right;
    const accuracy = Math.round((right / data.total) * 100);
    const xpGained = right * 15;
    return { right, wrong, accuracy, xpGained };
  }, [data]);

  useEffect(() => {
    async function award() {
      if (!user || !stats || !data) return;

      await updateDoc(doc(db, "users", user.uid), {
        xp: increment(stats.xpGained),
        [`stats.${data.type}`]: increment(stats.right * 3),
      });

      await touchStreak(user.uid);

      const completed = await completeToday(user.uid);
      if (completed) {
        await updateDoc(doc(db, "users", user.uid), {
          xp: increment(50),
        });
      }

      sessionStorage.removeItem("mock_result");
    }
    award();
  }, [stats, user, data]);

  if (!data || !stats) {
    return (
      <Protected>
        <AppShell>
          <div className="p-12 text-[var(--text-muted)]">Loading results…</div>
        </AppShell>
      </Protected>
    );
  }

  return (
    <Protected>
      <AppShell>
        <div className="max-w-7xl mx-auto p-12 space-y-10">
          <h1 className="text-3xl font-bold">Round Complete</h1>

          <div className="grid grid-cols-3 gap-6">
            <Stat title="Correct" value={stats.right} />
            <Stat title="Wrong" value={stats.wrong} />
            <Stat title="Accuracy" value={`${stats.accuracy}%`} />
          </div>

          <div className="rounded-2xl p-8 bg-[var(--bg-card)] border border-[var(--border-soft)] space-y-3">
            <p className="text-4xl font-bold font-mono xp-pop">
              +{stats.xpGained} XP
            </p>
            <p className="text-[var(--text-muted)]">
              Your campaign has progressed.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push("/mock")}
              className="px-6 py-3 rounded-xl border border-[var(--border-soft)]"
            >
              Try Another Round
            </button>
            <button
              onClick={() => router.push("/arena")}
              className="bg-[var(--accent)] text-black font-semibold px-6 py-3 rounded-xl"
            >
              Return to Arena
            </button>
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}

function Stat({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-2xl p-6 bg-[var(--bg-card)] border border-[var(--border-soft)]">
      <p className="text-sm text-[var(--text-muted)]">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
