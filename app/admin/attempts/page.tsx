"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function AdminAttemptsPage() {
  const [attempts, setAttempts] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const q = query(
        collection(db, "mock_attempts"),
        orderBy("submittedAt", "desc")
      );
      const snap = await getDocs(q);
      setAttempts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }

    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">
        All Mock Attempts
      </h1>

      {attempts.map(a => (
        <Link
          key={a.id}
          href={`/mock/review?id=${a.id}`}
          className="block border p-3 rounded mb-2 hover:bg-neutral-800"
        >
          <div className="flex justify-between">
            <span>{a.quizTitle}</span>
            <span>
              {a.score}/{a.total}
            </span>
          </div>
          <p className="text-sm opacity-60">
            {a.company} · {a.userId}
          </p>
        </Link>
      ))}
    </div>
  );
}
