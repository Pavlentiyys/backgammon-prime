import Link from "next/link";

const MODES = [
  {
    href: "/play/tutorial",
    title: "Обучение",
    desc: "Дед и внук. Изучи правила длинных нард в 6 главах с интерактивными заданиями.",
    icon: "👴",
    accent: true,
  },
  {
    href: "/play/bot",
    title: "Против бота",
    desc: "Сыграй против AI 3 уровней сложности. Подсказки ходов включены.",
    icon: "🤖",
  },
  {
    href: "/play/hotseat",
    title: "Hot-seat",
    desc: "Играй вдвоём на одном экране. Ходи по очереди.",
    icon: "👥",
  },
];

export default function LocalHubPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl">
          Backgammon Prime
        </Link>
        <Link href="/" className="text-sm opacity-70 hover:opacity-100">
          ← На главную
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8 max-w-3xl mx-auto w-full">
        <h1 className="font-display text-4xl text-center">Локальная игра</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {MODES.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={
                m.accent
                  ? "p-6 rounded-2xl border-2 border-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 transition flex flex-col gap-2"
                  : "p-6 rounded-2xl border border-[var(--muted)]/40 hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition flex flex-col gap-2"
              }
            >
              <span className="text-4xl">{m.icon}</span>
              <h2 className="font-display text-xl">{m.title}</h2>
              <p className="text-sm opacity-70">{m.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
