import {
  authenticate,
  MiddlewareRoute,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

export const verifyPaymentSchema = z.object({
  payment_id: z.string().min(1, "Payment ID is required"),
  transaction_reference: z.string().optional(),
  verified: z.boolean(),
  admin_notes: z.string().optional(),
})

export type VerifyPaymentSchema = z.infer<typeof verifyPaymentSchema>

export const updatePaymentStatusSchema = z.object({
  payment_id: z.string().min(1, "Payment ID is required"),
  status: z.enum(["pending", "verified", "failed", "refunded", "canceled"]),
  transaction_reference: z.string().optional(),
  admin_notes: z.string().optional(),
})

export type UpdatePaymentStatusSchema = z.infer<
  typeof updatePaymentStatusSchema
>

export const listPaymentRequestsQuerySchema = z.object({
  status: z
    .enum(["pending", "verified", "failed", "refunded", "canceled"])
    .optional(),
  limit: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(1).max(100).default(50)
  ),
  offset: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(0).default(0)
  ),
})

export type ListPaymentRequestsQuerySchema = z.infer<
  typeof listPaymentRequestsQuerySchema
>

export const adminPluginMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/plugin",
    method: "GET",
    middlewares: [
      authenticate("user", ["session", "bearer"]),
      validateAndTransformQuery(listPaymentRequestsQuerySchema, {}),
    ],
  },
  {
    matcher: "/admin/plugin",
    method: "POST",
    middlewares: [
      authenticate("user", ["session", "bearer"]),
      validateAndTransformBody(verifyPaymentSchema),
    ],
  },
  {
    matcher: "/admin/plugin/update-status",
    method: "POST",
    middlewares: [
      authenticate("user", ["session", "bearer"]),
      validateAndTransformBody(updatePaymentStatusSchema),
    ],
  },
]
