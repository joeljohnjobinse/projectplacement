"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { completeToday } from "@/lib/campaign";
import { touchStreak } from "@/lib/streak";

type Question = {
  id: string;
  type: "aptitude" | "technical" | "hr";
  question: string;
  options: string[];
  answer: string;
};

const TYPE_LABEL: Record<Question["type"], string> = {
  aptitude: "APTITUDE",
  technical: "TECHNICAL",
  hr: "HR",
};

export default function Drills() {
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [showXp, setShowXp] = useState(false);

  useEffect(() => {
    getDocs(collection(db, "questions")).then(snap => {
      setQuestions(
        snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<Question, "id">),
        }))
      );
    });
  }, []);

  if (!questions.length) {
    return (
      <Protected>
        <AppShell>
          <div className="p-16 text-[var(--text-muted)]">
            Loading drills…
          </div>
        </AppShell>
      </Protected>
    );
  }

  const q = questions[index];

  async function submit() {
    if (!user || !selected || result) return;

    const isCorrect = selected === q.answer;
    setResult(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      await updateDoc(doc(db, "users", user.uid), {
        xp: increment(10),
        [`stats.${q.type}`]: increment(1),
      });

      setShowXp(true);
      setTimeout(() => setShowXp(false), 600);

      await touchStreak(user.uid);
      await completeToday(user.uid);
    }

    setTimeout(() => {
      setSelected(null);
      setResult(null);
      setIndex((index + 1) % questions.length);
    }, 800);
  }

  return (
    <Protected>
      <AppShell>
        <div className="max-w-7xl mx-auto p-16 space-y-12">
          <div>
            <h1>Drills</h1>
            <p className="text-[var(--text-muted)] text-lg">
              Focus. Decide. Learn.
            </p>
          </div>

          <div className="card bg-[var(--bg-card)]/85 backdrop-blur border border-[var(--border-soft)] space-y-10">
            {/* META */}
            <div className="flex justify-between font-mono text-sm tracking-widest text-[var(--text-muted)]">
              <span>{TYPE_LABEL[q.type]}</span>
              <span>{index + 1}/{questions.length}</span>
            </div>

            {/* QUESTION */}
            <p className="text-3xl font-semibold leading-snug">
              {q.question}
            </p>

            {/* OPTIONS */}
            <div className="grid gap-4">
              {q.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => setSelected(opt)}
                  className={`btn btn-press text-left border transition-all duration-300
                    ${
                      result && opt === q.answer
                        ? "border-green-500 bg-green-500/20"
                        : result && selected === opt
                        ? "border-red-500 bg-red-500/20"
                        : selected === opt
                        ? "border-[var(--accent)] bg-[var(--bg-panel)]"
                        : "border-[var(--border-soft)] hover:bg-[var(--bg-panel)]"
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* XP */}
            {showXp && (
              <div className="text-green-500 text-3xl font-bold font-mono xp-pop">
                +10 XP
              </div>
            )}

            <button
              onClick={submit}
              disabled={!selected || result !== null}
              className="btn btn-press bg-[var(--accent)] text-white text-lg"
            >
              Submit
            </button>
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
