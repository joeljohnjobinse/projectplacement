"use client";

import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import Link from "next/link";

import { useAuth } from "@/lib/auth";
import { db, auth } from "@/lib/firebase";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { sendPasswordResetEmail, signOut } from "firebase/auth";
import { useEffect, useState, ChangeEvent } from "react";

/* ---------------- TYPES ---------------- */

type UserData = {
  displayName?: string;
  avatarData?: string | null;
  xp: number;
  streak: number;
};

type MockAttempt = {
  id: string;
  quizTitle: string;
  company: string;
  role: string;
  score: number;
  total: number;
};

/* ---------------- PAGE ---------------- */

export default function Profile() {
  const { user } = useAuth();

  const [data, setData] = useState<UserData | null>(null);
  const [attempts, setAttempts] = useState<MockAttempt[]>([]);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    async function load() {
      const userSnap = await getDoc(doc(db, "users", uid));
      if (!userSnap.exists()) return;

      const userData = userSnap.data() as UserData;
      setData(userData);
      setName(userData.displayName ?? "");
      setAvatarPreview(userData.avatarData ?? null);

      const q = query(
        collection(db, "mock_attempts"),
        where("userId", "==", uid),
        orderBy("submittedAt", "desc")
      );

      const snap = await getDocs(q);
      setAttempts(
        snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<MockAttempt, "id">),
        }))
      );
    }

    load();
  }, [user]);

  if (!data) return null;

  const level = Math.floor(data.xp / 100) + 1;

  /* ---------- EDIT HANDLERS ---------- */

  function onAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () =>
      setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function save() {
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      displayName: name.trim(),
      avatarData: avatarPreview,
    });

    setEditing(false);
  }

  function cancel() {
    setName(data?.displayName ?? "");
    setAvatarPreview(data?.avatarData ?? null);
    setEditing(false);
  }

  /* ---------------- UI ---------------- */

  return (
    <Protected>
      <AppShell>
        <div className="max-w-7xl mx-auto p-16 space-y-16">

          {/* PLAYER CARD */}
          <div className="card bg-[var(--bg-card)]/85 backdrop-blur border border-[var(--border-soft)] flex items-center justify-between">
            <div className="flex items-center gap-8">

              {/* AVATAR */}
              <div className="relative w-32 h-32 rounded-full bg-[var(--bg-panel)] overflow-hidden group">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🧑
                  </div>
                )}

                {editing && (
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition">
                    <span className="text-sm text-white">
                      Change
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* NAME */}
              <div className="space-y-2">
                {editing ? (
                  <>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="input text-lg w-64"
                      placeholder="Display name"
                    />
                    <p className="text-sm text-[var(--text-muted)]">
                      Shown on leaderboards
                    </p>
                  </>
                ) : (
                  <>
                    <h1>{data.displayName || "Cadet"}</h1>
                    <p className="text-[var(--text-muted)] text-lg">
                      LV {level} · 🔥 {data.streak} day streak
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* ACTIONS */}
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={save}
                  className="btn btn-press border border-green-400 text-green-400"
                >
                  Save
                </button>
                <button
                  onClick={cancel}
                  className="btn btn-press border"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="btn btn-press border"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* MOCK ROUNDS */}
          <div className="card bg-[var(--bg-card)]/85 backdrop-blur border border-[var(--border-soft)] space-y-4">
            <h2>Mock Rounds</h2>

            {attempts.length === 0 ? (
              <p className="text-[var(--text-muted)]">
                No mock rounds attempted yet.
              </p>
            ) : (
              attempts.map(a => (
                <Link
                  key={a.id}
                  href={`/mock/review?id=${a.id}`}
                  className="block p-3 rounded border border-[var(--border-soft)] hover:bg-[var(--bg-panel)] transition"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {a.quizTitle}
                    </span>
                    <span className="font-mono">
                      {a.score}/{a.total}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {a.company} · {a.role}
                  </p>
                </Link>
              ))
            )}
          </div>

          {/* ACCOUNT */}
          <div className="card bg-[var(--bg-card)]/85 backdrop-blur border border-[var(--border-soft)] space-y-4">
            <h2>Account</h2>

            <button
              onClick={() =>
                sendPasswordResetEmail(auth, user!.email!)
              }
              className="btn btn-press border"
            >
              Change Password
            </button>

            <button
              onClick={() => signOut(auth)}
              className="btn btn-press border border-red-400 text-red-400"
            >
              Sign Out
            </button>
          </div>

        </div>
      </AppShell>
    </Protected>
  );
}
