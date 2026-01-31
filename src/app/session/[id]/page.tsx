import { BodyViewer } from "@/components/session/body-viewer";
import { PinListSidebar } from "@/components/session/pin-list-sidebar";
import { api } from "@/lib/trpc/server";
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
      <PinListSidebar sessionId={session.id}>
        <div className="h-full flex flex-col">
          <header className="border-b p-4 bg-background z-10">
            <h1 className="text-xl font-semibold">{session.title}</h1>
          </header>
          <BodyViewer
            sessionId={session.id}
            initialPainPoints={session.painPoints ?? []}
          />
        </div>
      </PinListSidebar>
    </div>
  );
}
