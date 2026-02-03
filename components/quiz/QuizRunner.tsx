"use client";

import { useEffect, useState } from "react";

type Question = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
};

type Quiz = {
  id: string;
  questions: Question[];
};

export type QuizResult = {
  answers: Record<number, number>;
  score: number;
  total: number;
};

type Props = {
  quiz: Quiz;
  onSubmit: (result: QuizResult) => Promise<void> | void;
  onProgress?: (current: number, total: number) => void;
};

export default function QuizRunner({
  quiz,
  onSubmit,
  onProgress,
}: Props) {
  const total = quiz.questions.length;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const question = quiz.questions[index];
  const allAnswered =
    Object.keys(answers).length === total;

  /* ---------- PROGRESS ---------- */
  useEffect(() => {
    onProgress?.(index + 1, total);
  }, [index, total]);

  /* ---------- KEYBOARD 1–4 ---------- */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (submitting) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 4) {
        setAnswers(a => ({ ...a, [index]: n - 1 }));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, submitting]);

  function select(i: number) {
    if (submitting) return;
    setAnswers(a => ({ ...a, [index]: i }));
  }

  async function submit() {
    if (submitting || !allAnswered) return;

    setSubmitting(true);

    const score = quiz.questions.reduce(
      (acc, q, i) =>
        acc + (answers[i] === q.correctIndex ? 1 : 0),
      0
    );

    await onSubmit({
      answers,
      score,
      total,
    });
  }

  return (
    <div className="space-y-8">
      <p className="text-xl font-medium">
        {question.text}
      </p>

      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const selected = answers[index] === i;
          return (
            <button
              key={i}
              onClick={() => select(i)}
              className={`w-full text-left p-4 rounded border transition
                ${
                  selected
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-[var(--border-soft)] hover:bg-[var(--bg-panel)]"
                }
              `}
            >
              <span className="mr-2 font-mono opacity-60">
                {i + 1}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between pt-6 border-t border-[var(--border-soft)]">
        <button
          disabled={index === 0 || submitting}
          onClick={() => setIndex(i => i - 1)}
          className="btn btn-press border disabled:opacity-40"
        >
          Back
        </button>

        {index < total - 1 ? (
          <button
            onClick={() => setIndex(i => i + 1)}
            className="btn btn-press border"
          >
            Next
          </button>
        ) : (
          <button
            disabled={!allAnswered || submitting}
            onClick={submit}
            className="btn btn-press border border-green-400 text-green-400 disabled:opacity-40"
          >
            {submitting ? "Submitting…" : "Submit Mock"}
          </button>
        )}
      </div>
    </div>
  );
}
