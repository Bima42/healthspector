"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>

      {/* Hero Content - Centered */}
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6">
          {t("title")}
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 mb-8 font-light">
          {t("subtitle")}
        </p>
        <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>
    </section>
  );
}