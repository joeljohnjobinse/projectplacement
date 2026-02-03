"use client";

import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";

const SEED_QUIZZES = [
  {
    title: "Google SWE Intern Mock",
    company: "Google",
    role: "SWE Intern",
    difficulty: "medium",
    status: "approved",
    questions: [
      {
        id: "q1",
        text: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
        correctIndex: 1,
      },
      {
        id: "q2",
        text: "Which data structure is used in BFS?",
        options: ["Stack", "Queue", "Heap", "Set"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "Amazon Backend Intern Mock",
    company: "Amazon",
    role: "Backend Intern",
    difficulty: "medium",
    status: "approved",
    questions: [
      {
        id: "q1",
        text: "Which HTTP method is idempotent?",
        options: ["POST", "PATCH", "PUT", "CONNECT"],
        correctIndex: 2,
      },
      {
        id: "q2",
        text: "Which database is best for key-value access?",
        options: ["Postgres", "MongoDB", "Redis", "MySQL"],
        correctIndex: 2,
      },
    ],
  },
];

export default function AdminSeedPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function seed() {
    setLoading(true);

    for (const quiz of SEED_QUIZZES) {
      const q = query(
        collection(db, "quizzes"),
        where("title", "==", quiz.title)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        await addDoc(collection(db, "quizzes"), quiz);
      }
    }

    setLoading(false);
    setDone(true);
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Seed Mock Quizzes</h1>

      <button
        onClick={seed}
        disabled={loading}
        className="btn btn-press border"
      >
        {loading ? "Seeding…" : "Seed Mock Quizzes"}
      </button>

      {done && <p className="text-green-400">✅ Done</p>}
    </div>
  );
}
