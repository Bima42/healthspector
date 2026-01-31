import { locationsRouter } from './routers/locations-router';
import { sessionRouter } from './routers/session';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
    locations: locationsRouter,
    session: sessionRouter,
});

export type AppRouter = typeof appRouter;
