import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PAYMENT_REQUEST_MODULE } from "../../../modules/payment-request"
import PaymentRequestModuleService from "../../../modules/payment-request/service"
import { updatePaymentStatusWorkflow } from "../../../workflows"
import type {
  ListPaymentRequestsQuerySchema,
  VerifyPaymentSchema,
} from "./middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest<ListPaymentRequestsQuerySchema>,
  res: MedusaResponse
) {
  const { status, limit, offset } = req.validatedQuery

  const moduleService: PaymentRequestModuleService = req.scope.resolve(
    PAYMENT_REQUEST_MODULE
  )

  const [payments, count] = await moduleService.listAndCountPaymentRequests(
    status ? { status } : {},
    { take: limit, skip: offset, order: { created_at: "DESC" } }
  )

  res.json({
    success: true,
    data: payments,
    count,
    offset,
    limit,
  })
}

// Verify a Vodafone Cash payment
export async function POST(
  req: AuthenticatedMedusaRequest<VerifyPaymentSchema>,
  res: MedusaResponse
) {
  const { payment_id, transaction_reference, verified, admin_notes } =
    req.validatedBody

  const { result } = await updatePaymentStatusWorkflow(req.scope).run({
    input: {
      payment_id,
      status: verified ? "verified" : "failed",
      transaction_reference,
      admin_notes,
    },
  })

  res.json({
    success: true,
    message: `Payment ${verified ? "verified" : "marked as failed"}`,
    data: result,
  })
}
