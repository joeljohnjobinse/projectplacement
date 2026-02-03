"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/arena");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl p-8 bg-[var(--bg-card)]/85 backdrop-blur border border-[var(--border-soft)] space-y-6">
        {/* LOGO */}
        <div className="flex justify-center">
          <Image src="/logo.png" alt="ProjectPlacement" width={120} height={120} />
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-[var(--text-muted)]">Continue your training.</p>
        </div>

        {error && (
          <div className="text-sm text-rose-500 border border-rose-500/30 rounded-lg p-2 text-center">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-soft)] outline-none focus:border-[var(--accent)]"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-soft)] outline-none focus:border-[var(--accent)]"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[var(--accent)] text-white font-semibold py-3 rounded-lg hover:brightness-110 transition"
        >
          {loading ? "Signing in…" : "Enter Arena"}
        </button>

        <p className="text-sm text-center text-[var(--text-muted)]">
          New here?{" "}
          <Link href="/register" className="text-[var(--accent)] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
