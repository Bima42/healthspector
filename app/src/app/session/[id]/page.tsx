import { SessionView } from "../../../components/session/session-view";
import { api } from "../../../lib/trpc/server";
import { notFound } from "next/navigation";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await api.session.getById({ id });

  if (!session) {
    notFound();
  }

  return (
    <div className="h-screen">
      <SessionView
        sessionId={session.id}
        sessionTitle={session.title}
        initialPainPoints={session.painPoints ?? []}
      />
    </div>
  );
}
