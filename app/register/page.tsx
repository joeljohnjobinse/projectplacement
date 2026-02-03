"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    try {
      setLoading(true);
      setError(null);

      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        displayName: "Cadet",
        avatarData: null,
        xp: 0,
        streak: 0,
        lastActive: null,
        createdAt: Date.now(),
        stats: {
          aptitude: 0,
          technical: 0,
          hr: 0,
        },
      });

      router.push("/arena");
    } catch (e: any) {
      setError("Unable to create account. Try a stronger password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl p-8 bg-[var(--bg-card)] border border-[var(--border-soft)] space-y-6 shadow-sm">
        
        <div className="flex justify-center">
          <Image src="/logo.png" alt="ProjectPlacement" width={120} height={120} />
        </div>

        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">Begin Your Training</h1>
          <p className="text-[var(--text-muted)]">
            Create your player profile.
          </p>
        </div>

        {error && (
          <div className="text-sm text-rose-500 border border-rose-500/30 rounded-lg p-2 text-center">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-soft)] outline-none focus:border-[var(--accent)] transition"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-soft)] outline-none focus:border-[var(--accent)] transition"
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-[var(--accent)] text-white font-semibold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create Account"}
        </button>

        <p className="text-sm text-[var(--text-muted)] text-center">
          Already training?{" "}
          <Link
            href="/login"
            className="text-[var(--accent)] hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
