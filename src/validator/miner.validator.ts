import z from 'zod';

export const onboardingSchema = z.object({
  body: z.object({
    firstName: z.string(),
    lastName: z.string(),
    mineName: z.string(),
    clusterId: z.string(),
    mineLocation: z.string(),
    commodityName: z.string(),
    commodityProductionCapacity: z.number(),
  }),
});

export type onboardingSchemaDto = z.infer<typeof onboardingSchema>;

export const uploadCommoditySchema = z.object({
  body: z.object({
    commodity: z.string(),
    pricePerTonne: z.number(),
    quantity: z.number(),
    weight: z.number(),
    warehouse: z.string(),
    request: z.string(),
  }),
});

export type uploadCommodityDto = z.infer<typeof uploadCommoditySchema>;

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    mineName: z.string().optional(),
    clusterId: z.string().optional(),
    mineLocation: z.string().optional(),
    commodityName: z.string().optional(),
    commodityProductionCapacity: z.number().optional(),
  }),
});

export type updateProfileSchemaDto = z.infer<typeof updateProfileSchema>;
