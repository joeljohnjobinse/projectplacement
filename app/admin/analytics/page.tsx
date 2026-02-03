"use client";

import { useEffect, useState } from "react";
import { getAverageScoreByCompany } from "@/lib/adminAnalytics";

type Row = {
  company: string;
  avgScorePercent: number;
  attempts: number;
};

export default function AdminAnalyticsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAverageScoreByCompany();
      setRows(data);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <div className="p-6">Loading analytics…</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">
        Mock Round Analytics
      </h1>

      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Company</th>
            <th className="p-2 text-left">Avg Score</th>
            <th className="p-2 text-left">Attempts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.company} className="border-b">
              <td className="p-2">{r.company}</td>
              <td className="p-2">{r.avgScorePercent}%</td>
              <td className="p-2">{r.attempts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
