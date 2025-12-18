import z from 'zod';

export const createAdminSchema = z.object({
  body: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    password: z.string(),
  }),
});

export type createAdminDto = z.infer<typeof createAdminSchema>;

export const loginAdminSchema = z.object({
  body: z.object({
    email: z.string(),
    password: z.string(),
  }),
});

export type loginAdminDto = z.infer<typeof loginAdminSchema>;
