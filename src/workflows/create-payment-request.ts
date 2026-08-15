import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createPaymentRequestStep } from "./steps/create-payment-request"

export type CreatePaymentRequestWorkflowInput = {
  provider_id: string
  amount: number
  currency_code: string
  phone_number: string
  customer_name?: string
}

export const createPaymentRequestWorkflow = createWorkflow(
  "create-payment-request",
  function (input: CreatePaymentRequestWorkflowInput) {
    const paymentRequest = createPaymentRequestStep(input)

    return new WorkflowResponse(paymentRequest)
  }
)
