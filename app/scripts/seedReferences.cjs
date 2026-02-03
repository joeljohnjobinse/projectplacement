const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
} = require("firebase/firestore");

const firebaseConfig = require("../src/lib/firebaseConfig.cjs");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  const userId = "DEV_USER_ID"; // replace with your UID

  await addDoc(collection(db, "references"), {
    title: "Sample DSA Sheet.pdf",
    type: "pdf",
    url: "https://example.com/sample.pdf",
    fileName: "references/dev/sample.pdf",
    userId,
    createdAt: serverTimestamp(),
  });

  console.log("✅ References seeded");
  process.exit(0);
}

seed();
