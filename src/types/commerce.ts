import type { ID, ProductArt } from "./catalog";

export interface CustomizationValue {
  fieldId: string;
  label: string;
  value: string;
}

export interface CartItem {
  id: ID;
  kind: "product" | "kit";
  refId: ID;
  slug: string;
  name: string;
  variantId: string | null;
  variantLabel: string | null;
  /** Preço unitário cobrado (já com promoção/desconto). */
  unitPrice: number;
  /** Preço unitário de tabela (antes de promoção/desconto). */
  listPrice: number;
  quantity: number;
  customization: CustomizationValue[];
  notes: string;
  art: ProductArt;
  image: string | null;
}

export interface RequestCustomer {
  name: string;
  whatsapp: string;
  city: string;
  state: string;
  notes: string;
}

export interface RequestItem {
  name: string;
  kind: "product" | "kit";
  refId: ID;
  slug: string;
  variantLabel: string | null;
  unitPrice: number;
  listPrice: number;
  quantity: number;
  customization: CustomizationValue[];
  notes: string;
}

export interface CustomProject {
  idea: string;
  description: string;
  reference: string;
  photoName: string;
  dimensions: string;
  purpose: string;
  colors: string;
}

export type RequestStatus = "nova" | "em_analise" | "convertida" | "cancelada";

/** Solicitação NÃO é venda, faturamento nem pedido: não consome estoque nem libera produção. */
export interface RequestRecord {
  id: string;
  createdAt: string;
  status: RequestStatus;
  type: "carrinho" | "sob_medida";
  customer: RequestCustomer;
  items: RequestItem[];
  estimatedTotal: number;
  project: CustomProject | null;
  orderId: ID | null;
  internalNotes: string;
}

export interface Customer {
  id: ID;
  name: string;
  /** Somente dígitos; identificador principal (evita duplicidade). */
  whatsapp: string;
  city: string;
  state: string;
  notes: string;
  /** Somente quando necessário. */
  cpf: string;
  address: string;
  createdAt: string;
}

export type CommercialStatus = "aguardando_confirmacao" | "confirmado" | "cancelado";
export type PaymentStatus = "pendente" | "parcial" | "pago" | "estornado";
export type ProductionStatus =
  | "aguardando_producao"
  | "em_producao"
  | "em_acabamento"
  | "pronto";
export type DeliveryStatus = "aguardando" | "enviado" | "entregue";
export type DeliveryMode = "retirada" | "entrega_local" | "envio";
export type PaymentMethod = "pix" | "dinheiro" | "cartao" | "link" | "transferencia" | "outro";

export interface Payment {
  id: ID;
  date: string;
  method: PaymentMethod;
  amount: number;
  kind: "pagamento" | "estorno";
  note: string;
}

export type StepKey = "impressao" | "pintura" | "montagem" | "acabamento" | "embalagem";
export type StepState = "pendente" | "concluida" | "nao_se_aplica";

/** Snapshot histórico: alterar o produto depois não altera pedidos antigos. */
export interface OrderItem {
  id: ID;
  kind: "product" | "kit";
  refId: ID;
  name: string;
  variantLabel: string | null;
  unitPrice: number;
  listPrice: number;
  /** Custo estimado unitário no momento do pedido (null = não informado). */
  costSnapshot: number | null;
  quantity: number;
  /** Desconto total da linha (lista - cobrado) * quantidade. */
  discount: number;
  customization: CustomizationValue[];
  notes: string;
  /** Composição (kits) ou o próprio produto, para estoque e materiais. */
  components: { productId: ID; name: string; quantity: number }[];
}

export interface DistributionSnapshot {
  at: string;
  basis: number;
  participants: { name: string; percent: number; amount: number }[];
}

export interface Order {
  id: ID;
  code: string;
  createdAt: string;
  requestId: string | null;
  customerId: ID;
  customerSnapshot: { name: string; whatsapp: string; city: string; state: string };
  items: OrderItem[];
  orderDiscount: number;
  shipping: number;
  total: number;
  commercialStatus: CommercialStatus;
  paymentStatus: PaymentStatus;
  productionStatus: ProductionStatus;
  deliveryStatus: DeliveryStatus;
  deliveryMode: DeliveryMode;
  carrier: string;
  tracking: string;
  deadline: string | null;
  payments: Payment[];
  productionSteps: Record<StepKey, StepState>;
  productionException: { by: string; date: string; reason: string } | null;
  materialsConsumed: boolean;
  stockApplied: { productId: ID; quantity: number }[] | null;
  distribution: DistributionSnapshot | null;
  notes: string;
}
