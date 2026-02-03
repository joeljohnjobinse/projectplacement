"use client";

import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const FLASHCARDS = [
  // Aptitude
  {
    category: "aptitude",
    front: "Formula for percentage increase?",
    back: "((New − Old) / Old) × 100",
  },
  {
    category: "aptitude",
    front: "Formula for simple interest?",
    back: "(P × R × T) / 100",
  },
  {
    category: "aptitude",
    front: "Average = ?",
    back: "Total sum of values / Number of values",
  },
  {
    category: "aptitude",
    front: "Speed = ?",
    back: "Distance / Time",
  },
  {
    category: "aptitude",
    front: "Work formula?",
    back: "Work = Rate × Time",
  },

  // Technical
  {
    category: "technical",
    front: "What is encapsulation?",
    back: "Binding data and methods together while hiding internal state.",
  },
  {
    category: "technical",
    front: "Stack vs Queue?",
    back: "Stack follows LIFO; Queue follows FIFO.",
  },
  {
    category: "technical",
    front: "What is recursion?",
    back: "A function calling itself to solve a problem in smaller steps.",
  },
  {
    category: "technical",
    front: "What is a database index?",
    back: "A structure that speeds up data retrieval operations.",
  },
  {
    category: "technical",
    front: "What is REST?",
    back: "An architectural style for building stateless web APIs.",
  },

  // HR
  {
    category: "hr",
    front: "Tell me about yourself – structure?",
    back: "Intro → Education → Skills → Goals (30–45 seconds).",
  },
  {
    category: "hr",
    front: "Why should we hire you?",
    back: "Show value: skills + attitude + alignment with company.",
  },
  {
    category: "hr",
    front: "Strength vs weakness?",
    back: "Mention a real weakness and how you're improving it.",
  },
  {
    category: "hr",
    front: "Where do you see yourself in 5 years?",
    back: "Focus on growth, learning, and contribution.",
  },
  {
    category: "hr",
    front: "How do you handle failure?",
    back: "Reflect, learn, adapt, and move forward.",
  },
];

export default function SeedFlashcards() {
  async function seed() {
    for (const c of FLASHCARDS) {
      await addDoc(collection(db, "flashcards"), c);
    }
    alert("Flashcards seeded!");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Seed Flashcards</h1>
        <button
          onClick={seed}
          className="bg-white text-black px-6 py-3 rounded-lg font-semibold"
        >
          Add Flashcards
        </button>
        <p className="text-sm opacity-70">
          Run this once, then delete this page.
        </p>
      </div>
    </div>
  );
}
