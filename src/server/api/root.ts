import { locationsRouter } from './routers/locations-router';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
    location: locationsRouter,
});

export type AppRouter = typeof appRouter;
