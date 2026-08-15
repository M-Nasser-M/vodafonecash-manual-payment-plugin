import * as z from "@medusajs/framework/zod";

export const phoneNumberSchema = z
  .string({
    error: "Phone number is required",
  })
  .length(11, "Phone number must be 11 digits")
  .startsWith("010", "Phone number must start with 010")
  .regex(/^\d+$/, "Phone number must contain only digits (0–9)");

export type PhoneNumber = z.infer<typeof phoneNumberSchema>;
