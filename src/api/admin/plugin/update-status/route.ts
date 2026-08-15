import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { updatePaymentStatusWorkflow } from "../../../../workflows"
import type { UpdatePaymentStatusSchema } from "../middlewares"

// Update payment status
export async function POST(
  req: AuthenticatedMedusaRequest<UpdatePaymentStatusSchema>,
  res: MedusaResponse
) {
  const { payment_id, status, transaction_reference, admin_notes } =
    req.validatedBody

  const { result } = await updatePaymentStatusWorkflow(req.scope).run({
    input: { payment_id, status, transaction_reference, admin_notes },
  })

  res.json({
    success: true,
    message: `Payment status updated to ${status}`,
    data: result,
  })
}
