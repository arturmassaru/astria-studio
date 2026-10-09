import type { FaqCategory, FaqItem } from "@/types";

export const faqCategories: FaqCategory[] = [
  "Como comprar",
  "Personalizados",
  "Produção e prazo",
  "Entrega",
  "Pagamento",
  "Trocas e cancelamentos",
  "Sobre a Astria",
];

/**
 * Respostas propositalmente gerais: valores, prazos e condições definitivas
 * devem ser revisados e inseridos pela Astria antes da publicação.
 */
export const faqSeed: FaqItem[] = [
  { id: "faq_1", category: "Como comprar", sortOrder: 1, question: "Como funciona a compra?", answer: "Você escolhe as peças, monta o carrinho e envia uma solicitação com seus dados básicos. A mensagem segue para o nosso WhatsApp, onde conferimos tudo com você. O pedido só é oficial depois da confirmação." },
  { id: "faq_2", category: "Como comprar", sortOrder: 2, question: "Enviar a solicitação já é uma compra?", answer: "Não. A solicitação é um pedido de conversa: não gera cobrança, não reserva estoque e não inicia a produção. Ela vira pedido quando combinamos tudo e confirmamos." },
  { id: "faq_3", category: "Personalizados", sortOrder: 1, question: "O que posso personalizar?", answer: "Depende da peça: alguns produtos aceitam nome, frase curta, cor ou modelo. Os campos disponíveis aparecem na página de cada produto." },
  { id: "faq_4", category: "Personalizados", sortOrder: 2, question: "Posso pedir uma peça que não existe no site?", answer: "Pode. Na página Personalizados você conta a ideia, e a Astria ajuda a dar forma. Projetos sob medida não têm preço automático: analisamos e combinamos com você." },
  { id: "faq_5", category: "Produção e prazo", sortOrder: 1, question: "Quanto tempo leva para ficar pronto?", answer: "Cada peça tem um tempo estimado de produção, mostrado na página do produto. O prazo final é definido na confirmação do pedido." },
  { id: "faq_6", category: "Entrega", sortOrder: 1, question: "Quais são as formas de receber?", answer: "Retirada, entrega local ou envio. As condições e o valor do frete são combinados na confirmação." },
  { id: "faq_7", category: "Pagamento", sortOrder: 1, question: "Como é feito o pagamento?", answer: "Por enquanto o pagamento é combinado diretamente conosco: Pix, dinheiro, cartão, link de pagamento ou transferência." },
  { id: "faq_8", category: "Trocas e cancelamentos", sortOrder: 1, question: "Posso trocar ou cancelar?", answer: "As condições completas estão na página Trocas e cancelamentos. Em caso de dúvida, fale com a gente pelo WhatsApp." },
  { id: "faq_9", category: "Sobre a Astria", sortOrder: 1, question: "O que é a Astria Studio?", answer: "Uma marca criativa que transforma ideias em objetos: peças decorativas, objetos úteis, presentes, kits e projetos personalizados." },
];
