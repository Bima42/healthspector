import { sessionRouter } from './routers/session-router';
import { aiRouter } from './routers/ai-router';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
    session: sessionRouter,
    ai: aiRouter,
});

export type AppRouter = typeof appRouter;