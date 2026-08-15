import VodafoneCashManualBase from "../core/vodafone-cash-manual-base";

class VodafoneCashManualProvider extends VodafoneCashManualBase {
  static identifier = "vodafone-cash-manual";

  constructor(
    container: Record<string, unknown>,
    options: Record<string, unknown>
  ) {
    super(container, options);
  }
}

export default VodafoneCashManualProvider;
