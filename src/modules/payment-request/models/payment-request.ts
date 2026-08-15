import { model } from "@medusajs/framework/utils"

const PaymentRequest = model.define("payment_request", {
  id: model.id({ prefix: "payreq" }).primaryKey(),
  provider_id: model.text(),
  amount: model.bigNumber(),
  currency_code: model.text(),
  phone_number: model.text(),
  customer_name: model.text().nullable(),
  status: model
    .enum(["pending", "verified", "failed", "refunded", "canceled"])
    .default("pending"),
  transaction_reference: model.text().nullable(),
  admin_notes: model.text().nullable(),
})

export default PaymentRequest
