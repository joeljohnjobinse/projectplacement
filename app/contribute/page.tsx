"use client";

import { useState } from "react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

type QuestionType = "aptitude" | "technical" | "hr";

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
};

export default function BuildQuiz() {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [company, setCompany] = useState("");
  const [type, setType] = useState<QuestionType>("technical");
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { question: "", options: ["", "", "", ""], answer: "" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function updateQuestion(
    i: number,
    field: keyof QuizQuestion,
    value: any
  ) {
    const next = [...questions];
    (next[i] as any)[field] = value;
    setQuestions(next);
  }

  function updateOption(qi: number, oi: number, value: string) {
    const next = [...questions];
    next[qi].options[oi] = value;
    setQuestions(next);
  }

  function addQuestion() {
    setQuestions(prev => [
      ...prev,
      { question: "", options: ["", "", "", ""], answer: "" },
    ]);
  }

  async function submitQuiz() {
    if (!user) return;

    if (!title.trim()) return alert("Quiz title is required.");
    if (
      questions.some(
        q =>
          !q.question.trim() ||
          q.options.some(o => !o.trim()) ||
          !q.answer.trim()
      )
    ) {
      return alert("Please complete all questions fully.");
    }

    setSubmitting(true);

    await addDoc(collection(db, "quiz_submissions"), {
      title,
      description: description || null,
      company: company || null,
      type,
      questions,
      submittedBy: user.uid,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    setSubmitting(false);
    setSuccess(true);

    // Reset
    setTitle("");
    setDescription("");
    setCompany("");
    setQuestions([{ question: "", options: ["", "", "", ""], answer: "" }]);
  }

  return (
    <Protected>
      <AppShell>
        <div className="max-w-7xl mx-auto p-16 space-y-12">
          {/* HEADER */}
          <div>
            <h1>Build a Quiz</h1>
            <p className="text-[var(--text-muted)] text-lg max-w-2xl">
              Create a full mock round from real interview experience.
              Each quiz can contain multiple questions.
            </p>
          </div>

          {success && (
            <div className="card bg-green-500/10 border border-green-500 text-green-600">
              ✅ Quiz submitted for review.
            </div>
          )}

          {/* QUIZ INFO */}
          <div className="card bg-[var(--bg-card)]/85 border border-[var(--border-soft)] space-y-6">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-soft)]"
              placeholder="Quiz title (e.g. Google Technical Round)"
            />

            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-soft)]"
              placeholder="Description (optional)"
            />

            <input
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="w-full p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-soft)]"
              placeholder="Company (optional)"
            />

            <div className="flex gap-4">
              {(["aptitude", "technical", "hr"] as QuestionType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`btn btn-press font-mono ${
                    type === t
                      ? "bg-[var(--accent)] text-white"
                      : "border border-[var(--border-soft)]"
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* QUESTIONS */}
          <div className="space-y-10">
            {questions.map((q, qi) => (
              <div
                key={qi}
                className="card bg-[var(--bg-card)]/85 border border-[var(--border-soft)] space-y-6"
              >
                <p className="font-mono text-sm text-[var(--text-muted)]">
                  QUESTION {qi + 1}
                </p>

                <textarea
                  value={q.question}
                  onChange={e =>
                    updateQuestion(qi, "question", e.target.value)
                  }
                  rows={3}
                  className="w-full p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-soft)]"
                  placeholder="Question text"
                />

                <div className="grid gap-3">
                  {q.options.map((opt, oi) => (
                    <input
                      key={oi}
                      value={opt}
                      onChange={e =>
                        updateOption(qi, oi, e.target.value)
                      }
                      className="p-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-soft)]"
                      placeholder={`Option ${oi + 1}`}
                    />
                  ))}
                </div>

                <input
                  value={q.answer}
                  onChange={e =>
                    updateQuestion(qi, "answer", e.target.value)
                  }
                  className="p-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-soft)]"
                  placeholder="Correct answer (must match one option)"
                />
              </div>
            ))}
          </div>

          <button
            onClick={addQuestion}
            className="btn btn-press border border-[var(--border-soft)]"
          >
            ➕ Add another question
          </button>

          <button
            onClick={submitQuiz}
            disabled={submitting}
            className="btn btn-press bg-[var(--accent)] text-white text-lg"
          >
            {submitting ? "Submitting…" : "Submit Quiz for Review"}
          </button>
        </div>
      </AppShell>
    </Protected>
  );
}
