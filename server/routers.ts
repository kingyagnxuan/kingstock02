import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { marketRouter } from "./routers/market";
import { aiRouter } from "./routers/ai";
import { filesRouter } from "./routers/files";
import { limitUpRouter } from "./routers/limitUp";
import { invitationsRouter } from "./routers/invitations";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  market: marketRouter,
  ai: aiRouter,
  files: filesRouter,
  limitUp: limitUpRouter,
  invitations: invitationsRouter,
});

export type AppRouter = typeof appRouter;
