/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum OrderStatus {
  NOVO = "NOVO",
  AGUARDANDO_PAGAMENTO = "AGUARDANDO_PAGAMENTO",
  CONFIRMADO = "CONFIRMADO",
  EM_PREPARO = "EM_PREPARO",
  PRONTO = "PRONTO",
  ENTREGUE = "ENTREGUE",
  FINALIZADO = "FINALIZADO",
  CANCELADO = "CANCELADO"
}

export type OrderType = "balcao" | "qrcode" | "ifood";

export interface ExtraItem {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: "lanches" | "bebidas" | "porcoes" | "sobremesas" | "combos";
  price: number;
  image: string;
  stock: number;
  extras: ExtraItem[];
  popular?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedExtras: ExtraItem[];
  observation: string;
}

export interface Order {
  id: string;
  displayId: number;
  clientName: string;
  type: OrderType;
  tableNum?: string; // For QR Code orders
  items: CartItem[];
  total: number;
  paymentMethod?: "dinheiro" | "pix" | "credito" | "debito";
  status: OrderStatus;
  createdAt: string;
  startedPreparAt?: string;
  readyAt?: string;
  completedAt?: string;
  ifoodDetails?: {
    originalId: string;
    deliveryFee: number;
    syncStatus: "COMPLETED" | "FAILED" | "PENDING";
    errorMessage?: string;
  };
}

export interface FinancialTransaction {
  id: string;
  type: "receita" | "despesa";
  category: string;
  description: string;
  amount: number;
  date: string;
}

export type UserRole = "admin" | "caixa" | "cozinha" | "atendente";

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  type: "info" | "warning" | "error" | "ifood" | "finance";
}

export interface AppState {
  products: Product[];
  orders: Order[];
  transactions: FinancialTransaction[];
  users: User[];
  auditLogs: AuditLog[];
  caixaStatus: {
    isOpen: boolean;
    openedAt: string | null;
    closedAt: string | null;
    initialBalance: number;
  };
  ifoodConfig?: {
    clientId?: string;
    clientSecret?: string;
    merchantId?: string;
    status?: "connected" | "disconnected" | "error";
    storeName?: string;
  };
}
