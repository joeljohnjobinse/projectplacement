"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ---------------- TYPES ---------------- */

type Attempt = {
  quizId: string;
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

/* ---------------- PAGE ---------------- */

export default function MockReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [aiText, setAiText] = useState<Record<number, string>>({});
  const [loadingAI, setLoadingAI] = useState<number | null>(null);

  /* ---------------- LOAD DATA (SAFE) ---------------- */

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
        const attemptRef = doc(db, "mock_attempts", id);
        const attemptSnap = await getDoc(attemptRef);
        if (!attemptSnap.exists()) {
          setLoading(false);
          return;
        }

        const a = attemptSnap.data() as Attempt;
        setAttempt(a);

        const quizId = a.quizId;
        if (!quizId) {
          setLoading(false);
          return;
        }

        const quizRef = doc(db, "quizzes", quizId);
        const quizSnap = await getDoc(quizRef);
        if (!quizSnap.exists()) {
          setLoading(false);
          return;
        }

        setQuestions(quizSnap.data().questions);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [searchParams]);

  /* ---------------- AI EXPLAIN ---------------- */

  async function explain(
    q: Question,
    chosenIndex: number,
    i: number
  ) {
    setLoadingAI(i);

    const res = await fetch("/api/ai/explain-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: q.text,
        options: q.options,
        correct: q.options[q.correctIndex],
        chosen: q.options[chosenIndex],
      }),
    });

    const data = await res.json();
    setAiText(t => ({ ...t, [i]: data.explanation }));
    setLoadingAI(null);
  }

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
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col">

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
        <div className="space-y-6">
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

                {chosen !== q.correctIndex && (
                  <div className="pt-2">
                    <button
                      className="text-sm text-blue-400 hover:underline"
                      onClick={() => explain(q, chosen, i)}
                    >
                      {loadingAI === i ? "Thinking…" : "Why is this wrong?"}
                    </button>

                    {aiText[i] && (
                      <div className="mt-2 p-3 rounded border text-sm whitespace-pre-wrap">
                        {aiText[i]}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
