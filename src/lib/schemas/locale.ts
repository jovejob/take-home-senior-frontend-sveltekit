import { z } from 'zod';

export const SUPPORTED_LOCALES = ['en', 'de'] as const;
export const LocaleSchema = z.enum(SUPPORTED_LOCALES);
export type Locale = z.infer<typeof LocaleSchema>;
