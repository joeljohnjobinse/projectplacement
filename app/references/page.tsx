"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import Protected from "@/components/Protected";

type Reference = {
  id: string;
  title: string;
  type: "pdf" | "doc";
  url: string;
  fileName: string;
};

export default function ReferencesPage() {
  const { user } = useAuth();

  const [files, setFiles] = useState<Reference[]>([]);
  const [uploading, setUploading] = useState(false);

  /* ---------- LOAD FILES ---------- */
  useEffect(() => {
    if (!user) return;

    async function load() {
      const q = query(
        collection(db, "references"),
        where("userId", "==", user?.uid),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);

      setFiles(
        snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<Reference, "id">),
        }))
      );
    }

    load();
  }, [user]);

  /* ---------- UPLOAD ---------- */
  async function uploadFile(file: File) {
    if (!user) return;

    setUploading(true);

    try {
      const path = `references/${user.uid}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, path);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const type =
        file.type.includes("pdf") ? "pdf" : "doc";

      const docRef = await addDoc(
        collection(db, "references"),
        {
          title: file.name,
          type,
          url,
          fileName: path,
          userId: user.uid,
          createdAt: serverTimestamp(),
        }
      );

      setFiles(f => [
        {
          id: docRef.id,
          title: file.name,
          type,
          url,
          fileName: path,
        },
        ...f,
      ]);
    } finally {
      setUploading(false);
    }
  }

  /* ---------- DELETE ---------- */
  async function remove(f: Reference) {
    if (!user) return;

    await deleteDoc(doc(db, "references", f.id));
    await deleteObject(ref(storage, f.fileName));

    setFiles(files => files.filter(x => x.id !== f.id));
  }

  return (
    <Protected>
      <AppShell>
        <div className="max-w-6xl mx-auto p-12 space-y-8">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">
              References
            </h1>

            <label className="btn btn-press border cursor-pointer">
              {uploading ? "Uploading…" : "Upload PDF / Doc"}
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) uploadFile(file);
                }}
              />
            </label>
          </div>

          {/* EMPTY */}
          {files.length === 0 && (
            <div className="card p-8 text-center text-[var(--text-muted)]">
              No references uploaded yet.
            </div>
          )}

          {/* LIST */}
          <div className="grid gap-4">
            {files.map(f => (
              <div
                key={f.id}
                className="card p-4 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">
                    {f.type === "pdf" ? "📄" : "📝"}
                  </span>

                  <div>
                    <p className="font-medium">
                      {f.title}
                    </p>
                    <a
                      href={f.url}
                      target="_blank"
                      className="text-sm text-blue-400 hover:underline"
                    >
                      Open
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => remove(f)}
                  className="text-sm text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

        </div>
      </AppShell>
    </Protected>
  );
}
