import { z } from "zod";

import { protectedProcedure, router } from "../trpc";

export const notesRouter = router({
  create: protectedProcedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.note.create({
        data: { ...input, userId: ctx.session.user.id },
      });
      return null;
    }),
  getAll: protectedProcedure.query(({ ctx }) => {
    const notes = ctx.prisma.note.findMany({
      where: { userId: ctx.session.user.id },
    });
    return notes;
  }),
});
