"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  increment,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import QuizRunner from "@/components/quiz/QuizRunner";
import { createMockAttempt } from "@/lib/mockAttempts";

export default function MockRunPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const quizId = searchParams.get("id");

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(20 * 60);

  const startedAt = Date.now();

  /* ---------- LOAD QUIZ ---------- */
  useEffect(() => {
    if (!quizId) {
      setLoading(false);
      return;
    }

    async function load(id: string) {
      try {
        const snap = await getDoc(doc(db, "quizzes", id));
        if (!snap.exists()) return;

        const data = snap.data();
        if (data.status !== "approved") return;

        setQuiz({ id: snap.id, ...data });
      } finally {
        setLoading(false);
      }
    }

    load(quizId);
  }, [quizId]);

  /* ---------- TIMER ---------- */
  useEffect(() => {
    if (!quiz) return;

    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz]);

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  /* ---------- STATES ---------- */
  if (!quizId)
    return <div className="p-6">No quiz selected.</div>;

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading mock…
      </div>
    );

  if (!quiz)
    return (
      <div className="h-screen flex items-center justify-center">
        Mock unavailable.
      </div>
    );

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)]">
      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-[var(--bg-card)]/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push("/mock")}
            className="text-sm text-red-400 hover:underline"
          >
            Exit
          </button>

          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Mock Interview
            </p>
            <h1 className="font-semibold">
              {quiz.company} · {quiz.role}
            </h1>
          </div>

          <span className="font-mono text-sm">
            ⏱ {formatTime(timeLeft)}
          </span>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 flex justify-center px-6 py-12">
        <div className="w-full max-w-3xl">
          <div className="card p-8">
            <QuizRunner
              quiz={quiz}
              onSubmit={async result => {
                if (!user) return;

                const durationSec = Math.floor(
                  (Date.now() - startedAt) / 1000
                );

                const ref = await createMockAttempt({
                  quizId: quiz.id,
                  quizTitle: quiz.title,
                  company: quiz.company,
                  role: quiz.role,
                  userId: user.uid,
                  answers: result.answers,
                  score: result.score,
                  total: result.total,
                  durationSec,
                });

                let xp = 50;
                if (result.score / result.total >= 0.8)
                  xp += 25;

                await updateDoc(
                  doc(db, "users", user.uid),
                  { xp: increment(xp) }
                );

                router.push(`/mock/review?id=${ref.id}`);
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
