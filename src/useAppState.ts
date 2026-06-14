import { useState, useEffect, useCallback } from "react";
import { AppState, Order, OrderStatus, Product, FinancialTransaction, AuditLog, User } from "./types.js";

// Audio alert sound
const playAlertSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playBeep = (freq: number, startTime: number, duration: number) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    const now = audioContext.currentTime;
    playBeep(880, now, 0.1);
    playBeep(880, now + 0.15, 0.15);
  } catch (err) {
    console.warn("Audio Context playback failed or blocked by user gesture:", err);
  }
};

// Seed dataset for Local Offline Mode / Netlify Demo
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
        selectedExtras: [seedProducts[0].extras[0]],
        observation: "Sem cebola por favor"
      },
      {
        product: seedProducts[5],
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
        product: seedProducts[2],
        quantity: 1,
        selectedExtras: [seedProducts[2].extras[0]],
        observation: "Bem passado"
      },
      {
        product: seedProducts[6],
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
        product: seedProducts[8],
        quantity: 1,
        selectedExtras: [],
        observation: "Enviar sachets de ketchup"
      }
    ],
    total: 87.90,
    paymentMethod: "pix",
    status: OrderStatus.CONFIRMADO,
    createdAt: new Date(Date.now() - 1000 * 600).toISOString(),
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
        product: seedProducts[1],
        quantity: 2,
        selectedExtras: [seedProducts[1].extras[0]],
        observation: "Cortar ao meio"
      }
    ],
    total: 61.80,
    status: OrderStatus.AGUARDANDO_PAGAMENTO,
    createdAt: new Date(Date.now() - 1000 * 300).toISOString()
  }
];

const seedAuditLogs: AuditLog[] = [
  { id: "log-1", timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), user: "Bruna (Caixa)", action: "Abertura de Caixa", details: "Caixa aberto com saldo inicial de R$ 150,00", type: "finance" },
  { id: "log-2", timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), user: "Bruna (Caixa)", action: "Pagamento de Pedido", details: "Pedido #1001 pago via PIX - R$ 43,90", type: "finance" },
  { id: "log-3", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), user: "Bruna (Caixa)", action: "Aprovação de Pedido QR Code", details: "Pedido de Mesa 03 aprovado e lançado no painel de cozinha", type: "info" },
  { id: "log-4", timestamp: new Date(Date.now() - 1000 * 600).toISOString(), user: "Integração iFood", action: "Captura Automática", details: "Novo pedido iFood #990184 capturado via API polling", type: "ifood" }
];

const getInitialLocalState = (): AppState => {
  const stored = localStorage.getItem("sistema_360_state");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // clear invalid state
    }
  }
  
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
      merchantId: "3883695",
      status: "connected",
      storeName: "Teste - luxdank"
    }
  };
  localStorage.setItem("sistema_360_state", JSON.stringify(defaultState));
  return defaultState;
};

export function useAppState() {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastOrderCount, setLastOrderCount] = useState<number>(0);
  const [isLocalFallbackMode, setIsLocalFallbackMode] = useState<boolean>(() => {
    return localStorage.getItem("sistema_360_local_mode") === "true";
  });

  const saveLocalState = (newState: AppState) => {
    setState(newState);
    localStorage.setItem("sistema_360_state", JSON.stringify(newState));
  };

  const addLocalAuditLog = (currentState: AppState, user: string, action: string, details: string, type: "info" | "warning" | "error" | "ifood" | "finance") => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      user,
      action,
      details,
      type
    };
    currentState.auditLogs.unshift(newLog);
  };

  const fetchState = useCallback(async () => {
    if (isLocalFallbackMode) {
      // Direct local storage state fetch
      const localData = getInitialLocalState();
      setState(localData);
      setLoading(false);
      setError(null);
      
      if (localData.orders && localData.orders.length > 0) {
        if (lastOrderCount > 0 && localData.orders.length > lastOrderCount) {
          const newest = localData.orders[0];
          if (newest.status === "NOVO" || newest.status === "CONFIRMADO") {
            playAlertSound();
          }
        }
        setLastOrderCount(localData.orders.length);
      } else {
        setLastOrderCount(0);
      }
      return;
    }

    try {
      const res = await fetch("/api/state");
      if (!res.ok) throw new Error("Fallback local ativo");
      const data: AppState = await res.json();
      
      setState(data);
      
      if (data.orders && data.orders.length > 0) {
        if (lastOrderCount > 0 && data.orders.length > lastOrderCount) {
          const newest = data.orders[0];
          if (newest.status === "NOVO" || newest.status === "CONFIRMADO") {
            playAlertSound();
          }
        }
        setLastOrderCount(data.orders.length);
      } else {
        setLastOrderCount(0);
      }
      
      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.warn("Servidor indisponível ou erro de conexão. Ativando Modo Offline Autônomo para Netlify.", err);
      // Automatically switch to local database fallback!
      localStorage.setItem("sistema_360_local_mode", "true");
      setIsLocalFallbackMode(true);
      const localData = getInitialLocalState();
      setState(localData);
      setLoading(false);
      setError(null);
    }
  }, [lastOrderCount, isLocalFallbackMode]);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3500);
    return () => clearInterval(interval);
  }, [fetchState]);

  const toggleCaixa = async (open: boolean, initialBalance: number, user: string) => {
    if (isLocalFallbackMode) {
      const currentState = getInitialLocalState();
      currentState.caixaStatus = {
        isOpen: open,
        openedAt: open ? new Date().toISOString() : currentState.caixaStatus.openedAt,
        closedAt: open ? null : new Date().toISOString(),
        initialBalance: initialBalance
      };
      
      addLocalAuditLog(
        currentState,
        user,
        open ? "Abertura de Caixa" : "Fechamento de Caixa",
        open ? `Caixa aberto por ${user} com saldo inicial de R$ ${initialBalance.toFixed(2)}` : `Caixa fechado por ${user}`,
        "finance"
      );
      
      saveLocalState(currentState);
      return;
    }

    try {
      const res = await fetch("/api/caixa/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ open, initialBalance, user })
      });
      if (res.ok) {
        const body = await res.json();
        setState(body.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addOrder = async (orderData: {
    clientName?: string;
    type: "balcao" | "qrcode" | "ifood";
    tableNum?: string;
    items: any[];
    paymentMethod?: string;
    status?: OrderStatus;
    user?: string;
  }) => {
    if (isLocalFallbackMode) {
      const currentState = getInitialLocalState();
      const lastDisplayId = currentState.orders.length > 0 ? Math.max(...currentState.orders.map(o => o.displayId)) : 1000;
      const nextDisplayId = lastDisplayId + 1;
      
      const subtotal = orderData.items.reduce((sum, item) => {
        const extraSum = item.selectedExtras?.reduce((es: number, e: any) => es + e.price, 0) || 0;
        return sum + (item.product.price + extraSum) * item.quantity;
      }, 0);
      
      const newOrder: Order = {
        id: `ord-loc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        displayId: nextDisplayId,
        clientName: orderData.clientName || orderData.tableNum || "Cliente Avulso",
        type: orderData.type,
        tableNum: orderData.tableNum,
        items: orderData.items,
        total: Number(subtotal.toFixed(2)),
        paymentMethod: orderData.paymentMethod as any,
        status: orderData.status || OrderStatus.NOVO,
        createdAt: new Date().toISOString()
      };
      
      currentState.orders.unshift(newOrder);
      addLocalAuditLog(
        currentState,
        orderData.user || "Sistema",
        "Novo Pedido",
        `Pedido #${nextDisplayId} (${orderData.type.toUpperCase()}) criado. Total: R$ ${subtotal.toFixed(2)}`,
        "info"
      );
      
      saveLocalState(currentState);
      return newOrder;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        const body = await res.json();
        setState(body.data);
        return body.order;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, user: string) => {
    if (isLocalFallbackMode) {
      const currentState = getInitialLocalState();
      const order = currentState.orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        
        if (status === OrderStatus.EM_PREPARO) {
          order.startedPreparAt = new Date().toISOString();
        } else if (status === OrderStatus.PRONTO) {
          order.readyAt = new Date().toISOString();
        } else if (status === OrderStatus.FINALIZADO || status === OrderStatus.ENTREGUE) {
          order.completedAt = new Date().toISOString();
          
          // Auto add transaction on financial dashboard if finalized in local cash register
          if (status === OrderStatus.FINALIZADO && currentState.caixaStatus.isOpen) {
            const txId = `tx-loc-${Date.now()}`;
            currentState.transactions.unshift({
              id: txId,
              type: "receita",
              category: "Vendas",
              description: `Venda ${order.type.toUpperCase()} #${order.displayId}`,
              amount: order.total,
              date: new Date().toISOString()
            });
            addLocalAuditLog(
              currentState,
              user,
              "Receita Lançada",
              `Lançou receita Automática de R$ ${order.total.toFixed(2)} pelo encerramento do pedido #${order.displayId}`,
              "finance"
            );
          }
        }
        
        addLocalAuditLog(
          currentState,
          user,
          `Status do Pedido`,
          `Alterou status do pedido #${order.displayId} para ${status}`,
          "info"
        );
        saveLocalState(currentState);
      }
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, user })
      });
      if (res.ok) {
        const body = await res.json();
        setState(body.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const payOrder = async (orderId: string, paymentMethod: "dinheiro" | "pix" | "credito" | "debito", user: string) => {
    if (isLocalFallbackMode) {
      const currentState = getInitialLocalState();
      const order = currentState.orders.find(o => o.id === orderId);
      if (order) {
        order.paymentMethod = paymentMethod;
        order.status = OrderStatus.FINALIZADO;
        order.completedAt = new Date().toISOString();
        
        if (currentState.caixaStatus.isOpen) {
          const txId = `tx-loc-${Date.now()}`;
          currentState.transactions.unshift({
            id: txId,
            type: "receita",
            category: "Vendas",
            description: `Venda ${order.type.toUpperCase()} #${order.displayId}`,
            amount: order.total,
            date: new Date().toISOString()
          });
          addLocalAuditLog(
            currentState,
            user,
            "Pagamento",
            `Recebeu R$ ${order.total.toFixed(2)} em ${paymentMethod.toUpperCase()} do pedido #${order.displayId}`,
            "finance"
          );
        } else {
          addLocalAuditLog(
            currentState,
            user,
            "Pagamento Feito",
            `Pedido #${order.displayId} de R$ ${order.total.toFixed(2)} pago no ${paymentMethod.toUpperCase()} (caixa estava fechado)`,
            "info"
          );
        }
        
        saveLocalState(currentState);
      }
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod, user })
      });
      if (res.ok) {
        const body = await res.json();
        setState(body.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveProduct = async (productData: any, user: string) => {
    if (isLocalFallbackMode) {
      const currentState = getInitialLocalState();
      if (productData.id) {
        // Edit
        const productIndex = currentState.products.findIndex(p => p.id === productData.id);
        if (productIndex !== -1) {
          currentState.products[productIndex] = { ...currentState.products[productIndex], ...productData };
          addLocalAuditLog(currentState, user, "Editar Produto", `Editou produto: ${productData.name}`, "info");
        }
      } else {
        // New
        const newProduct: Product = {
          id: `prod-loc-${Date.now()}`,
          name: productData.name,
          description: productData.description || "",
          category: productData.category || "lanches",
          price: Number(productData.price) || 0,
          image: productData.image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80",
          stock: Number(productData.stock) || 30,
          extras: productData.extras || [],
          popular: !!productData.popular
        };
        currentState.products.push(newProduct);
        addLocalAuditLog(currentState, user, "Criar Produto", `Criou produto: ${productData.name}`, "info");
      }
      saveLocalState(currentState);
      return;
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...productData, user })
      });
      if (res.ok) {
        const body = await res.json();
        setState(body.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProduct = async (productId: string, user: string) => {
    if (isLocalFallbackMode) {
      const currentState = getInitialLocalState();
      const itemToDelete = currentState.products.find(p => p.id === productId);
      if (itemToDelete) {
        currentState.products = currentState.products.filter(p => p.id !== productId);
        addLocalAuditLog(currentState, user, "Deletar Produto", `Deletou o produto: ${itemToDelete.name}`, "info");
        saveLocalState(currentState);
      }
      return;
    }

    try {
      const res = await fetch(`/api/products/${productId}?user=${encodeURIComponent(user)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        const body = await res.json();
        setState(body.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOrder = async (orderId: string, user: string) => {
    if (isLocalFallbackMode) {
      const currentState = getInitialLocalState();
      const orderToDelete = currentState.orders.find(o => o.id === orderId);
      if (orderToDelete) {
        currentState.orders = currentState.orders.filter(o => o.id !== orderId);
        addLocalAuditLog(currentState, user, "Deletar Pedido", `Deletou o pedido #${orderToDelete.displayId}`, "info");
        saveLocalState(currentState);
      }
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}?user=${encodeURIComponent(user)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        const body = await res.json();
        setState(body.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addTransaction = async (txData: {
    type: "receita" | "despesa";
    category: string;
    description: string;
    amount: number;
    user: string;
  }) => {
    if (isLocalFallbackMode) {
      const currentState = getInitialLocalState();
      const newTx: FinancialTransaction = {
        id: `tx-loc-${Date.now()}`,
        type: txData.type,
        category: txData.category,
        description: txData.description,
        amount: Number(txData.amount) || 0,
        date: new Date().toISOString()
      };
      currentState.transactions.unshift(newTx);
      addLocalAuditLog(
        currentState,
        txData.user || "Sistema",
        txData.type === "receita" ? "Receita Lançada" : "Despesa Lançada",
        `Lançamento manual de ${txData.type.toUpperCase()}: ${txData.description} - R$ ${txData.amount.toFixed(2)}`,
        "finance"
      );
      saveLocalState(currentState);
      return;
    }

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txData)
      });
      if (res.ok) {
        const body = await res.json();
        setState(body.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const simulateIFood = async (_simulateFailure: boolean, clientName?: string) => {
    if (isLocalFallbackMode) {
      const currentState = getInitialLocalState();
      const lastDisplayId = currentState.orders.length > 0 ? Math.max(...currentState.orders.map(o => o.displayId)) : 1000;
      const nextDisplayId = lastDisplayId + 1;
      const finalName = clientName || "Cliente iFood Teste";
      const originalId = "IFD-" + Math.floor(100000 + Math.random() * 900000);
      const deliveryFee = 6.00;
      const burger = currentState.products.find(p => p.category === "lanches") || seedProducts[0];
      const coca = currentState.products.find(p => p.id === "prod-6") || seedProducts[5];
      const total = Number((burger.price + coca.price + deliveryFee).toFixed(2));
      
      const newImportedOrder: Order = {
        id: `ord-ifd-${originalId}`,
        displayId: nextDisplayId,
        clientName: finalName,
        type: "ifood",
        items: [
          {
            product: burger,
            quantity: 1,
            selectedExtras: burger.extras && burger.extras.length > 0 ? [burger.extras[0]] : [],
            observation: "Pão bem selado"
          },
          {
            product: coca,
            quantity: 1,
            selectedExtras: [],
            observation: "Gelo e limão"
          }
        ],
        total: total,
        status: OrderStatus.NOVO,
        createdAt: new Date().toISOString(),
        ifoodDetails: {
          originalId: originalId,
          deliveryFee: deliveryFee,
          syncStatus: "COMPLETED"
        }
      };

      currentState.orders.unshift(newImportedOrder);
      addLocalAuditLog(
        currentState,
        "Sincronizador iFood",
        "Captura Automática",
        `Novo pedido iFood ${originalId} (#${nextDisplayId}) integrado com sucesso.`,
        "ifood"
      );
      saveLocalState(currentState);
      playAlertSound();
      return newImportedOrder;
    }

    try {
      const res = await fetch("/api/ifood/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulateFailure: _simulateFailure, clientName })
      });
      const body = await res.json();
      setState(body.data);
      return body.order;
    } catch (err) {
      console.error(err);
    }
  };

  const reprocessIFood = async (orderId: string, user: string) => {
    if (isLocalFallbackMode) {
      const currentState = getInitialLocalState();
      const order = currentState.orders.find(o => o.id === orderId);
      if (order && order.ifoodDetails) {
        order.ifoodDetails.syncStatus = "COMPLETED";
        addLocalAuditLog(currentState, user, "Reprocessar iFood", `Sincronização refeita para o pedido ${order.ifoodDetails.originalId}`, "ifood");
        saveLocalState(currentState);
      }
      return;
    }

    try {
      const res = await fetch(`/api/ifood/reprocess/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user })
      });
      if (res.ok) {
        const body = await res.json();
        setState(body.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pollNowIFood = async () => {
    if (isLocalFallbackMode) {
      // Create random simulation order
      const clientNames = ["Renan Ramos", "Mariana Costa", "Rodrigo Azevedo", "Fernanda Bento", "Arthur Santos"];
      const chosenName = clientNames[Math.floor(Math.random() * clientNames.length)];
      await simulateIFood(false, chosenName);
      return { success: true, count: 1, eventsChecked: 1 };
    }

    try {
      const res = await fetch("/api/ifood/poll-now", {
        method: "POST"
      });
      if (res.ok) {
        const body = await res.json();
        setState(body.data);
        return body.result;
      }
    } catch (err) {
      console.error(err);
    }
    return { success: false, error: "Erro de rede" };
  };

  const resetStore = async () => {
    if (isLocalFallbackMode) {
      localStorage.removeItem("sistema_360_state");
      const localData = getInitialLocalState();
      setState(localData);
      return;
    }

    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        const body = await res.json();
        setState(body.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return {
    state,
    loading,
    error,
    toggleCaixa,
    addOrder,
    updateOrderStatus,
    payOrder,
    saveProduct,
    deleteProduct,
    deleteOrder,
    addTransaction,
    simulateIFood,
    reprocessIFood,
    pollNowIFood,
    resetStore,
    triggerManualRefresh: fetchState,
    playAlertSound,
    isLocalMode: isLocalFallbackMode
  };
}
