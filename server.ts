import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Order, OrderStatus, Product, FinancialTransaction, User, AuditLog, AppState, ExtraItem } from "./src/types.js";

// Import GoogleGenAI from modern SDK
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_FILE = path.join(process.cwd(), "data-store.json");

// Helper definition of seed products
const seedProducts: Product[] = [
  {
    id: "prod-1",
    name: "Burgão Cheddar Bacon",
    description: "Hambúrguer de blend artesanal 150g, muito cheddar cremoso e fatias crocantes de bacon caipira no pão brioche selado.",
    category: "lanches",
    price: 32.90,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80",
    stock: 45,
    popular: true,
    extras: [
      { id: "ext-1", name: "Cheddar Extra", price: 4.50 },
      { id: "ext-2", name: "Bacon em Dobro", price: 5.00 },
      { id: "ext-3", name: "Hambúrguer 150g", price: 8.00 }
    ]
  },
  {
    id: "prod-2",
    name: "Frango Crisp Crocante",
    description: "Filé de frango empanado ultra crocante na farinha panko, maionese artesanal de alho, queijo prato e alface americana.",
    category: "lanches",
    price: 28.90,
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=400&auto=format&fit=crop&q=80",
    stock: 30,
    popular: true,
    extras: [
      { id: "ext-4", name: "Maionese Extra", price: 2.00 },
      { id: "ext-5", name: "Queijo Prato", price: 3.00 }
    ]
  },
  {
    id: "prod-3",
    name: "X-Salada Clássico",
    description: "Blend bovino de 120g grelhado na chapa, queijo prato derretido, alface crespa fresca, fatias de tomate e molho da casa.",
    category: "lanches",
    price: 24.90,
    image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&auto=format&fit=crop&q=80",
    stock: 50,
    extras: [
      { id: "ext-6", name: "Ovo Frito", price: 2.50 },
      { id: "ext-7", name: "Queijo Extra", price: 3.00 }
    ]
  },
  {
    id: "prod-4",
    name: "Batata Rústica da Casa",
    description: "Canoas de batata assadas com casca, fritas até dourar, temperadas com sal marinho, alecrim fresco e parmesão ralado.",
    category: "porcoes",
    price: 19.90,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80",
    stock: 60,
    extras: [
      { id: "ext-8", name: "Cheddar & Bacon Salpicado", price: 6.50 },
      { id: "ext-9", name: "Molho de Alho Cozinha", price: 2.50 }
    ]
  },
  {
    id: "prod-5",
    name: "Calabresa na Chapa com Cebola",
    description: "Porção farta de calabresa fatiada fina e grelhada com cebola roxa caramelizada na chapa. Acompanha fatias de pão brioche.",
    category: "porcoes",
    price: 27.90,
    image: "https://images.unsplash.com/photo-1524182576066-1bb979e2534b?w=400&auto=format&fit=crop&q=80",
    stock: 25,
    extras: [
      { id: "ext-10", name: "Pão de Brioche Extra (2 un)", price: 4.00 }
    ]
  },
  {
    id: "prod-6",
    name: "Coca-Cola Lata 350ml",
    description: "Refrigerante lata super gelado.",
    category: "bebidas",
    price: 6.50,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80",
    stock: 120,
    extras: [
      { id: "ext-11", name: "Fatia de Limão e Gelo", price: 1.00 }
    ]
  },
  {
    id: "prod-7",
    name: "Suco de Laranja Natural 400ml",
    description: "Espremido na hora, 100% fruta, sem adição de água ou açúcar.",
    category: "bebidas",
    price: 9.00,
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&auto=format&fit=crop&q=80",
    stock: 40,
    extras: [
      { id: "ext-12", name: "Adicionar Hortelã", price: 1.00 }
    ]
  },
  {
    id: "prod-8",
    name: "Pudim de Leite Condensado",
    description: "Pudim liso clássico, extremamente cremoso, com calda de caramelo brilhante e dourada. Receita tradicional.",
    category: "sobremesas",
    price: 12.00,
    image: "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=400&auto=format&fit=crop&q=80",
    stock: 15,
    extras: []
  },
  {
    id: "prod-9",
    name: "Combo Dupla Perfeita (Casal)",
    description: "2x Burgão Cheddar Bacon + 1x Batata Rústica da Casa + 2x Cervejas Heineken ou Cocas. O melhor preço do cardápio.",
    category: "combos",
    price: 79.90,
    image: "https://images.unsplash.com/photo-1521305916504-4a1121188589?w=400&auto=format&fit=crop&q=80",
    stock: 20,
    popular: true,
    extras: [
      { id: "ext-13", name: "Maionese Artesanal", price: 2.00 }
    ]
  }
];

const seedUsers: User[] = [
  { id: "user-1", username: "aline.admin", name: "Aline (Administrador)", role: "admin" },
  { id: "user-2", username: "bruna.caixa", name: "Bruna (Caixa)", role: "caixa" },
  { id: "user-3", username: "marcos.cozinha", name: "Marcos (Cozinha)", role: "cozinha" },
  { id: "user-4", username: "felipe.atendente", name: "Felipe (Atendente)", role: "atendente" }
];

const seedTransactions: FinancialTransaction[] = [
  { id: "tx-1", type: "despesa", category: "Insumos", description: "Compra de Hortifruti (alface, tomate)", amount: 125.00, date: new Date(Date.now() - 3600000 * 48).toISOString() },
  { id: "tx-2", type: "despesa", category: "Insumos", description: "Compra de Carnes e Pães", amount: 480.00, date: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: "tx-3", type: "despesa", category: "Estrutura", description: "Energia Elétrica Copel", amount: 320.00, date: new Date(Date.now() - 3600000 * 72).toISOString() },
  { id: "tx-4", type: "receita", category: "Vendas", description: "Venda PDV #1001", amount: 45.90, date: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: "tx-5", type: "receita", category: "Vendas", description: "Venda QR Code #1002 (Mesa 03)", amount: 38.00, date: new Date(Date.now() - 3600000 * 2).toISOString() }
];

const seedOrders: Order[] = [
  {
    id: "ord-1",
    displayId: 1001,
    clientName: "Roberto Fontes",
    type: "balcao",
    items: [
      {
        product: seedProducts[0],
        quantity: 1,
        selectedExtras: [seedProducts[0].extras[0]], // Cheddar Extra
        observation: "Sem cebola por favor"
      },
      {
        product: seedProducts[5], // Coca
        quantity: 1,
        selectedExtras: [],
        observation: ""
      }
    ],
    total: 43.90,
    paymentMethod: "pix",
    status: OrderStatus.FINALIZADO,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 4.5).toISOString()
  },
  {
    id: "ord-2",
    displayId: 1002,
    clientName: "Júlia Santos",
    type: "qrcode",
    tableNum: "Mesa 03",
    items: [
      {
        product: seedProducts[2], // X-Salada
        quantity: 1,
        selectedExtras: [seedProducts[2].extras[0]], // Ovo frito
        observation: "Bem passado"
      },
      {
        product: seedProducts[6], // Suco Laranja
        quantity: 1,
        selectedExtras: [],
        observation: ""
      }
    ],
    total: 36.40,
    paymentMethod: "credito",
    status: OrderStatus.FINALIZADO,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
  },
  {
    id: "ord-3",
    displayId: 1003,
    clientName: "Carlos Alberto",
    type: "ifood",
    items: [
      {
        product: seedProducts[8], // Combo casal
        quantity: 1,
        selectedExtras: [],
        observation: "Enviar sachets de ketchup"
      }
    ],
    total: 87.90, // total includes product + deliveryFee (8.00)
    paymentMethod: "pix",
    status: OrderStatus.CONFIRMADO,
    createdAt: new Date(Date.now() - 1000 * 600).toISOString(), // 10 min ago
    ifoodDetails: {
      originalId: "IFD-990184",
      deliveryFee: 8.00,
      syncStatus: "COMPLETED"
    }
  },
  {
    id: "ord-4",
    displayId: 1004,
    clientName: "Mesa 07",
    type: "qrcode",
    tableNum: "Mesa 07",
    items: [
      {
        product: seedProducts[1], // Frango crisp
        quantity: 2,
        selectedExtras: [seedProducts[1].extras[0]], // Caputiry
        observation: "Cortar ao meio"
      }
    ],
    total: 61.80,
    status: OrderStatus.AGUARDANDO_PAGAMENTO,
    createdAt: new Date(Date.now() - 1000 * 300).toISOString() // 5 min ago
  }
];

const seedAuditLogs: AuditLog[] = [
  { id: "log-1", timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), user: "Bruna (Caixa)", action: "Abertura de Caixa", details: "Caixa aberto com saldo inicial de R$ 150,00", type: "finance" },
  { id: "log-2", timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), user: "Bruna (Caixa)", action: "Pagamento de Pedido", details: "Pedido #1001 pago via PIX - R$ 43,90", type: "finance" },
  { id: "log-3", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), user: "Bruna (Caixa)", action: "Aprovação de Pedido QR Code", details: "Pedido de Mesa 03 aprovado e lançado no painel de cozinha", type: "info" },
  { id: "log-4", timestamp: new Date(Date.now() - 1000 * 600).toISOString(), user: "Integração iFood", action: "Captura Automática", details: "Novo pedido iFood #990184 capturado via API polling", type: "ifood" }
];

// Helper to load application state
const loadState = (): AppState => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const stateObj = JSON.parse(raw) as AppState;
      if (!stateObj.ifoodConfig) {
        stateObj.ifoodConfig = {
          clientId: "f10b44a2-6108-4a3b-b882-e8cb8089cc17",
          clientSecret: "svphzjn1eo97am7jkupndjkf85y6n41slxbs5kbyaedjuirsqu7xdzt6fbmhefrhiajvbir9j590pwpgqcczcakuqven77l2hi2",
          merchantId: "",
          status: "disconnected"
        };
      }
      return stateObj;
    }
  } catch (err) {
    console.error("Erro ao ler data-store.json, recarregando dados padrão:", err);
  }

  // Create default state
  const defaultState: AppState = {
    products: seedProducts,
    orders: seedOrders,
    transactions: seedTransactions,
    users: seedUsers,
    auditLogs: seedAuditLogs,
    caixaStatus: {
      isOpen: true,
      openedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      closedAt: null,
      initialBalance: 150.00
    },
    ifoodConfig: {
      clientId: "f10b44a2-6108-4a3b-b882-e8cb8089cc17",
      clientSecret: "svphzjn1eo97am7jkupndjkf85y6n41slxbs5kbyaedjuirsqu7xdzt6fbmhefrhiajvbir9j590pwpgqcczcakuqven77l2hi2",
      merchantId: "",
      status: "disconnected"
    }
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(defaultState, null, 2));
  return defaultState;
};

// Helper to write application state and trigger audit logs
const saveState = (state: AppState) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error("Erro ao escrever data-store.json:", err);
  }
};

const addAuditLog = (state: AppState, user: string, action: string, details: string, type: AuditLog["type"] = "info") => {
  const log: AuditLog = {
    id: "log-" + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    user,
    action,
    details,
    type
  };
  state.auditLogs.unshift(log);
  if (state.auditLogs.length > 300) {
    state.auditLogs = state.auditLogs.slice(0, 300);
  }
};

// INITIAL LOAD STATE
let appState = loadState();

// Express API Routes
app.get("/api/state", (req, res) => {
  res.json(appState);
});

app.post("/api/reset", (req, res) => {
  appState = {
    products: seedProducts,
    orders: seedOrders,
    transactions: seedTransactions,
    users: seedUsers,
    auditLogs: seedAuditLogs,
    caixaStatus: {
      isOpen: true,
      openedAt: new Date().toISOString(),
      closedAt: null,
      initialBalance: 150.00
    }
  };
  saveState(appState);
  res.json({ status: "success", data: appState });
});

// Caixa Open / Close
app.post("/api/caixa/toggle", (req, res) => {
  const { open, initialBalance, user } = req.body;
  if (open) {
    appState.caixaStatus = {
      isOpen: true,
      openedAt: new Date().toISOString(),
      closedAt: null,
      initialBalance: Number(initialBalance) || 0
    };
    addAuditLog(appState, user || "Gerente", "Abertura de Caixa", `Caixa aberto com fundo inicial de R$ ${Number(initialBalance).toFixed(2)}`, "finance");
  } else {
    appState.caixaStatus.isOpen = false;
    appState.caixaStatus.closedAt = new Date().toISOString();
    // compute financial totals for audit
    const income = appState.orders
      .filter(o => o.status === OrderStatus.FINALIZADO && o.completedAt && o.completedAt > (appState.caixaStatus.openedAt || ""))
      .reduce((sum, o) => sum + o.total, 0);
    const balanceNow = appState.caixaStatus.initialBalance + income;
    addAuditLog(appState, user || "Gerente", "Fechamento de Caixa", `Ref. Vendas no dia: R$ ${income.toFixed(2)}. Saldo total estimado em gaveta: R$ ${balanceNow.toFixed(2)}`, "finance");
  }
  saveState(appState);
  res.json({ status: "success", data: appState });
});

// Order Placement (Manual or Client Menu QR Code / iFood Simulation)
app.post("/api/orders", (req, res) => {
  const { clientName, type, tableNum, items, paymentMethod, status, user } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Itens do pedido não especificados" });
  }

  // Calculate friendly display ID
  const lastDisplayId = appState.orders.length > 0 
    ? Math.max(...appState.orders.map(o => o.displayId)) 
    : 1000;
  const nextDisplayId = lastDisplayId + 1;

  // Compute prices with selected extras
  let calculatedTotal = 0;
  const parsedItems = items.map((item: any) => {
    // Find the original product to ensure correct base price
    const prod = appState.products.find(p => p.id === item.product.id) || item.product;
    const itemExtrasTotal = (item.selectedExtras || []).reduce((sum: number, ext: ExtraItem) => sum + ext.price, 0);
    const itemSubtotal = (prod.price + itemExtrasTotal) * item.quantity;
    calculatedTotal += itemSubtotal;

    // Decrease product stock when order is placed
    prod.stock = Math.max(0, prod.stock - item.quantity);

    return {
      product: prod,
      quantity: item.quantity,
      selectedExtras: item.selectedExtras || [],
      observation: item.observation || ""
    };
  });

  const nextOrder: Order = {
    id: "ord-" + Math.random().toString(36).substring(2, 9),
    displayId: nextDisplayId,
    clientName: clientName || (type === "qrcode" ? `Mesa ${tableNum || "Digital"}` : "Cliente Balcão"),
    type: type || "balcao",
    tableNum: tableNum,
    items: parsedItems,
    total: Number(calculatedTotal.toFixed(2)),
    paymentMethod: paymentMethod,
    status: status || (type === "qrcode" ? OrderStatus.NOVO : OrderStatus.CONFIRMADO),
    createdAt: new Date().toISOString()
  };

  appState.orders.unshift(nextOrder);
  
  // Create audit
  const auditUser = user || (type === "qrcode" ? "Cliente QR Code" : "Atendente");
  const auditDetails = `Pedido #${nextDisplayId} de R$ ${nextOrder.total.toFixed(2)} criado. Tipo: ${nextOrder.type.toUpperCase()}`;
  addAuditLog(appState, auditUser, "Criação de Pedido", auditDetails, type === "ifood" ? "ifood" : "info");

  saveState(appState);
  res.json({ status: "success", order: nextOrder, data: appState });
});

// Order Status transitions and timestamps
app.post("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, user } = req.body;

  const order = appState.orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Pedido não localizado" });
  }

  const oldStatus = order.status;
  order.status = status;

  // Manage times
  if (status === OrderStatus.EM_PREPARO && !order.startedPreparAt) {
    order.startedPreparAt = new Date().toISOString();
  } else if (status === OrderStatus.PRONTO && !order.readyAt) {
    order.readyAt = new Date().toISOString();
  } else if (status === OrderStatus.FINALIZADO && !order.completedAt) {
    order.completedAt = new Date().toISOString();
    // Automatically register a financial revenue transaction
    const newTx: FinancialTransaction = {
      id: "tx-" + Math.random().toString(36).substring(2, 9),
      type: "receita",
      category: "Vendas",
      description: `Venda #${order.displayId} (${order.clientName})`,
      amount: order.total,
      date: new Date().toISOString()
    };
    appState.transactions.unshift(newTx);
  }

  // Audits
  const auditDetails = `Pedido #${order.displayId} atualizado de ${oldStatus} para ${status}`;
  addAuditLog(appState, user || "Sistema", "Mudança de Status", auditDetails, order.type === "ifood" ? "ifood" : "info");

  saveState(appState);
  res.json({ status: "success", order, data: appState });
});

// Pay and Approve order (useful for QR-code waiting payment or manual)
app.post("/api/orders/:id/pay", (req, res) => {
  const { id } = req.params;
  const { paymentMethod, user } = req.body;

  const order = appState.orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Pedido não localizado" });
  }

  order.paymentMethod = paymentMethod;
  order.status = OrderStatus.CONFIRMADO; // Set to CONFIRMADO, ready for kitchen!

  const details = `Pedido #${order.displayId} pago via ${paymentMethod?.toUpperCase()} (Total R$ ${order.total.toFixed(2)})`;
  addAuditLog(appState, user || "Caixa", "Pagamento Efetuado", details, "finance");

  saveState(appState);
  res.json({ status: "success", order, data: appState });
});

// Product creation/editing
app.post("/api/products", (req, res) => {
  const { id, name, description, category, price, image, stock, extras, popular, user } = req.body;

  if (id) {
    // Edit action
    const prodIndex = appState.products.findIndex(p => p.id === id);
    if (prodIndex !== -1) {
      const oldProd = appState.products[prodIndex];
      appState.products[prodIndex] = {
        id,
        name: name || oldProd.name,
        description: description ?? oldProd.description,
        category: category || oldProd.category,
        price: price !== undefined ? Number(price) : oldProd.price,
        image: image || oldProd.image,
        stock: stock !== undefined ? Number(stock) : oldProd.stock,
        extras: extras || oldProd.extras,
        popular: popular !== undefined ? popular : oldProd.popular
      };
      addAuditLog(appState, user || "Administrador", "Edição de Produto", `Produto "${name}" atualizado. Preço: R$ ${price}`, "info");
    }
  } else {
    // Create new product
    const newProd: Product = {
      id: "prod-" + Math.random().toString(36).substring(2, 9),
      name,
      description: description || "",
      category,
      price: Number(price) || 0,
      image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80",
      stock: stock !== undefined ? Number(stock) : 50,
      extras: extras || [],
      popular: !!popular
    };
    appState.products.push(newProd);
    addAuditLog(appState, user || "Administrador", "Cadastro de Produto", `Produto "${name}" cadastrado na categoria ${category}`, "info");
  }

  saveState(appState);
  res.json({ status: "success", data: appState });
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const user = (req.query.user as string) || "Administrador";

  const prod = appState.products.find(p => p.id === id);
  if (prod) {
    appState.products = appState.products.filter(p => p.id !== id);
    addAuditLog(appState, user, "Exclusão de Produto", `Produto "${prod.name}" removido do cardápio`, "warning");
    saveState(appState);
    res.json({ status: "success", data: appState });
  } else {
    res.status(404).json({ error: "Produto não localizado" });
  }
});

app.delete("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const user = (req.query.user as string) || "Operador";

  const order = appState.orders.find(o => o.id === id);
  if (order) {
    appState.orders = appState.orders.filter(o => o.id !== id);
    addAuditLog(appState, user, "Exclusão de Pedido", `Pedido #${order.displayId} (${order.clientName}) excluído definitivamente`, "warning");
    saveState(appState);
    res.json({ status: "success", data: appState });
  } else {
    res.status(404).json({ error: "Pedido não localizado" });
  }
});

// Expenses addition
app.post("/api/transactions", (req, res) => {
  const { type, category, description, amount, user } = req.body;

  const transaction: FinancialTransaction = {
    id: "tx-" + Math.random().toString(36).substring(2, 9),
    type: type || "despesa",
    category: category || "Outros",
    description: description || "Sem descrição",
    amount: Number(amount) || 0,
    date: new Date().toISOString()
  };

  appState.transactions.unshift(transaction);
  addAuditLog(appState, user || "Administrador", "Transação Financeira", `Lançamento de ${transaction.type}: ${transaction.description} - R$ ${transaction.amount.toFixed(2)}`, "finance");
  saveState(appState);
  res.json({ status: "success", data: appState, transaction });
});

// iFood API Polling Simulation
// Triggers an incoming external iFood order. It goes smoothly through state channels.
// We can also trigger simulated failure with standard queue retry mechanics.
app.post("/api/ifood/simulate", (req, res) => {
  const { simulateFailure, clientName } = req.body;

  const selectedBurger = appState.products.find(p => p.category === "lanches") || seedProducts[0];
  const selectedDrink = appState.products.find(p => p.category === "bebidas") || seedProducts[5];

  const lastDisplayId = appState.orders.length > 0 ? Math.max(...appState.orders.map(o => o.displayId)) : 1000;
  const nextDisplayId = lastDisplayId + 1;

  const names = ["Gabriel Silva", "Mariana Costa", "Renan Ramos", "Letícia Lima", "Arthur Menezes", "Sofia Rocha"];
  const finalName = clientName || names[Math.floor(Math.random() * names.length)];

  // Create extras
  const itemExtras = selectedBurger.extras.slice(0, 1);
  const burgerPrice = selectedBurger.price + itemExtras.reduce((sum, e) => sum + e.price, 0);
  const drinkPrice = selectedDrink.price;
  const deliveryFee = 7.50;
  const total = Number((burgerPrice + drinkPrice + deliveryFee).toFixed(2));

  const items = [
    {
      product: selectedBurger,
      quantity: 1,
      selectedExtras: itemExtras,
      observation: "Sem picles"
    },
    {
      product: selectedDrink,
      quantity: 1,
      selectedExtras: [],
      observation: "Gelo e limão separados"
    }
  ];

  if (simulateFailure) {
    // Generate an order that fails iFood Integration validation (simulating temporary webhook breakdown / parsing failure)
    const originalId = "IFD-" + Math.floor(100000 + Math.random() * 900000);
    const mockFailedOrder: Order = {
      id: "ord-failed-" + Math.random().toString(36).substring(2, 9),
      displayId: nextDisplayId,
      clientName: finalName + " (iFood)",
      type: "ifood",
      items: items,
      total: total,
      status: OrderStatus.NOVO,
      createdAt: new Date().toISOString(),
      ifoodDetails: {
        originalId: originalId,
        deliveryFee: deliveryFee,
        syncStatus: "FAILED",
        errorMessage: "VAL_ERR_01: Falha ao validar cupom de desconto da plataforma iFood."
      }
    };
    appState.orders.unshift(mockFailedOrder);
    addAuditLog(appState, "Automação iFood", "Tentativa de Sincronia iFood", `Falha ao importar pedido iFood ${originalId} - Erro de Validação de Cupom`, "error");
    saveState(appState);
    return res.json({ status: "failed_simulated", order: mockFailedOrder, data: appState });
  }

  // Normal compliant iFood flow
  const originalId = "IFD-" + Math.floor(100000 + Math.random() * 900000);
  const mockOrder: Order = {
    id: "ord-ifd-" + Math.random().toString(36).substring(2, 9),
    displayId: nextDisplayId,
    clientName: finalName,
    type: "ifood",
    items: items,
    total: total,
    status: OrderStatus.NOVO, // Comes in as NOVO, needs cashier confirmation
    createdAt: new Date().toISOString(),
    ifoodDetails: {
      originalId: originalId,
      deliveryFee: deliveryFee,
      syncStatus: "COMPLETED"
    }
  };

  appState.orders.unshift(mockOrder);
  addAuditLog(appState, "Automação iFood", "Captura Automática iFood", `Pedido iFood ${originalId} recebido com sucesso. Total: R$ ${total.toFixed(2)} (Frete R$ 7.50)`, "ifood");
  saveState(appState);
  res.json({ status: "success", order: mockOrder, data: appState });
});

// Reprocess iFood order failure queue
app.post("/api/ifood/reprocess/:orderId", (req, res) => {
  const { orderId } = req.params;
  const { user } = req.body;

  const order = appState.orders.find(o => o.id === orderId);
  if (!order || !order.ifoodDetails) {
    return res.status(404).json({ error: "Pedido iFood não localizado" });
  }

  // Resolve failure
  order.ifoodDetails.syncStatus = "COMPLETED";
  order.ifoodDetails.errorMessage = undefined;
  
  addAuditLog(appState, user || "Operador", "Reprocessamento iFood", `Fila de reprocessamento resolveu erro no pedido #${order.displayId} (${order.ifoodDetails.originalId})`, "ifood");
  saveState(appState);
  res.json({ status: "success", order, data: appState });
});

// Configure iFood integration
app.post("/api/ifood/config", (req, res) => {
  const { clientId, clientSecret, merchantId, status, storeName } = req.body;

  if (!appState.ifoodConfig) {
    appState.ifoodConfig = {};
  }

  if (clientId !== undefined) appState.ifoodConfig.clientId = clientId;
  if (clientSecret !== undefined) appState.ifoodConfig.clientSecret = clientSecret;
  if (merchantId !== undefined) appState.ifoodConfig.merchantId = merchantId;
  if (status !== undefined) appState.ifoodConfig.status = status;
  if (storeName !== undefined) appState.ifoodConfig.storeName = storeName;

  saveState(appState);
  res.json({ status: "success", data: appState });
});

// Test real connection to iFood Merchant API with credentials
app.post("/api/ifood/test-real", async (req, res) => {
  const { clientId, clientSecret } = req.body;
  const finalClientId = clientId || (appState.ifoodConfig && appState.ifoodConfig.clientId) || process.env.IFOOD_CLIENT_ID || "f10b44a2-6108-4a3b-b882-e8cb8089cc17";
  const finalClientSecret = clientSecret || (appState.ifoodConfig && appState.ifoodConfig.clientSecret) || process.env.IFOOD_CLIENT_SECRET || "svphzjn1eo97am7jkupndjkf85y6n41slxbs5kbyaedjuirsqu7xdzt6fbmhefrhiajvbir9j590pwpgqcczcakuqven77l2hi2";

  try {
    // 1. Authenticate via OAuth client_credentials on iFood API
    const authParams = new URLSearchParams();
    authParams.append("grantType", "client_credentials");
    authParams.append("clientId", finalClientId);
    authParams.append("clientSecret", finalClientSecret);

    const authRes = await fetch("https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: authParams.toString()
    });

    if (!authRes.ok) {
      const errText = await authRes.text();
      
      if (!appState.ifoodConfig) appState.ifoodConfig = {};
      appState.ifoodConfig.status = "error";
      saveState(appState);

      return res.json({
        success: false,
        phase: "authentication",
        error: `iFood respondeu com erro ${authRes.status}: ${errText}`
      });
    }

    const tokenData: any = await authRes.json();
    const accessToken = tokenData.accessToken;

    if (!accessToken) {
      if (!appState.ifoodConfig) appState.ifoodConfig = {};
      appState.ifoodConfig.status = "error";
      saveState(appState);

      return res.json({
        success: false,
        phase: "token_retrieval",
        error: "O iFood autenticou mas não enviou 'accessToken' no corpo da resposta."
      });
    }

    // 2. Fetch merchants associated with this developer key
    const merchantRes = await fetch("https://merchant-api.ifood.com.br/merchant/v1.0/merchants", {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (!merchantRes.ok) {
      const errText = await merchantRes.text();
      
      if (!appState.ifoodConfig) appState.ifoodConfig = {};
      appState.ifoodConfig.status = "connected"; // We successfully connected (acquired token)
      saveState(appState);

      return res.json({
        success: true,
        phase: "merchants",
        error: `Conectado via Token! Porém a listagem de lojas associadas falhou (erro ${merchantRes.status}): ${errText}`,
        tokenPreview: `${accessToken.substring(0, 10)}...`
      });
    }

    const merchants: any = await merchantRes.json();
    let merchantName = "Lanchonete 360 iFood Store";
    let merchantId = "";

    if (Array.isArray(merchants) && merchants.length > 0) {
      merchantName = merchants[0].name || merchantName;
      merchantId = merchants[0].id || "";
    }

    // Update state config to connected
    if (!appState.ifoodConfig) {
      appState.ifoodConfig = {};
    }
    appState.ifoodConfig.status = "connected";
    appState.ifoodConfig.storeName = merchantName;
    if (merchantId) {
      appState.ifoodConfig.merchantId = merchantId;
    }
    
    addAuditLog(appState, "Sistema", "Integração iFood", `Conexão Real iFood Homologada com Sucesso para Loja: "${merchantName}".`, "ifood");
    saveState(appState);

    return res.json({
      success: true,
      merchants,
      storeName: merchantName,
      merchantId,
      tokenPreview: `${accessToken.substring(0, 10)}...`
    });

  } catch (error: any) {
    console.error("iFood Integration Error:", error);

    if (!appState.ifoodConfig) appState.ifoodConfig = {};
    appState.ifoodConfig.status = "error";
    saveState(appState);

    return res.json({
      success: false,
      phase: "network",
      error: `Erro de rede/conexão com iFood: ${error.message}`
    });
  }
});

// BACKGROUND INTEGRATION: iFood Real-Time Order Event Poller
let isIFoodPolling = false;

async function pollIFoodOrders(isManual: boolean = false) {
  if (isIFoodPolling) return { success: false, reason: "Already polling" };
  
  const config = appState.ifoodConfig;
  if (!config || config.status !== "connected" || !config.clientId || !config.clientSecret) {
    return { success: false, reason: "iFood integration is not connected/configured" };
  }

  isIFoodPolling = true;
  try {
    // 1. Authenticate to secure dynamic OAuth token
    const authParams = new URLSearchParams();
    authParams.append("grantType", "client_credentials");
    authParams.append("clientId", config.clientId);
    authParams.append("clientSecret", config.clientSecret);

    const authRes = await fetch("https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: authParams.toString()
    });

    if (!authRes.ok) {
      const errText = await authRes.text();
      console.error(`[iFood Event Poller] Auth error: ${authRes.status} - ${errText}`);
      isIFoodPolling = false;
      return { success: false, error: `Autenticação falhou: ${authRes.status}` };
    }

    const tokenData: any = await authRes.json();
    const accessToken = tokenData.accessToken;
    if (!accessToken) {
      isIFoodPolling = false;
      return { success: false, error: "Access token não fornecido na resposta do iFood." };
    }

    // 2. Fetch unacknowledged events from iFood
    const eventsRes = await fetch("https://merchant-api.ifood.com.br/order/v1.0/events:polling", {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (!eventsRes.ok) {
      if (eventsRes.status !== 204) {
        const errText = await eventsRes.text();
        console.error(`[iFood Event Poller] Events request failing: ${eventsRes.status} - ${errText}`);
      }
      isIFoodPolling = false;
      return { success: true, count: 0 };
    }

    // 204 Content is normal when there are no events to receive
    if (eventsRes.status === 204) {
      isIFoodPolling = false;
      return { success: true, count: 0 };
    }

    const events: any[] = await eventsRes.json();
    if (!Array.isArray(events) || events.length === 0) {
      isIFoodPolling = false;
      return { success: true, count: 0 };
    }

    console.log(`[iFood Event Poller] Capturados ${events.length} eventos pendentes no iFood.`);
    
    let importedCount = 0;
    let stateModified = false;
    const eventsToAck: { id: string }[] = [];

    for (const event of events) {
      // Append for acknowledgment
      eventsToAck.push({ id: event.id });

      const isPlacedEvent = event.code === "PLC" || event.fullCode === "PLACED";
      if (isPlacedEvent) {
        const iFoodOrderId = event.orderId || event.correlationId;
        if (!iFoodOrderId) continue;

        // Check for duplicates
        const exists = appState.orders.some(o => 
          o.ifoodDetails?.originalId === iFoodOrderId || o.id === `ord-ifd-${iFoodOrderId}`
        );

        if (exists) {
          continue;
        }

        // Fetch exact details for individual order
        const detailsRes = await fetch(`https://merchant-api.ifood.com.br/order/v1.0/orders/${iFoodOrderId}`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`
          }
        });

        if (!detailsRes.ok) {
          console.error(`[iFood Event Poller] Falha ao detalhar pedido ${iFoodOrderId}: código ${detailsRes.status}`);
          continue;
        }

        const orderDetails: any = await detailsRes.json();
        const clientName = orderDetails.customer?.name || "Cliente iFood";
        
        // Generate nice sequential dashboard IDs
        const lastDisplayId = appState.orders.length > 0 ? Math.max(...appState.orders.map(o => o.displayId)) : 1000;
        const nextDisplayId = lastDisplayId + 1;
        
        const deliveryFee = orderDetails.total?.deliveryFee || 0;
        const total = orderDetails.total?.orderAmount || 0;

        // Map items securely from iFood payload schema
        const items: any[] = [];
        if (Array.isArray(orderDetails.items)) {
          for (const item of orderDetails.items) {
            // Check if product exists in catalog or fallback gracefully to a standard structure
            const matchedProduct = appState.products.find(p => p.name.toLowerCase() === item.name.toLowerCase()) || {
              id: "prod-ifood-" + Math.random().toString(36).substring(2, 7),
              name: item.name,
              description: "Prato importado automaticamente via cardápio iFood",
              category: "lanches",
              price: item.unitPrice || 0,
              image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80",
              stock: 99,
              extras: []
            };

            const selectedExtras: any[] = [];
            if (Array.isArray(item.options)) {
              for (const opt of item.options) {
                selectedExtras.push({
                  id: "ext-ifd-" + Math.random().toString(36).substring(2, 7),
                  name: opt.name,
                  price: opt.price || 0
                });
              }
            }

            items.push({
              product: matchedProduct,
              quantity: item.quantity || 1,
              selectedExtras,
              observation: item.observations || ""
            });
          }
        }

        const newImportedOrder: Order = {
          id: `ord-ifd-${iFoodOrderId}`,
          displayId: nextDisplayId,
          clientName: clientName,
          type: "ifood",
          items: items,
          total: total,
          status: OrderStatus.NOVO, // Initial status is New, requiring cashier acceptance
          createdAt: orderDetails.createdAt || new Date().toISOString(),
          ifoodDetails: {
            originalId: iFoodOrderId,
            deliveryFee: deliveryFee,
            syncStatus: "COMPLETED"
          }
        };

        appState.orders.unshift(newImportedOrder);
        addAuditLog(appState, "Sincronizador iFood", "Captura Automática", `Novo pedido teste iFood ${iFoodOrderId} (#${nextDisplayId}) integrado. Cliente: ${clientName}. Total: R$ ${total.toFixed(2)}`, "ifood");
        stateModified = true;
        importedCount++;
      }
    }

    // 3. Acknowledge events back to iFood so queue progresses safely
    if (eventsToAck.length > 0) {
      const ackRes = await fetch("https://merchant-api.ifood.com.br/order/v1.0/events:acknowledgment", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(eventsToAck)
      });
      if (!ackRes.ok) {
        console.error(`[iFood Event Poller] Erro ao enviar ACK ao iFood: ${ackRes.status}`);
      } else {
        console.log(`[iFood Event Poller] Enviado ACK com sucesso para ${eventsToAck.length} eventos.`);
      }
    }

    if (stateModified) {
      saveState(appState);
    }

    isIFoodPolling = false;
    return { success: true, count: importedCount, eventsChecked: events.length };

  } catch (error: any) {
    console.error("[iFood Event Poller] Exceção durante polling:", error);
    isIFoodPolling = false;
    return { success: false, error: error.message };
  }
}

// Background poller scheduler interval (every 3 seconds - ultra-fast automatic sync)
setInterval(pollIFoodOrders, 3000);

// Endpoint for manual on-demand dashboard update trigger
app.post("/api/ifood/poll-now", async (req, res) => {
  const result = await pollIFoodOrders(true);
  res.json({ status: "success", result, data: appState });
});

// Gemini AI operational intelligence API (smart analysis of catalog/sales)
app.post("/api/ai/insights", async (req, res) => {
  const { prompt } = req.body;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      return res.json({ 
        insight: "### 💡 Insight Operacional da IA (Modo Sombreado)\n\n" +
                 "Para ver insights preditivos e de lucro inteligentes, configure sua **GEMINI_API_KEY** no painel de Secrets. Aqui está a simulação preditiva baseada nos seus dados atuais:\n\n" +
                 "1. **Bestsellers recomendados**: O item **" + (appState.products[0]?.name || "Burgão Cheddar Bacon") + "** representa 60% das suas margens acumuladas. Considere associá-lo a um refrigerante com 15% de desconto.\n" +
                 "2. **Fluxo de Cozinha**: Horários entre 19h e 21h são os picos. Recomendamos pré-aquecimento da chapa às 18:30.\n" +
                 "3. **Canal Digital**: Pedidos por QR Code têm um ticket médio 12% maior que o atendimento manual no balcão devido às fotos irresistíveis de acompanhamentos. Incentive os clientes de mesa!"
      });
    }

    const ai = new GoogleGenAI({ apiKey: key });

    // Format current financials to send to AI
    const completedOrders = appState.orders.filter(o => o.status === OrderStatus.FINALIZADO);
    const ticket = completedOrders.length > 0 
      ? completedOrders.reduce((sum, o) => sum + o.total, 0) / completedOrders.length 
      : 0;

    const dataContext = {
      totalProducts: appState.products.length,
      productsWithStockWarning: appState.products.filter(p => p.stock < 15).map(p => ({ name: p.name, stock: p.stock })),
      orderHistoryStats: {
        totalOrders: appState.orders.length,
        completed: completedOrders.length,
        pending: appState.orders.filter(o => o.status !== OrderStatus.FINALIZADO && o.status !== OrderStatus.CANCELADO).length,
        averageTicket: ticket,
        sourceMix: {
          balcao: appState.orders.filter(o => o.type === "balcao").length,
          qrcode: appState.orders.filter(o => o.type === "qrcode").length,
          ifood: appState.orders.filter(o => o.type === "ifood").length
        }
      },
      recentAuditLogs: appState.auditLogs.slice(0, 5).map(l => `${l.timestamp}: [${l.user}] ${l.action} - ${l.details}`)
    };

    const promptMessage = `Você é um analista especialista em negócios de alimentação e lanchonetes.
Analise os seguintes dados do painel de operações da nossa lanchonete e crie um relatório curto, direto e ultra profissional em formato Markdown com conselhos práticos e rápidos.

DADOS DA LOJA:
${JSON.stringify(dataContext, null, 2)}

PERGUTA GERAL OU FOCO ADICIONAL DO USUÁRIO:
${prompt || "Gere conselhos sobre como aumentar o faturamento no cardápio, reduzir atrasos de cozinha e melhorar as margens do dia."}

Estruture sua resposta com:
- 💡 **Insights de Vendas e Margens**
- 🍔 **Otimizações no Cardápio / Combos**
- ⏱️ **Gargalos de Cozinha / Estoque**
Mantenha a resposta com linguagem executiva, em português brasileiro comercial simples.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptMessage
    });

    const outputText = response.text || "Sem insights no momento. Tente novamente.";
    res.json({ insight: outputText });

  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    res.status(500).json({ error: "Erro ao consultar a inteligência da lanchonete baseada em IA: " + error.message });
  }
});


// Express server setup
async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Lanchonete 360 Backend] Escutando na porta ${PORT}`);
  });
}

startServer();
