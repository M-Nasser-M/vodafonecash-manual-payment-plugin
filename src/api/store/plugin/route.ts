import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createPaymentRequestWorkflow } from "../../../workflows"
import type { CreatePaymentRequestSchema } from "./middlewares"

const PROVIDER_ID = "vodafone-cash-manual"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  res.json({
    message: "Vodafone Cash Payment Provider",
    provider_id: PROVIDER_ID,
    supported_currencies: ["EGP"],
    phone_format: "010XXXXXXXX (11 digits starting with 010)",
  })
}

export async function POST(
  req: MedusaRequest<CreatePaymentRequestSchema>,
  res: MedusaResponse
) {
  const { phone_number, customer_name, amount, currency_code } =
    req.validatedBody

  const { result } = await createPaymentRequestWorkflow(req.scope).run({
    input: {
      provider_id: PROVIDER_ID,
      phone_number,
      customer_name,
      amount,
      currency_code,
    },
  })

  // Format phone number for display
  const formattedPhone = `${phone_number.slice(0, 4)} ${phone_number.slice(4, 7)} ${phone_number.slice(7)}`

  res.status(201).json({
    success: true,
    data: {
      id: result.id,
      provider_id: PROVIDER_ID,
      amount,
      currency_code,
      phone_number: formattedPhone,
      customer_name,
      status: result.status,
      created_at: result.created_at,
      payment_instructions: {
        message: `Please send ${amount} ${currency_code} via Vodafone Cash`,
        phone_number: formattedPhone,
        steps: [
          "Open your Vodafone Cash app or dial *9*",
          `Send ${amount} ${currency_code} to the merchant`,
          "Keep your transaction reference number",
          "Your order will be confirmed once payment is verified",
        ],
      },
    },
  })
}
