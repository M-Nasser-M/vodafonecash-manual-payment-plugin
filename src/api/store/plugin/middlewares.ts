import {
  MiddlewareRoute,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

export const createPaymentRequestSchema = z.object({
  phone_number: z
    .string()
    .transform((phone) => phone.replace(/\s+/g, "").replace(/[^\d]/g, ""))
    .refine((phone) => /^010\d{8}$/.test(phone), {
      message: "Phone number must start with 010 and be exactly 11 digits",
    }),
  customer_name: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  currency_code: z.string().default("EGP"),
})

export type CreatePaymentRequestSchema = z.infer<
  typeof createPaymentRequestSchema
>

export const storePluginMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/plugin",
    method: "POST",
    middlewares: [validateAndTransformBody(createPaymentRequestSchema)],
  },
]
