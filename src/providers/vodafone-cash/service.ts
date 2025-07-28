import { AbstractPaymentProvider } from "@medusajs/framework/utils";
import { Logger } from "@medusajs/framework/types";
import {
  CreatePaymentProviderSession,
  PaymentProviderError,
  PaymentProviderSessionResponse,
  PaymentSessionStatus,
  UpdatePaymentProviderSession,
  WebhookActionResult,
} from "@medusajs/framework/types";

type VodafoneCashOptions = {
  // Add any configuration options here
  debug?: boolean;
};

type InjectedDependencies = {
  logger: Logger;
};

interface VodafoneCashPaymentData {
  phone_number?: string;
  customer_name?: string;
}

class VodafoneCashProviderService extends AbstractPaymentProvider<VodafoneCashOptions> {
  static identifier = "vodafone-cash";
  protected logger_: Logger;
  protected options_: VodafoneCashOptions;

  constructor(container: InjectedDependencies, options: VodafoneCashOptions) {
    super(container, options);

    this.logger_ = container.logger;
    this.options_ = options;
  }

  /**
   * Validates Vodafone Cash phone number
   * Must start with 0100 and be exactly 11 digits
   */
  private validatePhoneNumber(phoneNumber: string): boolean {
    // Remove any spaces or special characters
    const cleanPhone = phoneNumber.replace(/\s+/g, "").replace(/[^\d]/g, "");

    // Check if it starts with 0100 and is exactly 11 digits
    const vodafonePattern = /^0100\d{7}$/;
    return vodafonePattern.test(cleanPhone);
  }

  /**
   * Format phone number for display
   */
  private formatPhoneNumber(phoneNumber: string): string {
    const cleanPhone = phoneNumber.replace(/\s+/g, "").replace(/[^\d]/g, "");
    // Format as 0100 XXX XXXX
    return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(
      4,
      7
    )} ${cleanPhone.slice(7)}`;
  }

  async initiatePayment(
    context: CreatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    try {
      const { amount, currency_code, context: paymentContext } = context;
      const paymentData =
        paymentContext.extra as unknown as VodafoneCashPaymentData;

      // Validate phone number
      if (!paymentData?.phone_number) {
        return {
          error: "Phone number is required for Vodafone Cash payment",
          code: "MISSING_PHONE_NUMBER",
          detail: "Please provide a valid Vodafone Cash phone number",
        };
      }

      if (!this.validatePhoneNumber(paymentData.phone_number)) {
        return {
          error: "Invalid Vodafone Cash phone number",
          code: "INVALID_PHONE_NUMBER",
          detail:
            "Phone number must start with 0100 and be exactly 11 digits (e.g., 01001234567)",
        };
      }

      const formattedPhone = this.formatPhoneNumber(paymentData.phone_number);

      this.logger_.info(
        `Vodafone Cash payment initiated for ${formattedPhone}, Amount: ${amount} ${currency_code}`
      );

      return {
        data: {
          id: `vodafone_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          amount,
          currency_code,
          phone_number: formattedPhone,
          status: "pending" as PaymentSessionStatus,
          payment_instructions: {
            message: `Please send ${amount} ${currency_code} to Vodafone Cash number: ${formattedPhone}`,
            steps: [
              "Open your Vodafone Cash app or dial *9*",
              `Send ${amount} ${currency_code} to the merchant`,
              "Keep your transaction reference number",
              "Your order will be confirmed once payment is verified",
            ],
          },
        },
      };
    } catch (error) {
      this.logger_.error("Error initiating Vodafone Cash payment:", error);
      return {
        error: "Failed to initiate payment",
        code: "PAYMENT_INITIATION_FAILED",
        detail: error.message,
      };
    }
  }

  async authorizePayment(
    paymentSessionData: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<
    | PaymentProviderError
    | {
        status: PaymentSessionStatus;
        data: PaymentProviderSessionResponse["data"];
      }
  > {
    try {
      // For manual payment, we set status to requires_more for manual verification
      return {
        status: "pending" as PaymentSessionStatus,
        data: {
          ...paymentSessionData,
          status: "pending" as PaymentSessionStatus,
          authorization_note: "Payment requires manual verification by admin",
        },
      };
    } catch (error) {
      this.logger_.error("Error authorizing Vodafone Cash payment:", error);
      return {
        error: "Authorization failed",
        code: "AUTHORIZATION_FAILED",
        detail: error.message,
      };
    }
  }

  async capturePayment(
    paymentData: Record<string, unknown>
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    try {
      // For manual verification, admin would trigger this after confirming payment
      this.logger_.info(`Capturing Vodafone Cash payment: ${paymentData.id}`);

      return {
        ...paymentData,
        status: "authorized" as PaymentSessionStatus,
        captured_at: new Date().toISOString(),
      };
    } catch (error) {
      this.logger_.error("Error capturing Vodafone Cash payment:", error);
      return {
        error: "Capture failed",
        code: "CAPTURE_FAILED",
        detail: error.message,
      };
    }
  }

  async refundPayment(
    paymentData: Record<string, unknown>,
    refundAmount: number
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    try {
      this.logger_.info(
        `Refunding Vodafone Cash payment: ${paymentData.id}, Amount: ${refundAmount}`
      );

      return {
        ...paymentData,
        refund_amount: refundAmount,
        refunded_at: new Date().toISOString(),
        refund_note:
          "Manual refund - please process through Vodafone Cash system",
      };
    } catch (error) {
      this.logger_.error("Error processing Vodafone Cash refund:", error);
      return {
        error: "Refund failed",
        code: "REFUND_FAILED",
        detail: error.message,
      };
    }
  }

  async cancelPayment(
    paymentData: Record<string, unknown>
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    try {
      this.logger_.info(`Cancelling Vodafone Cash payment: ${paymentData.id}`);

      return {
        ...paymentData,
        status: "canceled" as PaymentSessionStatus,
        canceled_at: new Date().toISOString(),
      };
    } catch (error) {
      this.logger_.error("Error cancelling Vodafone Cash payment:", error);
      return {
        error: "Cancellation failed",
        code: "CANCELLATION_FAILED",
        detail: error.message,
      };
    }
  }

  async deletePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    try {
      this.logger_.info(
        `Deleting Vodafone Cash payment session: ${paymentSessionData.id}`
      );
      return paymentSessionData;
    } catch (error) {
      this.logger_.error("Error deleting Vodafone Cash payment:", error);
      return {
        error: "Deletion failed",
        code: "DELETION_FAILED",
        detail: error.message,
      };
    }
  }

  async getPaymentStatus(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentSessionStatus> {
    // For manual payment, return the current status
    return (
      (paymentSessionData.status as PaymentSessionStatus) ||
      ("pending" as PaymentSessionStatus)
    );
  }

  async retrievePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    try {
      return paymentSessionData;
    } catch (error) {
      this.logger_.error("Error retrieving Vodafone Cash payment:", error);
      return {
        error: "Retrieval failed",
        code: "RETRIEVAL_FAILED",
        detail: error.message,
      };
    }
  }

  async updatePayment(
    context: UpdatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    try {
      const { data, context: paymentContext } = context;
      const paymentData =
        paymentContext.extra as unknown as VodafoneCashPaymentData;

      // If phone number is being updated, validate it
      if (paymentData?.phone_number) {
        if (!this.validatePhoneNumber(paymentData.phone_number)) {
          return {
            error: "Invalid Vodafone Cash phone number",
            code: "INVALID_PHONE_NUMBER",
            detail:
              "Phone number must start with 0100 and be exactly 11 digits (e.g., 01001234567)",
          };
        }

        const formattedPhone = this.formatPhoneNumber(paymentData.phone_number);
        data.phone_number = formattedPhone;
      }

      return {
        data: {
          ...data,
          updated_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger_.error("Error updating Vodafone Cash payment:", error);
      return {
        error: "Update failed",
        code: "UPDATE_FAILED",
        detail: error.message,
      };
    }
  }

  async getWebhookActionAndData(
    webhookData: Record<string, unknown>
  ): Promise<WebhookActionResult> {
    // For manual payment provider, webhooks are not typically used
    // This would be implemented if Vodafone Cash provided webhook notifications
    return {
      action: "not_supported",
    };
  }
}

export default VodafoneCashProviderService;
