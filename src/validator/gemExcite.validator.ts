import z from 'zod';

export const gemExciteOnboardingSchema = z.object({
  body: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    area: z.string(),
    sourcingLocality:z.string(),
    commodityType:z.string(),
    agroCommodity: z.string(),
  }),
});

export type gemExciteOnboardingSchemaDto = z.infer<
  typeof gemExciteOnboardingSchema
>;

export const gemExciteAssignUserToRequestSchema = z.object({
  params: z.object({
    requestId: z.string().min(1, 'Request ID is required'),
  }),
  body: z.object({
    users: z
      .array(
        z.object({
          userId: z.string().min(1, 'User ID is required'),
          quantity: z.number().min(1, 'Quantity must be at least 1'),
          quantityUnits: z.string().optional(),
        })
      )
      .min(1, 'At least one user is required'),
  }),
});

export type gemExciteAssignUserToRequestSchemaDto = z.infer<
  typeof gemExciteAssignUserToRequestSchema
>;
