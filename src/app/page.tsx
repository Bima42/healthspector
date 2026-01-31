import Hero from "@/components/landing/hero";
import { api } from "@/lib/trpc/server";
import { redirect } from "next/navigation";

export default async function Home() {
  async function createSession() {
    "use server";
    const session = await api.session.create({ title: "Nouvelle session" });
    redirect(`/session/${session.id}`);
  }

  return (
    <main className="min-h-screen">
      <Hero />
      <div className="flex items-center justify-center py-12">
        <form action={createSession}>
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Commencer une nouvelle session
          </button>
        </form>
      </div>
    </main>
  );
}