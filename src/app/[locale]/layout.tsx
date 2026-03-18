import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const viewport: Viewport = {
  themeColor: "#1A1714",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "BREWFOCUS — Pour · Focus · Brew Results",
    description:
      locale === "fr"
        ? "Application de productivite personnelle avec timer Pomodoro pixel art, brain dump et generation de taches par IA."
        : "Personal productivity app with pixel art Pomodoro timer, brain dump, and AI-powered task generation.",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "BrewFocus",
    },
    other: {
      "mobile-web-app-capable": "yes",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} className={jetbrainsMono.variable}>
      <body className="antialiased font-mono">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-brew-orange focus:text-[#0D0B09] focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-bold"
        >
          Skip to content
        </a>
        <NextIntlClientProvider locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
