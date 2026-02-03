import Link from "next/link";

const COMPANIES = ["Google", "Amazon", "Microsoft"];

export default function LeaderboardsIndex() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Leaderboards</h1>

      {COMPANIES.map(c => (
        <Link
          key={c}
          href={`/leaderboards/${c}`}
          className="block p-4 rounded border hover:bg-[var(--bg-panel)]"
        >
          {c}
        </Link>
      ))}
    </div>
  );
}
