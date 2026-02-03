const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seed() {
  const quizzes = [
    {
      title: "Google SWE Intern Mock",
      company: "Google",
      role: "SWE Intern",
      difficulty: "medium",
      status: "approved",
      questions: [
        {
          id: "q1",
          text: "What is the time complexity of binary search?",
          options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
          correctIndex: 1,
        },
        {
          id: "q2",
          text: "Which data structure is used in BFS?",
          options: ["Stack", "Queue", "Heap", "Set"],
          correctIndex: 1,
        },
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      title: "Amazon Backend Intern Mock",
      company: "Amazon",
      role: "Backend Intern",
      difficulty: "medium",
      status: "approved",
      questions: [
        {
          id: "q1",
          text: "Which HTTP method is idempotent?",
          options: ["POST", "PATCH", "PUT", "CONNECT"],
          correctIndex: 2,
        },
        {
          id: "q2",
          text: "Which database is best for key-value access?",
          options: ["Postgres", "MongoDB", "Redis", "MySQL"],
          correctIndex: 2,
        },
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ];

  const batch = db.batch();

  quizzes.forEach(q => {
    const ref = db.collection("quizzes").doc();
    batch.set(ref, q);
  });

  await batch.commit();

  console.log("✅ Mock quizzes seeded (ADMIN SDK)");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
