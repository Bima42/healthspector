import { api } from "../../../lib/trpc/server";
import { SharedSessionView } from "../../../components/session/shared-session-view";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SharedSessionPage({ params }: Props) {
  const { token } = await params;
  const session = await api.session.getByShareToken({ token });

  if (!session) {
    notFound();
  }

  return (
    <SharedSessionView
      token={token}
      sessionTitle={session.title}
      initialPainPoints={session.painPoints}
    />
  );
}