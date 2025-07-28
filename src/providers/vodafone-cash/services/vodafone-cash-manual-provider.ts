import VodafoneCashManualBase from "../core/vodafone-cash-manual-base";

class VodafoneCashManualProvider extends VodafoneCashManualBase {
  static identifier = "vodafone-cash-manual";

  constructor(_, options) {
    super(_, options);
  }
  get paymentOptions(): PaymentOptions {
    return {};
  }
}

export default VodafoneCashManualProvider;
