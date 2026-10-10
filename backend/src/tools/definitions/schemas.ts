import { z } from 'zod';

export const periodSchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
});

export const transactionSchema = z.object({
  id: z.string(),
  date: z.iso.date(),
  description: z.string(),
  category: z.string(),
  amount: z.number(),
});
