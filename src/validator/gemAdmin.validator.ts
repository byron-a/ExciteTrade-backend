import z from "zod";
import { UserType } from "@/interfaces/type";

export const registerStaffSchema = z.object({
  body: z.object({
    phoneNumber: z.string(),
    email: z.string().email(),
    password: z.string().min(8, "Password must be a minimum of eight characters"),
    userType: z.enum([UserType.GEMEXCITE, UserType.STOREKEEPER])
  })
});

export type registerStaffDTO = z.infer<typeof registerStaffSchema>;

export const getUsersSchema = z.object({
  query: z.object({
    // id: z.string().optional(),
    userType: z.array(z.string())
  }),
});

export type getAllUserDTO = z.infer<typeof getUsersSchema>
