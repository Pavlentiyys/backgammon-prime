import { Header } from "@/components/layout/Header";
import { PricingCTA } from "./PricingCTA";

const FEATURES = [
  "Безлимит AI-разборов партий",
  "Все скины доски (Чайхана, Бакинский двор)",
  "Безлимит async-партий",
  "Расширенная статистика",
  "Бэйдж Pro в профиле",
];

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto p-6 space-y-8">
        <header className="text-center space-y-2">
          <h1 className="font-display text-4xl">Backgammon Prime Pro</h1>
          <p className="opacity-70">Полный набор фич за чашку кофе в месяц.</p>
        </header>

        <div className="grid sm:grid-cols-2 gap-4">
          <Plan
            name="Месячный"
            price="$4.99"
            period="/мес"
            plan="monthly"
            recommended={false}
          />
          <Plan
            name="Годовой"
            price="$39"
            period="/год"
            sub="экономия 35%"
            plan="yearly"
            recommended
          />
        </div>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">Что включено</h2>
          <ul className="space-y-1">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-[var(--accent)]">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-xs opacity-50 text-center">
          Оплата через Stripe (test mode). Можешь отменить в любой момент.
        </p>
      </main>
    </>
  );
}

function Plan({
  name,
  price,
  period,
  sub,
  plan,
  recommended,
}: {
  name: string;
  price: string;
  period: string;
  sub?: string;
  plan: "monthly" | "yearly";
  recommended: boolean;
}) {
  return (
    <div
      className={
        recommended
          ? "p-6 rounded-2xl border-2 border-[var(--accent)] bg-[var(--accent)]/5 relative"
          : "p-6 rounded-2xl border border-[var(--muted)]/30"
      }
    >
      {recommended && (
        <span className="absolute -top-3 right-4 text-xs px-2 py-0.5 rounded bg-[var(--accent)] text-black font-medium">
          Рекомендуем
        </span>
      )}
      <div className="font-display text-xl mb-1">{name}</div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="font-display text-4xl">{price}</span>
        <span className="opacity-70">{period}</span>
      </div>
      {sub && <p className="text-xs opacity-70 mb-3">{sub}</p>}
      <PricingCTA plan={plan} recommended={recommended} />
    </div>
  );
}
