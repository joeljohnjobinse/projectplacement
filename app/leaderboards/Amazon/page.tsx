"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getCompanyLeaderboard } from "@/lib/getCompanyLeaderboard";

type Row = {
  userId: string;
  avg: number;
  attempts: number;
};

export default function LeaderboardPage() {
  const { company } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (typeof company !== "string") {
        setRows([]);
        setLoading(false);
        return;
      }

      const data = await getCompanyLeaderboard(company);
      setRows(data);
      setLoading(false);
    }

    load();
  }, [company]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-[var(--text-muted)]">
        Loading leaderboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col">

      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-[var(--bg-card)]/90 backdrop-blur border-b border-[var(--border-soft)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/mock")}
            className="text-sm hover:underline"
          >
            ← Back to Mock Rounds
          </button>

          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Leaderboard
            </p>
            <h1 className="text-lg font-semibold">
              {typeof company === "string" ? company : "Company"}
            </h1>
          </div>

          <div />
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-8">

        {/* EMPTY STATE */}
        {rows.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <h2 className="text-2xl font-semibold">
              No leaderboard yet
            </h2>
            <p className="text-[var(--text-muted)] max-w-md">
              No one has completed a mock round for this company yet.
              Be the first and set the benchmark.
            </p>
            <button
              onClick={() => router.push("/mock")}
              className="btn btn-press border"
            >
              Start a Mock
            </button>
          </div>
        )}

        {/* TABLE */}
        {rows.length > 0 && (
          <div className="card bg-[var(--bg-card)]/90 backdrop-blur border border-[var(--border-soft)] overflow-hidden">

            {/* TABLE HEADER */}
            <div className="grid grid-cols-4 px-6 py-3 text-xs uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-soft)]">
              <span>Rank</span>
              <span>User</span>
              <span className="text-right">Accuracy</span>
              <span className="text-right">Attempts</span>
            </div>

            {/* ROWS */}
            {rows.map((row, i) => {
              const isYou =
                user && row.userId === user.uid;

              return (
                <div
                  key={row.userId}
                  className={`grid grid-cols-4 px-6 py-4 items-center border-b border-[var(--border-soft)]
                    ${
                      isYou
                        ? "bg-blue-500/10"
                        : "hover:bg-[var(--bg-panel)]"
                    }
                  `}
                >
                  <span className="font-mono">
                    #{i + 1}
                  </span>

                  <span className="font-medium">
                    {isYou ? "You" : row.userId.slice(0, 8)}
                  </span>

                  <span className="font-mono text-right">
                    {row.avg}%
                  </span>

                  <span className="font-mono text-right">
                    {row.attempts}
                  </span>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
