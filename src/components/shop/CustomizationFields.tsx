"use client";

import type { CustomizationField } from "@/types";
import { SelectField, TextAreaField, TextField } from "@/components/ui/fields";

export function CustomizationFields({
  fields,
  values,
  errors,
  onChange,
}: {
  fields: CustomizationField[];
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (id: string, value: string) => void;
}) {
  if (fields.length === 0) return null;
  return (
    <fieldset className="space-y-5">
      <legend className="mb-1 font-serif text-xl font-light">Personalize</legend>
      {fields.map((f) => {
        const id = `pers-${f.id}`;
        const value = values[f.id] ?? "";
        const common = { id, label: f.label, help: f.help, error: errors[f.id], required: f.required };

        if (f.type === "notes") {
          return (
            <TextAreaField
              key={f.id}
              {...common}
              rows={3}
              value={value}
              maxLength={f.maxLength}
              onChange={(e) => onChange(f.id, e.target.value)}
            />
          );
        }
        if (f.type === "upload") {
          return (
            <div key={f.id}>
              <TextField
                {...common}
                type="file"
                accept="image/*,.pdf"
                help={f.help ?? "O arquivo não é enviado pelo site: guardamos o nome e você envia pelo WhatsApp."}
                onChange={(e) => onChange(f.id, e.target.files?.[0]?.name ?? "")}
              />
            </div>
          );
        }
        if (f.options.length > 0) {
          return (
            <SelectField
              key={f.id}
              {...common}
              value={value}
              onChange={(e) => onChange(f.id, e.target.value)}
            >
              <option value="">Selecione</option>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </SelectField>
          );
        }
        return (
          <TextField
            key={f.id}
            {...common}
            value={value}
            maxLength={f.maxLength}
            onChange={(e) => onChange(f.id, e.target.value)}
          />
        );
      })}
    </fieldset>
  );
}
