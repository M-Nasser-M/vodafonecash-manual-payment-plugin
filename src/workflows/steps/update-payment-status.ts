import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { PAYMENT_REQUEST_MODULE } from "../../modules/payment-request"
import PaymentRequestModuleService from "../../modules/payment-request/service"

export const PAYMENT_REQUEST_STATUSES = [
  "pending",
  "verified",
  "failed",
  "refunded",
  "canceled",
] as const

export type PaymentRequestStatus = (typeof PAYMENT_REQUEST_STATUSES)[number]

export type UpdatePaymentStatusStepInput = {
  payment_id: string
  status: PaymentRequestStatus
  transaction_reference?: string
  admin_notes?: string
}

const ALLOWED_TRANSITIONS: Record<PaymentRequestStatus, PaymentRequestStatus[]> = {
  pending: ["verified", "failed", "canceled"],
  verified: ["refunded"],
  failed: [],
  refunded: [],
  canceled: [],
}

export const updatePaymentStatusStep = createStep(
  "update-payment-status",
  async (
    input: UpdatePaymentStatusStepInput,
    { container }
  ) => {
    const moduleService: PaymentRequestModuleService = container.resolve(
      PAYMENT_REQUEST_MODULE
    )
    const existing = await moduleService.retrievePaymentRequest(
      input.payment_id
    )

    if (!ALLOWED_TRANSITIONS[existing.status].includes(input.status)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot transition payment request ${existing.status} -> ${input.status}`
      )
    }

    const updated = await moduleService.updatePaymentRequests({
      id: input.payment_id,
      status: input.status,
      transaction_reference: input.transaction_reference ?? null,
      admin_notes: input.admin_notes ?? null,
    })

    return new StepResponse(updated, {
      id: input.payment_id,
      previousStatus: existing.status,
    })
  },
  async (
    compensation: { id: string; previousStatus: PaymentRequestStatus },
    { container }
  ) => {
    const moduleService: PaymentRequestModuleService = container.resolve(
      PAYMENT_REQUEST_MODULE
    )
    await moduleService.updatePaymentRequests({
      id: compensation.id,
      status: compensation.previousStatus,
    })
  }
)
