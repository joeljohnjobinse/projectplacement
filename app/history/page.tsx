"use client";

import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getTodayIndex } from "@/lib/campaign";

type Campaign = {
  weekStart: string;
  days: Record<number, { done: boolean }>;
};

type UserData = {
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

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function History() {
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), snap => {
      const data = snap.data() as UserData;
      if (data?.campaign) setCampaign(data.campaign);
    });

    return () => unsub();
  }, [user]);

  if (!campaign) {
    return (
      <Protected>
        <AppShell>
          <div className="p-12 text-[var(--text-muted)]">
            Loading history…
          </div>
        </AppShell>
      </Protected>
    );
  }

  const today = getTodayIndex();

  return (
    <Protected>
      <AppShell>
        <div className="max-w-7xl mx-auto p-12 space-y-10">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Training Log</h1>
            <p className="text-[var(--text-muted)]">
              This is how you’ve been showing up.
            </p>
          </div>

          <div className="rounded-2xl p-6 bg-[var(--bg-card)] border border-[var(--border-soft)] space-y-3">
            {LABELS.map((label, i) => {
              const day = i + 1;
              const entry = campaign.days[day];
              const isToday = day === today;

              let status = "Pending";
              let tone = "text-[var(--text-muted)]";

              if (entry?.done) {
                status = "Completed";
                tone = "text-[var(--accent)]";
              } else if (day < today) {
                status = "Missed";
                tone = "text-rose-400";
              }

              return (
                <div
                  key={day}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg border
                    ${
                      isToday
                        ? "border-[var(--accent)] bg-[var(--bg-panel)]"
                        : "border-[var(--border-soft)]"
                    }`}
                >
                  <span>
                    {DAY_NAMES[i]} – {label}
                  </span>
                  <span className={`text-sm ${tone}`}>{status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
