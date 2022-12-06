import { router } from "../trpc";
import { authRouter } from "./auth";
import { notesRouter } from "./notes";

export const appRouter = router({
  notes: notesRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
