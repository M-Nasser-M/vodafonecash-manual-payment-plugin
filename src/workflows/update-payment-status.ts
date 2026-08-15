import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updatePaymentStatusStep } from "./steps/update-payment-status"

export type UpdatePaymentStatusWorkflowInput = {
  payment_id: string
  status: "pending" | "verified" | "failed" | "refunded" | "canceled"
  transaction_reference?: string
  admin_notes?: string
}

export const updatePaymentStatusWorkflow = createWorkflow(
  "update-payment-status",
  function (input: UpdatePaymentStatusWorkflowInput) {
    const paymentRequest = updatePaymentStatusStep(input)

    return new WorkflowResponse(paymentRequest)
  }
)
