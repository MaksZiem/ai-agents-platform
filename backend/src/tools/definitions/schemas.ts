import { z } from 'zod';

export const transactionSchema = z.object({
  date: z.iso.date(),
  description: z.string().max(500),
  category: z.string().min(1).max(100),
  amount: z.number(),
});

export const periodValueSchema = z.object({
  label: z.string().min(1).max(100),
  value: z.number(),
});
