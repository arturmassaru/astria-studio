import type { AdminUser, Settings } from "@/types";

/**
 * Valores iniciais intencionalmente vazios: tarifa de energia e margem global
 * são decisões do negócio e nunca devem ser fixadas em código.
 */
export const settingsSeed: Settings = {
  businessName: "Astria Studio",
  whatsapp: "",
  energyTariffPerKwh: null,
  globalMarginPercent: null,
  lossPercent: 0,
  participants: [],
};

export const usersSeed: AdminUser[] = [];
