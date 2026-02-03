import { Suspense } from "react";
import RunClient from "./RunClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">Loading mock…</div>}>
      <RunClient />
    </Suspense>
  );
}