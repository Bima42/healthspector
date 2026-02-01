import { sessionRouter } from './routers/session-router';
import { aiRouter } from './routers/ai-router';
import { speechRouter } from './routers/speech-router';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
    session: sessionRouter,
    ai: aiRouter,
    speech: speechRouter,
});

export type AppRouter = typeof appRouter;