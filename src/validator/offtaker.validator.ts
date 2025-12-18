import z from 'zod';
import { OrderType } from '@/interfaces/type';

export const offtakerOnboardingSchema = z.object({
  body: z.object({
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string(),
    companyName: z.string(),
    companyCountry: z.string(),
    companyPosition: z.string(),
    companyEmployeeCount: z.string(),
    companyAddress: z.string(),
    companyState: z.string(),
    companyCity: z.string(),
    companyZipCode: z.string(),
    companyWebsite: z.string(),
    preferredProducts: z.array(z.string()).optional(),
    preferredUnitsOfMeasurement: z.string().optional(),
    preferredCurrency: z.string().optional(),
  }),
});

export type offtakerOnboardingDto = z.infer<typeof offtakerOnboardingSchema>;

export const offtakerCheckoutSchema = z.object({
  body: z.object({
    clusters: z.array(
      z.object({
        clusterId: z.string(),
        quantity: z.number(),
      })
    ),
    storages: z.array(
      z.object({
        warehouseId: z.string(),
        quantity: z.number(),
        pricePerTonne: z.number(),
      })
    ).optional(),
    selectedWarehouse: z.object({
      warehouseId: z.string(),
      warehouseType: z.string(),
    }),
    orderType: z.enum([OrderType.ORDER, OrderType.PREORDER]),

    EDD: z.date(),
  }),
});

export type offtakerCheckoutDto = z.infer<typeof offtakerCheckoutSchema>;

export const getOrderSchema = z.object({
  params: z.object({
    orderId: z.string(),
  }),
});

export type getOrderDto = z.infer<typeof getOrderSchema>;
