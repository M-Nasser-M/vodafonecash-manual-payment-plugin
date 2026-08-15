import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PAYMENT_REQUEST_MODULE } from "../../modules/payment-request"
import PaymentRequestModuleService from "../../modules/payment-request/service"

export type CreatePaymentRequestStepInput = {
  provider_id: string
  amount: number
  currency_code: string
  phone_number: string
  customer_name?: string
}

export const createPaymentRequestStep = createStep(
  "create-payment-request",
  async (
    input: CreatePaymentRequestStepInput,
    { container }
  ) => {
    const moduleService: PaymentRequestModuleService = container.resolve(
      PAYMENT_REQUEST_MODULE
    )
    const paymentRequest = await moduleService.createPaymentRequests(input)

    return new StepResponse(paymentRequest, paymentRequest.id)
  },
  async (id: string, { container }) => {
    const moduleService: PaymentRequestModuleService = container.resolve(
      PAYMENT_REQUEST_MODULE
    )
    await moduleService.deletePaymentRequests(id)
  }
)
