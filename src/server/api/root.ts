import { locationsRouter } from './routers/locations-router';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
    locations: locationsRouter,
});

export type AppRouter = typeof appRouter;
