"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ---------------- TYPES ---------------- */

type Attempt = {
  quizId?: string;
  company: string;
  role: string;
  score: number;
  total: number;
  answers: Record<number, number>;
};

type Question = {
  text: string;
  options: string[];
  correctIndex: number;
};

/* ---------------- COMPONENT ---------------- */

export default function ReviewClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        if (!id) {
            setLoading(false);
            return;
        }

        const attemptRef = doc(
          collection(db, "mock_attempts"),
          id
        );

        const attemptSnap = await getDoc(attemptRef);
        if (!attemptSnap.exists()) return;

        const a = attemptSnap.data() as Attempt;
        setAttempt(a);

        if (!a.quizId) return;

        const quizRef = doc(
          collection(db, "quizzes"),
          a.quizId
        );

        const quizSnap = await getDoc(quizRef);
        if (!quizSnap.exists()) return;

        setQuestions(quizSnap.data().questions);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [searchParams]);

  /* ---------------- STATES ---------------- */

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading review…
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="h-screen flex items-center justify-center">
        Review unavailable.
      </div>
    );
  }

  const percent = Math.round(
    (attempt.score / attempt.total) * 100
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">

      {/* HEADER */}
      <header className="sticky top-0 bg-[var(--bg-card)]/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push("/mock")}
            className="text-sm hover:underline"
          >
            ← Back to Mock Rounds
          </button>

          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Mock Review
            </p>
            <h1 className="font-semibold">
              {attempt.company} · {attempt.role}
            </h1>
          </div>

          <div />
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-3xl mx-auto p-8 space-y-10">

        {/* SCORE */}
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-wider text-[var(--text-muted)]">
            Your Score
          </p>
          <p className="text-5xl font-mono font-bold">
            {attempt.score} / {attempt.total}
          </p>
          <p className="text-[var(--text-muted)]">
            {percent}% accuracy
          </p>
        </div>

        {/* QUESTIONS */}
        {questions.map((q, i) => {
          const chosen = attempt.answers[i];

          return (
            <div key={i} className="card p-4 space-y-3">
              <p className="font-medium">
                {i + 1}. {q.text}
              </p>

              {q.options.map((opt, idx) => {
                const isCorrect = idx === q.correctIndex;
                const isChosen = idx === chosen;

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded border text-sm
                      ${isCorrect ? "border-green-500 bg-green-500/10" : ""}
                      ${isChosen && !isCorrect ? "border-red-500 bg-red-500/10" : ""}
                    `}
                  >
                    {opt}
                  </div>
                );
              })}
            </div>
          );
        })}
      </main>
    </div>
  );
}
