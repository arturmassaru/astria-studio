"use client";

import { useState } from "react";
import type { CustomProject, RequestCustomer, RequestRecord } from "@/types";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/primitives";
import { TextAreaField, TextField } from "@/components/ui/fields";
import { submitRequest } from "@/lib/domain/actions";
import { emptyCustomer, validateCustomer, type CustomerErrors } from "@/lib/validation";
import { CustomerFields } from "./CustomerFields";
import { requestWhatsappUrl } from "@/lib/whatsapp";
import { RequestSuccess } from "./RequestSuccess";

const emptyProject: CustomProject = {
  idea: "",
  description: "",
  reference: "",
  photoName: "",
  dimensions: "",
  purpose: "",
  colors: "",
};

/** Projeto sob medida: nunca calcula preço automaticamente. */
export function CustomProjectForm() {
  const [project, setProject] = useState<CustomProject>(emptyProject);
  const [customer, setCustomer] = useState<RequestCustomer>(emptyCustomer);
  const [projectErrors, setProjectErrors] = useState<{ idea?: string; description?: string }>({});
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [record, setRecord] = useState<RequestRecord | null>(null);

  if (record) return <RequestSuccess record={record} />;

  const setField = (key: keyof CustomProject, value: string) =>
    setProject((prev) => ({ ...prev, [key]: value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pe: { idea?: string; description?: string } = {};
    if (project.idea.trim().length < 3) pe.idea = "Conte sua ideia em poucas palavras.";
    if (project.description.trim().length < 10) pe.description = "Descreva um pouco mais, para entendermos melhor.";
    const ce = validateCustomer(customer);
    setProjectErrors(pe);
    setErrors(ce);
    if (Object.keys(pe).length > 0 || Object.keys(ce).length > 0) return;

    const created = submitRequest({
      customer: {
        name: customer.name.trim(),
        whatsapp: customer.whatsapp.trim(),
        city: customer.city.trim(),
        state: customer.state,
        notes: customer.notes.trim(),
      },
      items: [],
      project: {
        idea: project.idea.trim(),
        description: project.description.trim(),
        reference: project.reference.trim(),
        photoName: project.photoName,
        dimensions: project.dimensions.trim(),
        purpose: project.purpose.trim(),
        colors: project.colors.trim(),
      },
    });
    // Abre o WhatsApp da Astria já com a mensagem pronta (dentro do clique do cliente, para não ser bloqueado).
    window.open(requestWhatsappUrl(created), "_blank", "noopener,noreferrer");
    setRecord(created);
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Projeto sob medida" className="space-y-12">
      <fieldset className="space-y-5">
        <legend className="mb-2 font-serif text-2xl font-light">Sua ideia</legend>
        <TextField
          id="proj-ideia"
          label="Qual é a ideia?"
          required
          placeholder="Ex.: um porta-chaves com o formato da nossa casa"
          value={project.idea}
          error={projectErrors.idea}
          onChange={(e) => setField("idea", e.target.value)}
        />
        <TextAreaField
          id="proj-descricao"
          label="Descrição"
          required
          rows={5}
          value={project.description}
          error={projectErrors.description}
          onChange={(e) => setField("description", e.target.value)}
          help="Conte como imagina a peça, onde vai ficar e o que é importante para você."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="proj-dimensoes"
            label="Dimensões aproximadas"
            placeholder="Ex.: 10 cm de altura"
            value={project.dimensions}
            onChange={(e) => setField("dimensions", e.target.value)}
          />
          <TextField
            id="proj-finalidade"
            label="Finalidade"
            placeholder="Ex.: presente de aniversário"
            value={project.purpose}
            onChange={(e) => setField("purpose", e.target.value)}
          />
          <TextField
            id="proj-cores"
            label="Cores"
            placeholder="Ex.: off-white e dourado"
            value={project.colors}
            onChange={(e) => setField("colors", e.target.value)}
          />
          <TextField
            id="proj-referencia"
            label="Referência (link ou descrição)"
            placeholder="Link de uma imagem ou perfil"
            value={project.reference}
            onChange={(e) => setField("reference", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="proj-foto" className="mb-1.5 block text-sm font-medium">
            Foto de referência (opcional)
          </label>
          <input
            id="proj-foto"
            type="file"
            accept="image/*"
            onChange={(e) => setField("photoName", e.target.files?.[0]?.name ?? "")}
            className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-sand file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-stone/70"
          />
          <p className="mt-1.5 text-xs text-muted">
            O arquivo não é enviado por este formulário: guardamos só o nome e você manda a foto pelo
            WhatsApp, junto com a mensagem.
          </p>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-6 font-serif text-2xl font-light">Seus dados</legend>
        <CustomerFields
          idPrefix="proj"
          values={customer}
          errors={errors}
          onChange={(key, value) => setCustomer((prev) => ({ ...prev, [key]: value }))}
        />
      </fieldset>

      <div>
        <Button type="submit" size="lg">
          Enviar minha ideia
        </Button>
        <Notice className="mt-6 max-w-xl">
          Projetos sob medida não têm preço automático. A Astria analisa a ideia e combina valor e
          prazo com você antes de qualquer confirmação.
        </Notice>
      </div>
    </form>
  );
}
