"use client";

import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const QUESTIONS = [
  {
    type: "aptitude",
    topic: "Percentages",
    difficulty: "easy",
    question: "If 20% of a number is 40, what is the number?",
    options: ["80", "180", "200", "160"],
    answer: "200",
    explanation: "20% of x = 40 → x = 40*5 = 200.",
  },
  {
    type: "aptitude",
    topic: "Speed",
    difficulty: "medium",
    question: "A man walks 4 km in 1 hour and cycles 12 km in 1 hour. What is his average speed?",
    options: ["8 km/hr", "10 km/hr", "9 km/hr", "7 km/hr"],
    answer: "8 km/hr",
    explanation: "Total distance = 16 km, time = 2 hrs → 8 km/hr.",
  },
  {
    type: "technical",
    topic: "DSA",
    difficulty: "medium",
    question: "What data structure is used in recursion?",
    options: ["Queue", "Stack", "Heap", "Array"],
    answer: "Stack",
    explanation: "Function calls are stored on the call stack.",
  },
  {
    type: "hr",
    topic: "General",
    difficulty: "easy",
    question: "Tell me about yourself.",
    options: ["Intro", "Background", "Goals", "All of the above"],
    answer: "All of the above",
    explanation: "Structure your answer: who you are, what you know, where you're going.",
  },
];

export default function Seed() {
  async function seed() {
    for (const q of QUESTIONS) {
      await addDoc(collection(db, "questions"), q);
    }
    alert("Seeded!");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Seed Database</h1>
      <button
        onClick={seed}
        className="mt-4 bg-black text-white px-4 py-2"
      >
        Add Questions
      </button>
    </div>
  );
}
