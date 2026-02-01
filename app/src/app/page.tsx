import Hero from "../components/landing/hero";
import { api } from "../lib/trpc/server";
import { redirect } from "next/navigation";

export default async function Home() {
  async function createSession() {
    "use server";
    const session = await api.session.create({ title: "Nouvelle session" });
    redirect(`/session/${session.id}`);
  }

  return (
    <main className="min-h-screen">
      <Hero createSession={createSession} />
    </main>
  );
}