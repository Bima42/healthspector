import { initTRPC } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';
import { headers } from 'next/headers';
import 'server-only';
import { db } from '../db';

/**
 * CONTEXT
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the headers.
 */
export const createTRPCContext = cache(async () => {
    const heads = await headers();

    return {
        headers: heads,
        db,
    };
});

const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    errorFormatter({ shape }) {
        return shape;
    }
});

/**
 * ROUTER & PROCEDURE
 */
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;