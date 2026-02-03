"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";

type QuizType = "aptitude" | "technical" | "hr";

type Quiz = {
  id: string;
  title: string;
  description?: string;
  company?: string;
  type: QuizType;
  questions: any[];
};

export default function MockRounds() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<QuizType | "all">("all");

  const router = useRouter();

  useEffect(() => {
    getDocs(collection(db, "quizzes")).then(snap => {
      setQuizzes(
        snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<Quiz, "id">),
        }))
      );
    });
  }, []);

  const filtered = quizzes.filter(q => {
    const matchSearch =
      q.company?.toLowerCase().includes(search.toLowerCase()) ||
      q.title.toLowerCase().includes(search.toLowerCase());

    const matchType = filter === "all" || q.type === filter;

    return matchSearch && matchType;
  });

  // Group by company
  const grouped = filtered.reduce<Record<string, Quiz[]>>((acc, q) => {
    const key = q.company || "General";
    acc[key] = acc[key] || [];
    acc[key].push(q);
    return acc;
  }, {});

  return (
    <Protected>
      <AppShell>
        <div className="max-w-7xl mx-auto p-16 space-y-12">
          {/* HEADER */}
          <div>
            <h1>Mock Rounds</h1>
            <p className="text-[var(--text-muted)] text-lg max-w-2xl">
              Company-style mock interviews. Same round. Same pressure.
            </p>
          </div>

          {/* CONTROLS */}
          <div className="flex flex-wrap gap-4 items-center">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="p-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-soft)]"
              placeholder="Search company or quiz…"
            />

            {(["all", "aptitude", "technical", "hr"] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`btn btn-press font-mono ${
                  filter === t
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--border-soft)]"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* LIST */}
          <div className="space-y-16">
            {Object.entries(grouped).map(([company, list]) => (
              <div key={company} className="space-y-6">
                <h2 className="text-2xl">{company}</h2>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {list.map(q => (
                    <div
                      key={q.id}
                      className="card card-hover bg-[var(--bg-card)]/85 border border-[var(--border-soft)] space-y-4 cursor-pointer"
                      onClick={() => router.push(`/mock/run?id=${q.id}`)}
                    >
                      <p className="font-semibold text-lg">
                        {q.title}
                      </p>

                      {q.description && (
                        <p className="text-sm text-[var(--text-muted)]">
                          {q.description}
                        </p>
                      )}

                      <div className="flex justify-between font-mono text-sm text-[var(--text-muted)]">
                        <span>{(q.type ?? "mock").toUpperCase()}</span>
                        <span>{q.questions.length} Qs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
