import { z } from 'zod';

export const BookSchema = z.object({
  isbn: z.string().min(5),
  title: z.string(),
  subTitle: z.string().optional(),
  author: z.string(),
  publish_date: z.string(),
  publisher: z.string(),
  pages: z.number().int().nonnegative(),
  description: z.string(),
  website: z.string(),
});

export const BooksListSchema = z.object({
  books: z.array(BookSchema).min(1),
});