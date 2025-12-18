import z from 'zod';

export const createClusterSchema = z.object({
  body: z.object({
    name: z.string(),
    type:z.string(),
    description: z.string().optional(),
    commodityName: z.string(),
    location: z.string(),
    // createdBy: z.string(),
    clusterCode:z.string().optional()
  }),
});

export type createClusterDto = z.infer<typeof createClusterSchema>;

export const updateClusterSchema = z.object({
  params: z.object({
    clusterId: z.string(),
  }),
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    commodityName: z.string().optional(),
    location:z.string().optional(),
    quantityRequested: z.array(z.object({value:z.number(),orderID:z.string()})).optional(),
    gemExciteAssigned: z.object({
      assigned: z.boolean().optional(),
      name: z.string().optional(),
      id: z.string().optional(),
    }).optional(),
    producers: z.array(z.object({id:z.string(),name:z.string(),type:z.string(),productionCapacity: z.number()})).optional(),
  }),
});

export type updateClusterDto = z.infer<typeof updateClusterSchema>;

export const getClustersSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    page: z.number().optional(),
    order: z.enum(['lowest', 'highest', 'toprated', 'newest']).optional(),
    price: z.string().optional(),
    rating: z.string().optional(),
    location: z.string().optional(),
    limit: z.number().optional(),
    commodity: z.string().optional(),
  }),
});

export type getClustersDto = z.infer<typeof getClustersSchema>;

export const getClusterSchema = z.object({
  params: z.object({
    clusterId: z.string(),
  }),
});

export type getClusterDto = z.infer<typeof getClusterSchema>;
