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
  getDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

type QuestionType = "aptitude" | "technical" | "hr";

type Submission = {
  id: string;
  type?: QuestionType; // 👈 optional on purpose
  question?: string;
  options?: string[];
  answer?: string;
  source?: string;
  submittedBy?: string;
};

const TYPE_LABEL: Record<QuestionType, string> = {
  aptitude: "APTITUDE",
  technical: "TECHNICAL",
  hr: "HR",
};

export default function AdminReview() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState<Submission[]>([]);

  // Check admin access
  useEffect(() => {
    async function checkAdmin() {
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.data()?.role !== "admin") {
        router.replace("/arena");
        return;
      }

      setLoading(false);
    }

    checkAdmin();
  }, [user, router]);

  // Load submissions
  useEffect(() => {
    if (loading) return;

    getDocs(collection(db, "question_submissions")).then(snapshot => {
      const data: Submission[] = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Submission, "id">),
      }));
      setSubs(data);
    });
  }, [loading]);

  if (loading) {
    return (
      <Protected>
        <AppShell>
          <div className="p-16 text-[var(--text-muted)]">
            Checking admin access…
          </div>
        </AppShell>
      </Protected>
    );
  }

  async function approve(sub: Submission) {
    if (
      !sub.type ||
      !sub.question ||
      !sub.options ||
      !sub.answer
    ) {
      alert("Submission is missing required fields.");
      return;
    }

    await addDoc(collection(db, "questions"), {
      type: sub.type,
      question: sub.question,
      options: sub.options,
      answer: sub.answer,
      source: sub.source || null,
      createdAt: serverTimestamp(),
    });

    await deleteDoc(doc(db, "question_submissions", sub.id));
    setSubs(prev => prev.filter(s => s.id !== sub.id));
  }

  async function reject(id: string) {
    await deleteDoc(doc(db, "question_submissions", id));
    setSubs(prev => prev.filter(s => s.id !== id));
  }

  return (
    <Protected>
      <AppShell>
        <div className="max-w-7xl mx-auto p-16 space-y-12">
          {/* HEADER */}
          <div>
            <h1>Admin Review</h1>
            <p className="text-[var(--text-muted)] text-lg">
              Review and approve community-submitted questions.
            </p>
          </div>

          {/* EMPTY */}
          {!subs.length && (
            <div className="card bg-[var(--bg-card)]/85 border border-[var(--border-soft)]">
              🎉 No pending submissions.
            </div>
          )}

          {/* SUBMISSIONS */}
          <div className="space-y-8">
            {subs.map(sub => {
              const label = sub.type
                ? TYPE_LABEL[sub.type]
                : "UNKNOWN";

              return (
                <div
                  key={sub.id}
                  className="card bg-[var(--bg-card)]/85 backdrop-blur border border-[var(--border-soft)] space-y-6"
                >
                  {/* META */}
                  <div className="flex justify-between text-sm font-mono tracking-widest text-[var(--text-muted)]">
                    <span>{label}</span>
                    <span>SUBMITTED</span>
                  </div>

                  {/* QUESTION */}
                  <p className="text-2xl font-semibold">
                    {sub.question || "⚠️ Missing question text"}
                  </p>

                  {/* OPTIONS */}
                  {sub.options && (
                    <ul className="space-y-2">
                      {sub.options.map(o => (
                        <li
                          key={o}
                          className={`p-3 rounded-lg border ${
                            o === sub.answer
                              ? "border-green-500 text-green-600"
                              : "border-[var(--border-soft)]"
                          }`}
                        >
                          {o}
                        </li>
                      ))}
                    </ul>
                  )}

                  {sub.source && (
                    <p className="text-sm text-[var(--text-muted)]">
                      Source: {sub.source}
                    </p>
                  )}

                  {/* ACTIONS */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => approve(sub)}
                      className="btn btn-press bg-green-600 text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(sub.id)}
                      className="btn btn-press border border-red-400 text-red-400"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
