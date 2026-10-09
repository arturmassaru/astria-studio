"use client";

import type { RequestCustomer } from "@/types";
import { BR_STATES, SelectField, TextAreaField, TextField } from "@/components/ui/fields";
import type { CustomerErrors } from "@/lib/validation";

export function CustomerFields({
  values,
  errors,
  onChange,
  idPrefix,
}: {
  values: RequestCustomer;
  errors: CustomerErrors;
  onChange: (key: keyof RequestCustomer, value: string) => void;
  idPrefix: string;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <TextField
          id={`${idPrefix}-nome`}
          label="Nome"
          required
          autoComplete="name"
          value={values.name}
          error={errors.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </div>
      <TextField
        id={`${idPrefix}-whatsapp`}
        label="WhatsApp"
        required
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="(31) 99999-9999"
        value={values.whatsapp}
        error={errors.whatsapp}
        onChange={(e) => onChange("whatsapp", e.target.value)}
      />
      <TextField
        id={`${idPrefix}-cidade`}
        label="Cidade"
        required
        autoComplete="address-level2"
        value={values.city}
        error={errors.city}
        onChange={(e) => onChange("city", e.target.value)}
      />
      <SelectField
        id={`${idPrefix}-estado`}
        label="Estado"
        required
        value={values.state}
        error={errors.state}
        onChange={(e) => onChange("state", e.target.value)}
      >
        <option value="">Selecione</option>
        {BR_STATES.map((uf) => (
          <option key={uf} value={uf}>
            {uf}
          </option>
        ))}
      </SelectField>
      <div className="sm:col-span-2">
        <TextAreaField
          id={`${idPrefix}-obs`}
          label="Observações (opcional)"
          rows={3}
          value={values.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          help="Endereço completo e CPF só serão pedidos se forem necessários, depois da confirmação."
        />
      </div>
    </div>
  );
}
