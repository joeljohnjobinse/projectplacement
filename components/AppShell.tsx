"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import ThemeToggle from "./ThemeToggle";

type UserData = {
  displayName?: string;
  avatarData?: string;
  role?: "admin"|"user";
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserData | null>(null);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "users", user.uid), snap => {
      setProfile(snap.data() as UserData);
    });
  }, [user]);

  return (
    <div className="min-h-screen flex relative overflow-hidden text-[var(--text-main)]">
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-400/30 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[520px] h-[520px] rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[420px] h-[420px] rounded-full bg-sky-400/25 blur-3xl" />
      </div>

      {/* SIDEBAR */}
      <aside className="w-64 bg-[var(--bg-card)]/85 backdrop-blur-xl border-r border-[var(--border-soft)] flex flex-col">
        {/* LOGO */}
        <div className="p-6 flex justify-center">
          <Image src="/logo.png" alt="ProjectPlacement" width={240} height={240} />
        </div>

        {/* PLAYER MINI CARD */}
        <div className="px-4 pb-4">
          <Link
            href="/profile"
            className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-soft)] hover:bg-[var(--bg-panel)] transition"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--bg-panel)] overflow-hidden flex items-center justify-center">
              {profile?.avatarData ? (
                <img src={profile.avatarData} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-[var(--text-muted)]">👤</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">
                {profile?.displayName || "Cadet"}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Player Card</p>
            </div>
          </Link>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-3 space-y-1">
          <Item href="/arena" label="Arena" active={path === "/arena"} />
          <Item href="/drills" label="Drills" active={path === "/drills"} />
          <Item href="/mock" label="Mock Rounds" active={path.startsWith("/mock")} />
          <Item href="/forge" label="Memory Forge" active={path === "/forge"} />
          <Item href="/history" label="History" active={path === "/history"} />
          <Item href="/contribute" label="Contribute" active={path === "/contribute"}/>
          {profile?.role === "admin" && (  <Item    href="/admin/review"    label="Admin Review"    active={path.startsWith("/admin")}  />)}
          <Item href="/references" label="References" active={path === "/references"}/>
          <Item href="/profile" label="Profile" active={path === "/profile"} />

        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-[var(--border-soft)] flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">Train with intent.</span>
          <ThemeToggle />
        </div>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}

function Item({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block px-4 py-2 rounded-lg transition-all
        ${
          active
            ? "bg-[var(--bg-panel)]/80 text-[var(--accent)]"
            : "hover:bg-[var(--bg-panel)]/70 hover:translate-x-1"
        }`}
    >
      {label}
    </Link>
  );
}
