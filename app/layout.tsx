import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getServerLocale } from "@/lib/i18n/server";
import { env } from "@/lib/env";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: {
    default: "Backgammon Prime — длинные нарды онлайн",
    template: "%s · Backgammon Prime",
  },
  description:
    "Играй в длинные нарды против бота, друзей и игроков со всего мира. AI-разбор партий, ELO, лидерборды.",
  openGraph: {
    title: "Backgammon Prime — длинные нарды онлайн",
    description:
      "Бот, async-партии, AI-коуч, городские лидерборды. Для СНГ, Турции и MENA.",
    type: "website",
    locale: "ru_RU",
    siteName: "Backgammon Prime",
  },
  twitter: {
    card: "summary_large_image",
    title: "Backgammon Prime",
    description: "Длинные нарды онлайн с AI-разбором",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  return (
    <html
      lang={locale}
      className={`${inter.variable} ${fraunces.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
