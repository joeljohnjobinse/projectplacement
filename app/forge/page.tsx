"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

type Card = {
  id: string;
  front: string;
  back: string;
  category?: string;
};

export default function Forge() {
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    getDocs(collection(db, "flashcards")).then(snap => {
      setCards(
        snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<Card, "id">),
        }))
      );
    });
  }, []);

  if (!cards.length) {
    return (
      <Protected>
        <AppShell>
          <div className="p-16 text-[var(--text-muted)]">
            Loading Memory Forge…
          </div>
        </AppShell>
      </Protected>
    );
  }

  const card = cards[index];

  function next() {
    setFlipped(false);
    setIndex((index + 1) % cards.length);
  }

  function prev() {
    setFlipped(false);
    setIndex((index - 1 + cards.length) % cards.length);
  }

  return (
    <Protected>
      <AppShell>
        <div className="max-w-7xl mx-auto p-16 space-y-12">
          {/* HEADER */}
          <div>
            <h1>Memory Forge</h1>
            <p className="text-[var(--text-muted)] text-lg">
              Reinforce concepts. One card at a time.
            </p>
          </div>

          {/* CARD */}
          <div className="flex justify-center">
            <div className="perspective w-full max-w-3xl">
              <div
                onClick={() => setFlipped(!flipped)}
                className={`relative card-flip cursor-pointer ${
                  flipped ? "flipped" : ""
                }`}
              >
                {/* FRONT */}
                <div className="card-face card bg-[var(--bg-card)]/85 backdrop-blur border border-[var(--border-soft)] p-16 text-center">
                  <p className="text-sm text-[var(--text-muted)] mb-4">
                    Tap to reveal
                  </p>
                  <p className="text-3xl font-semibold leading-snug">
                    {card.front}
                  </p>
                </div>

                {/* BACK */}
                <div className="card-face card-back absolute inset-0 card bg-[var(--bg-panel)] border border-[var(--border-soft)] p-16 text-center">
                  <p className="text-2xl font-semibold leading-snug">
                    {card.back}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* NAV */}
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <button
              onClick={prev}
              className="btn btn-press border border-[var(--border-soft)]"
            >
              ← Previous
            </button>

            <span className="font-mono text-[var(--text-muted)]">
              {index + 1}/{cards.length}
            </span>

            <button
              onClick={next}
              className="btn btn-press border border-[var(--border-soft)]"
            >
              Next →
            </button>
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
