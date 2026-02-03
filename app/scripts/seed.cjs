const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Load service account JSON safely
const serviceAccountPath = path.join(
  __dirname,
  "serviceAccountKey.json"
);

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seed() {
  console.log("🌱 Seeding database with ADMIN privileges…");

  // =========================
  // FLASHCARDS
  // =========================
  const flashcards = [
    {
      front: "What is time complexity?",
      back: "How an algorithm’s runtime grows with input size.",
      category: "general",
    },
    {
      front: "What is closure in JavaScript?",
      back: "A function’s access to variables from its outer scope.",
      category: "technical",
    },
  ];

  for (const card of flashcards) {
    await db.collection("flashcards").add(card);
  }

  console.log("✅ Flashcards seeded");

  // =========================
  // QUESTIONS (Drills)
  // =========================
  const questions = [
    {
      type: "technical",
      question: "What is Big-O notation used for?",
      options: [
        "Memory allocation",
        "Algorithm efficiency",
        "Compilation",
        "Syntax checking",
      ],
      answer: "Algorithm efficiency",
    },
  ];

  for (const q of questions) {
    await db.collection("questions").add(q);
  }

  console.log("✅ Questions seeded");

  // =========================
  // QUIZ SUBMISSIONS
  // =========================
  const quizzes = [
    {
      title: "Google Technical Mock Round",
      description: "Common JavaScript interview questions",
      company: "Google",
      type: "technical",
      questions: [
        {
          question: "What is a closure?",
          options: [
            "Function inside function",
            "Access to outer scope variables",
            "Memory leak",
            "JS error",
          ],
          answer: "Access to outer scope variables",
        },
      ],
      submittedBy: "system",
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ];

  for (const quiz of quizzes) {
    await db.collection("quiz_submissions").add(quiz);
  }

  console.log("🎉 Database seeding complete");
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
