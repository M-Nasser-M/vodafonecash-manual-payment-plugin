import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import { VodafoneCashManualProvider } from "./services";

const services = [VodafoneCashManualProvider];

export default ModuleProvider(Modules.PAYMENT, {
  services,
});
