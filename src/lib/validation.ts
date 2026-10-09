import type { RequestCustomer } from "@/types";
import { onlyDigits } from "./utils";

export type CustomerErrors = Partial<Record<keyof RequestCustomer, string>>;

export const emptyCustomer: RequestCustomer = {
  name: "",
  whatsapp: "",
  city: "",
  state: "",
  notes: "",
};

/** Na solicitação pedimos apenas o essencial: sem CPF e sem endereço completo. */
export function validateCustomer(c: RequestCustomer): CustomerErrors {
  const errors: CustomerErrors = {};
  if (c.name.trim().length < 2) errors.name = "Informe seu nome.";
  const digits = onlyDigits(c.whatsapp);
  if (digits.length < 10 || digits.length > 13) errors.whatsapp = "Informe um WhatsApp com DDD.";
  if (!c.city.trim()) errors.city = "Informe sua cidade.";
  if (!c.state) errors.state = "Selecione o estado.";
  return errors;
}
