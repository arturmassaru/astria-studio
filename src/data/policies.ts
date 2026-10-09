export interface PolicyPageData {
  slug: string;
  title: string;
  description: string;
  /** Seções a serem preenchidas pela Astria (conteúdo jurídico não é inventado aqui). */
  sections: { heading: string; body: string }[];
}

const placeholder = "Conteúdo a ser inserido pela Astria Studio.";

export const policyPages: PolicyPageData[] = [
  {
    slug: "privacidade",
    title: "Privacidade",
    description: "Como a Astria Studio trata os dados pessoais.",
    sections: [
      { heading: "Quais dados coletamos", body: placeholder },
      { heading: "Como usamos os dados", body: placeholder },
      { heading: "Seus direitos", body: placeholder },
      { heading: "Contato", body: placeholder },
    ],
  },
  {
    slug: "termos",
    title: "Termos",
    description: "Termos de uso do site da Astria Studio.",
    sections: [
      { heading: "Uso do site", body: placeholder },
      { heading: "Solicitações e pedidos", body: placeholder },
      { heading: "Propriedade intelectual", body: placeholder },
    ],
  },
  {
    slug: "entrega",
    title: "Entrega",
    description: "Modalidades, prazos e condições de entrega.",
    sections: [
      { heading: "Retirada", body: placeholder },
      { heading: "Entrega local", body: placeholder },
      { heading: "Envio", body: placeholder },
    ],
  },
  {
    slug: "trocas-e-cancelamentos",
    title: "Trocas e cancelamentos",
    description: "Condições para trocas, devoluções e cancelamentos.",
    sections: [
      { heading: "Trocas", body: placeholder },
      { heading: "Cancelamentos", body: placeholder },
      { heading: "Peças personalizadas", body: placeholder },
    ],
  },
];
