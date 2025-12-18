import { WarehouseType } from '@/interfaces/type';
import z from 'zod';

export const createWarehouseSchema = z.object({
  body: z.object({
    type: z.nativeEnum(WarehouseType),
    name: z.string(),
    location: z.string(),
  }),
});

export type createWarehouseDto = z.infer<typeof createWarehouseSchema>;

export const updateWarehouseSchema = z.object({
  params: z.object({
    warehouseId: z.string(),
  }),
  body: z.object({
    type: z.nativeEnum(WarehouseType).optional(),
    name: z.string().optional(),
    location: z.string().optional(),
  }),
});

export type updateWarehouseDto = z.infer<typeof updateWarehouseSchema>;

export const deleteWarehouseSchema = z.object({
  params: z.object({
    warehouseId: z.string(),
  }),
});

export const getWarehousesSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    page: z.number().optional(),
    location: z.string().optional(),
    limit: z.number().optional(),
    type: z.nativeEnum(WarehouseType).optional(),
  }),
});

export type getWarehousesDto = z.infer<typeof getWarehousesSchema>;

export const getWarehouseSchema = z.object({
  params: z.object({
    warehouseId: z.string(),
  }),
});

export type getWarehouseDto = z.infer<typeof getWarehouseSchema>;
