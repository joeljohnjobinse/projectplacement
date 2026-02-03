import { Suspense } from "react";
import MockReviewClient from "./MockReviewClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">Loading review…</div>}>
      <MockReviewClient />
    </Suspense>
  );
}
