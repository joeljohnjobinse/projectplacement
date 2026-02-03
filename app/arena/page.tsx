"use client";

import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ensureCampaign, getTodayIndex } from "@/lib/campaign";

type Campaign = {
  weekStart: string;
  days: Record<number, { done: boolean }>;
};

type UserData = {
  xp: number;
  streak: number;
  campaign?: Campaign;
};

const LABELS = [
  "Aptitude",
  "Technical",
  "HR",
  "Aptitude",
  "Technical",
  "HR",
  "Review",
];

export default function Arena() {
  const { user } = useAuth();
  const [data, setData] = useState<UserData | null>(null);

  useEffect(() => {
    if (!user) return;
    ensureCampaign(user.uid);

    return onSnapshot(doc(db, "users", user.uid), snap => {
      setData(snap.data() as UserData);
    });
  }, [user]);

  if (!data || !data.campaign) {
    return (
      <Protected>
        <AppShell>
          <div className="p-16 text-[var(--text-muted)]">Loading Arena…</div>
        </AppShell>
      </Protected>
    );
  }

  const level = Math.floor(data.xp / 100) + 1;
  const today = getTodayIndex();

  return (
    <Protected>
      <AppShell>
        <div className="max-w-7xl mx-auto p-16 space-y-16">
          {/* HEADER */}
          <div>
            <h1>Arena</h1>
            <p className="text-[var(--text-muted)] text-lg">
              This is today’s battlefield.
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-8">
            <Stat title="LEVEL" value={`LV ${level}`} />
            <Stat title="XP" value={data.xp} />
            <Stat title="STREAK" value={`${data.streak} DAYS`} />
          </div>

          {/* CAMPAIGN */}
          <div className="card card-hover bg-[var(--bg-card)]/85 backdrop-blur border border-[var(--border-soft)] space-y-8">
            <div>
              <h2>Weekly Campaign</h2>
              <p className="text-[var(--text-muted)]">
                One clear objective per day.
              </p>
            </div>

            <div className="grid gap-4">
              {LABELS.map((label, i) => {
                const day = i + 1;
                const done = data.campaign!.days[day]?.done;
                const isToday = day === today;

                return (
                  <div
                    key={day}
                    className={`flex items-center justify-between px-6 py-4 rounded-xl border text-lg
                      ${
                        isToday
                          ? "border-[var(--accent)] bg-[var(--bg-panel)]"
                          : "border-[var(--border-soft)]"
                      }`}
                  >
                    <span className={done ? "line-through opacity-50" : ""}>
                      Day {day} — {label}
                    </span>
                    <span className={`font-mono ${
    done ? "tick-animate text-green-500" : ""
  }`}>
                      {done ? "✓ DONE" : isToday ? "TODAY" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="card card-hover bg-[var(--bg-card)]/85 backdrop-blur border border-[var(--border-soft)]">
      <p className="text-sm text-[var(--text-muted)] tracking-widest">{title}</p>
      <p className="text-4xl font-bold font-mono mt-2">{value}</p>
    </div>
  );
}
