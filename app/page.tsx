import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        {/* Light mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#eef3ff] via-[#f5f7ff] to-[#eefcff] dark:hidden" />

        {/* Dark mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1020] via-[#0e1530] to-[#070b18] hidden dark:block" />

        {/* Abstract shapes */}
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-blue-400/30 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-sky-400/25 blur-3xl" />
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-32 space-y-32">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="ProjectPlacement"
            width={500}
            height={500}
            priority
          />
        </div>
        {/* HERO */}
        <section className="text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
            Train for placements
            <br />
            <span className="text-blue-600 dark:text-blue-400">
              with structure, not stress.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
            ProjectPlacement is a focused training system that
            builds consistency, confidence, and momentum —
            one day at a time.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="bg-blue-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] hover:bg-blue-700 transition"
            >
              Begin Training
            </Link>

            <Link
              href="/login"
              className="px-8 py-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-white/5 backdrop-blur text-slate-900 dark:text-white hover:bg-white transition"
            >
              I already have an account
            </Link>
          </div>
        </section>

        {/* FEATURES */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Feature
            emoji="🗺️"
            title="Campaign-Based Training"
            text="A weekly structure that tells you what to train — so you never wonder what to do next."
          />
          <Feature
            emoji="⚔️"
            title="Arena & Drills"
            text="Focused practice sessions designed for real placement patterns."
          />
          <Feature
            emoji="🧠"
            title="Memory Forge"
            text="Retention-first learning that helps knowledge actually stick."
          />
        </section>

        {/* CLOSING */}
        <section className="text-center space-y-6">
          <p className="text-lg text-slate-700 dark:text-slate-300">
            This isn’t about doing more.
          </p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white">
            It’s about showing up consistently.
          </p>
        </section>
      </div>
    </main>
  );
}

function Feature({
  emoji,
  title,
  text,
}: {
  emoji: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl p-8 bg-white/80 dark:bg-white/5 backdrop-blur border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition space-y-4">
      <div className="text-3xl">{emoji}</div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {text}
      </p>
    </div>
  );
}
