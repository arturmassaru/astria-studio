import type {
  CommercialStatus,
  DeliveryMode,
  DeliveryStatus,
  ExpenseCategory,
  LossReason,
  MaterialKind,
  MaterialMovementType,
  PaymentMethod,
  PaymentStatus,
  ProductionStatus,
  RequestStatus,
  StepKey,
  StepState,
  Unit,
} from "@/types";

export type Tone = "neutral" | "ok" | "warn" | "info" | "danger" | "gold";

export const COMMERCIAL_LABELS: Record<CommercialStatus, string> = {
  aguardando_confirmacao: "Aguardando confirmação",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
};
export const COMMERCIAL_TONES: Record<CommercialStatus, Tone> = {
  aguardando_confirmacao: "warn",
  confirmado: "ok",
  cancelado: "danger",
};

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pendente: "Pendente",
  parcial: "Parcial",
  pago: "Pago",
  estornado: "Estornado",
};
export const PAYMENT_TONES: Record<PaymentStatus, Tone> = {
  pendente: "warn",
  parcial: "info",
  pago: "ok",
  estornado: "danger",
};

export const PRODUCTION_LABELS: Record<ProductionStatus, string> = {
  aguardando_producao: "Aguardando produção",
  em_producao: "Em produção",
  em_acabamento: "Em acabamento",
  pronto: "Pronto",
};
export const PRODUCTION_TONES: Record<ProductionStatus, Tone> = {
  aguardando_producao: "neutral",
  em_producao: "info",
  em_acabamento: "gold",
  pronto: "ok",
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  aguardando: "Aguardando",
  enviado: "Enviado",
  entregue: "Entregue",
};
export const DELIVERY_MODE_LABELS: Record<DeliveryMode, string> = {
  retirada: "Retirada",
  entrega_local: "Entrega local",
  envio: "Envio",
};

export const REQUEST_LABELS: Record<RequestStatus, string> = {
  nova: "Nova",
  em_analise: "Em análise",
  convertida: "Virou pedido",
  cancelada: "Cancelada",
};
export const REQUEST_TONES: Record<RequestStatus, Tone> = {
  nova: "warn",
  em_analise: "info",
  convertida: "ok",
  cancelada: "danger",
};

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  link: "Link",
  transferencia: "Transferência",
  outro: "Outro",
};

export const STEP_LABELS: Record<StepKey, string> = {
  impressao: "Impressão",
  pintura: "Pintura",
  montagem: "Montagem",
  acabamento: "Acabamento",
  embalagem: "Embalagem",
};
export const STEP_KEYS = Object.keys(STEP_LABELS) as StepKey[];
export const STEP_STATE_LABELS: Record<StepState, string> = {
  pendente: "Pendente",
  concluida: "Concluída",
  nao_se_aplica: "Não se aplica",
};

export const MATERIAL_KIND_LABELS: Record<MaterialKind, string> = {
  filamento: "Filamento",
  tinta: "Tinta",
  embalagem: "Embalagem",
  etiqueta: "Etiqueta",
  outro: "Outro",
};
export const UNIT_LABELS: Record<Unit, string> = {
  g: "g",
  ml: "ml",
  unidade: "unidade",
  m: "m",
};
export const MOVEMENT_LABELS: Record<MaterialMovementType, string> = {
  compra: "Compra",
  consumo: "Consumo",
  perda: "Perda",
  ajuste: "Ajuste",
};
export const LOSS_LABELS: Record<LossReason, string> = {
  falha: "Falha",
  teste: "Teste",
  prototipo: "Protótipo",
  problema_material: "Problema de material",
  configuracao: "Configuração",
  outros: "Outros",
};

export const EXPENSE_LABELS: Record<ExpenseCategory, string> = {
  material: "Material",
  energia: "Energia",
  embalagem: "Embalagem",
  frete: "Frete",
  marketing: "Marketing",
  ferramentas: "Ferramentas",
  outros: "Outros",
};

export function toOptions<K extends string>(labels: Record<K, string>) {
  return (Object.keys(labels) as K[]).map((value) => ({ value, label: labels[value] }));
}
