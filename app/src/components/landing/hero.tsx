"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { LanguageSwitcher } from "../ui/language-switcher";

export default function Hero({
  createSession,
}: {
  createSession: () => Promise<void>;
}) {
  const t = useTranslations("Hero");

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background">
      <div className="absolute top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>

      <div className="max-w-2xl mx-auto px-4 flex flex-col items-center text-center gap-6">
        <Image
          src="/brand/beaverly_health_logo.png"
          alt="Beaverly Health"
          width={320}
          height={320}
          className="mb-2"
          priority
        />
        <p className="text-lg md:text-xl text-muted-foreground font-light">
          {t("subtitle")}
        </p>
        <p className="text-sm md:text-base text-muted-foreground/60 max-w-md">
          {t("description")}
        </p>
        <form action={createSession} className="mt-4">
          <Button type="submit" size="lg" className="rounded-full px-8">
            {t("cta")}
          </Button>
        </form>
      </div>
    </section>
  );
}