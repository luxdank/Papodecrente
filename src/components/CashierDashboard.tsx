/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Order, OrderStatus, Product, FinancialTransaction } from "../types";
import { 
  Printer, 
  Check, 
  X, 
  TrendingUp, 
  PlusCircle, 
  MinusCircle, 
  ShoppingCart, 
  FileText, 
  DollarSign, 
  LogOut,
  Sparkles,
  CreditCard,
  Percent,
  Calculator,
  User,
  Coffee,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  MessageSquare,
  Send,
  Smartphone,
  MessageCircle,
  Wifi
} from "lucide-react";

interface CashierDashboardProps {
  orders: Order[];
  products: Product[];
  transactions: FinancialTransaction[];
  caixaStatus?: {
    isOpen: boolean;
    openedAt: string | null;
    closedAt: string | null;
    initialBalance: number;
  };
  onToggleCaixa?: (open: boolean, initialBalance: number) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onAddManualOrder: (orderData: {
    clientName: string;
    type: "balcao" | "ifood" | "qrcode";
    items: any[];
    paymentMethod: string;
    tableNum?: string;
  }) => void;
  onAddFinanceTransaction: (tx: {
    type: "entrada" | "saida" | "sangria" | "suprimento";
    amount: number;
    description: string;
    paymentMethod: string;
  }) => void;
  onLogout: () => void;
  currentUser: string;
  onPollNowIFood?: () => Promise<any>;
  onDeleteOrder: (orderId: string) => void;
  isLocalMode?: boolean;
  onToggleLocalMode?: (val: boolean) => void;
}

export function CashierDashboard({
  orders,
  products,
  transactions,
  caixaStatus,
  onToggleCaixa,
  onUpdateOrderStatus,
  onAddManualOrder,
  onAddFinanceTransaction,
  onLogout,
  currentUser,
  onPollNowIFood,
  onDeleteOrder,
  isLocalMode = false,
  onToggleLocalMode
}: CashierDashboardProps) {
  
// Tab control inner cashier
  const [cashierTab, setCashierTab] = useState<"comandas" | "novo_pedido" | "caixa_financeiro" | "whatsapp_crm">("comandas");

  // WhatsApp CRM Integration States
  const [chats, setChats] = useState([
    {
      id: "chat-1",
      name: "Lucas Costa (Mesa 03)",
      phone: "+55 (11) 98765-4321",
      avatar: "🍔",
      unread: 2,
      lastSeen: "Online",
      messages: [
        { sender: "client", text: "Olá! Acabei de fazer um pedido por QR Code na Mesa 3.", time: "16:45" },
        { sender: "chatbot", text: "Olá Lucas Costa! Recebemos seu pedido por QR Code com sucesso! 👍 Ele está no status: *CONFIRMADO* e já foi enviado para a cozinha para preparo. Deseja acompanhar por aqui?", time: "16:45" },
        { sender: "client", text: "Sim, por favor! Consigo adicionar um refrigerante de última hora por aqui?", time: "16:46" },
        { sender: "client", text: "Ou tem que ser pelo menu digital de novo?", time: "16:47" }
      ]
    },
    {
      id: "chat-2",
      name: "Mariana Silva (Delivery)",
      phone: "+55 (21) 99123-4567",
      avatar: "🛍️",
      unread: 1,
      lastSeen: "Visto por último hoje às 16:30",
      messages: [
        { sender: "client", text: "Boa tarde, o meu pedido do iFood já foi entregue?", time: "16:15" },
        { sender: "operator", text: "Olá Mariana! Verifiquei aqui e o entregador parceiro já retirou seu lanche e está a caminho de sua residência! Estimativa de 8 minutos.", time: "16:18" },
        { sender: "client", text: "Perfeito! Muito obrigada pelo excelente atendimento. 🚀", time: "16:20" }
      ]
    },
    {
      id: "chat-3",
      name: "Carlos Eduardo (Balcão)",
      phone: "+55 (19) 98111-2222",
      avatar: "🥤",
      unread: 0,
      lastSeen: "Online",
      messages: [
        { sender: "client", text: "Olá! Gostaria de uma ajudinha. Qual o Hambúrguer mais vendido da casa?", time: "15:10" },
        { sender: "chatbot", text: "Olá Carlos Eduardo! O campeão absoluto de vendas é o maravilhoso *Smash Bacon Crispy*! 🍔 Pão de brioche amanteigado, blend de 150g, muito cheddar e farofa de bacon crocante. Uma delícia!", time: "15:10" },
        { sender: "client", text: "Caramba, vou pedir um desse então!", time: "15:12" },
        { sender: "chatbot", text: "Excelente escolha! Clique no menu ou faça seu pedido direto aqui de balcão.", time: "15:12" }
      ]
    }
  ]);
  const [selectedChatId, setSelectedChatId] = useState("chat-1");
  const [chatInputText, setChatInputText] = useState("");
  const [isChatbotActive, setIsChatbotActive] = useState(true);
  
  // Custom mock client message generator
  const [mockUserMessage, setMockUserMessage] = useState("");
  const [mockUserName, setMockUserName] = useState("Rafael Lima");

  const handleSendChatText = (textToSend?: string) => {
    const text = textToSend || chatInputText;
    if (!text.trim()) return;

    // Find the current active chat
    const updatedChats = chats.map(chat => {
      if (chat.id === selectedChatId) {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const newMsg = { sender: "operator", text: text, time: timeStr };
        return {
          ...chat,
          unread: 0,
          messages: [...chat.messages, newMsg]
        };
      }
      return chat;
    });

    setChats(updatedChats);
    if (!textToSend) setChatInputText("");

    // Simulate smart client reply after 1.5 seconds if chatbot is active
    if (isChatbotActive) {
      setTimeout(() => {
        setChats(prevChats => {
          return prevChats.map(chat => {
            if (chat.id === selectedChatId) {
              const now = new Date();
              const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
              
              // Simple keyword chatbot router
              let replyText = "Entendido! O operador do caixa foi sinalizado e irá lhe atender pessoalmente em instantes. 🤝";
              const cleanText = text.toLowerCase();
              if (cleanText.includes("cardapio") || cleanText.includes("link") || cleanText.includes("menu")) {
                replyText = "Claro! Nosso menu digital atualizado pode ser acessado em: *https://ai.studio/build/lounge360* 📱. Use o cupom *CUPOM10* para garantir 10% de desconto no seu seu primeiro pedido pelo QR Code!";
              } else if (cleanText.includes("cupom") || cleanText.includes("desconto")) {
                replyText = "Temos cupons de desconto ativos para pedidos e mesas digitais! Insira *CUPOM10* no carrinho para garantir 10% de desconto imediato! 🤑";
              } else if (cleanText.includes("status") || cleanText.includes("pedido") || cleanText.includes("cozinha")) {
                replyText = "Seu pedido de hoje está sendo acompanhado em nosso painel 360 com o status *CONFIRMADO/EM PREPARO* e segue o fluxo prioritário! Fique tranquilo que está quase pronto. 🍔🎉";
              }

              return {
                ...chat,
                messages: [...chat.messages, { sender: "chatbot", text: replyText, time: timeStr }]
              };
            }
            return chat;
          });
        });
      }, 1200);
    }
  };

  const handleSimulateClientMsg = () => {
    if (!mockUserMessage.trim()) return;
    
    // Find if the mock client already has a chat or find active
    const targetChat = chats.find(c => c.name.toLowerCase().includes(mockUserName.toLowerCase()));
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (targetChat) {
      // Add message to existing chat
      setChats(chats.map(c => {
        if (c.id === targetChat.id) {
          return {
            ...c,
            unread: c.unread + 1,
            messages: [...c.messages, { sender: "client", text: mockUserMessage, time: timeStr }]
          };
        }
        return c;
      }));
      setSelectedChatId(targetChat.id);
    } else {
      // Create new chat
      const newChatId = `chat-mock-${Date.now()}`;
      const newChat = {
        id: newChatId,
        name: `${mockUserName} (WhatsApp)`,
        phone: "+55 (11) 9" + Math.floor(10000000 + Math.random() * 90000000),
        avatar: "👤",
        unread: 1,
        lastSeen: "Online",
        messages: [{ sender: "client", text: mockUserMessage, time: timeStr }]
      };
      setChats([...chats, newChat]);
      setSelectedChatId(newChatId);
    }

    const currentMsgText = mockUserMessage;
    setMockUserMessage("");

    // Simulate smart chatbot reply immediately after if active!
    if (isChatbotActive) {
      setTimeout(() => {
        setChats(prevChats => {
          return prevChats.map(c => {
            const isMatch = targetChat ? c.id === targetChat.id : c.name.toLowerCase().includes(mockUserName.toLowerCase());
            if (isMatch) {
              let botReply = `Olá ${mockUserName}! Seja muito bem-vindo à Lounge & Burgueria 360! 🍔\nComo podemos te ajudar hoje? Digite *cardapio* para receber nosso menu ou *status* para acompanhar seu pedido!`;
              const query = currentMsgText.toLowerCase();
              if (query.includes("cardapio") || query.includes("link") || query.includes("menu") || query.includes("comer")) {
                botReply = "Claro! Nosso menu digital atualizado pode ser acessado em: *https://ai.studio/build/lounge360* 📱. Use o cupom *CUPOM10* para garantir 10% de desconto no seu seu primeiro pedido pelo QR Code!";
              } else if (query.includes("pedido") || query.includes("status") || query.includes("meu order")) {
                botReply = "Ótima pergunta! Seus pedidos ativos são monitorados em tempo real na nossa cozinha 360. Atualmente temos comandas no preparo acelerado e seu pedido será notificado aqui assim que sair!";
              } else if (query.includes("cupom") || query.includes("desconto") || query.includes("promo")) {
                botReply = "Temos o cupom especial *CUPOM10* disponível! Use no menu digital para economizar 10% nas mesas digitais! 💵";
              }
              return {
                ...c,
                messages: [...c.messages, { sender: "chatbot", text: botReply, time: timeStr }]
              };
            }
            return Math.abs(1) > 0 ? c : c; // return identity safe
          });
        });
      }, 1500);
    }
  };

  // State for manual order creation
  const [manualClient, setManualClient] = useState("");
  const [manualType, setManualType] = useState<"balcao" | "ifood">("balcao");
  const [manualPayment, setManualPayment] = useState("pix");
  const [selectedItems, setSelectedItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [itemObservation, setItemObservation] = useState("");

  const [cashierSyncLoading, setCashierSyncLoading] = useState(false);
  const handleCashierSync = async () => {
    if (!onPollNowIFood) return;
    setCashierSyncLoading(true);
    try {
      const res = await onPollNowIFood();
      if (res && res.success) {
        alert(`Sincronização iFood Concluída!\n- Eventos analisados: ${res.eventsChecked || 0}\n- Novos pedidos integrados: ${res.count || 0}`);
      } else {
        alert(`Falha ao sincronizar: ${res?.error || res?.reason || "Erro de conexão"}`);
      }
    } catch (err: any) {
      alert("Erro na API iFood: " + err.message);
    } finally {
      setCashierSyncLoading(false);
    }
  };

  // Cash addition / removal inputs (Sangria / Suprimento)
  const [txType, setTxType] = useState<"sangria" | "suprimento">("sangria");
  const [txAmount, setTxAmount] = useState("");
  const [txReason, setTxReason] = useState("");

  // Open / Close Day (Caixa) UI states
  const [isOpenDayModalOpen, setIsOpenDayModalOpen] = useState(false);
  const [isCloseDayModalOpen, setIsCloseDayModalOpen] = useState(false);
  const [initialBalanceForm, setInitialBalanceForm] = useState("150.00");

  // Paper thermal receipt simulation overlay
  const [ticketOrder, setTicketOrder] = useState<Order | null>(null);

  // Custom modal for confirming order deletion
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Math totals for cashier layout
  const getOrderTotal = (order: Order) => {
    return order.items.reduce((sum, item) => {
      const extrasSum = item.selectedExtras?.reduce((s, e) => s + e.price, 0) || 0;
      return sum + (item.product.price + extrasSum) * item.quantity;
    }, 0);
  };

  // Get dynamic breakdown of payment methods
  const salesByPix = orders.filter(o => (o.status === OrderStatus.FINALIZADO || o.status === OrderStatus.ENTREGUE) && o.paymentMethod && o.paymentMethod.toLowerCase() === "pix").reduce((a, b) => a + getOrderTotal(b), 0);
  const salesByCard = orders.filter(o => (o.status === OrderStatus.FINALIZADO || o.status === OrderStatus.ENTREGUE) && o.paymentMethod && (o.paymentMethod.toLowerCase() === "credito" || o.paymentMethod.toLowerCase() === "debito")).reduce((a, b) => a + getOrderTotal(b), 0);
  const salesByCash = orders.filter(o => (o.status === OrderStatus.FINALIZADO || o.status === OrderStatus.ENTREGUE) && o.paymentMethod && o.paymentMethod.toLowerCase() === "dinheiro").reduce((a, b) => a + getOrderTotal(b), 0);
  
  // Handlers for manual cashier inputs
  const addProductToManualOrder = (product: Product) => {
    const existing = selectedItems.find(item => item.product.id === product.id);
    if (existing) {
      setSelectedItems(selectedItems.map(item => 
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setSelectedItems([...selectedItems, { product, quantity: 1 }]);
    }
  };

  const decreaseProductManual = (productId: string) => {
    const existing = selectedItems.find(item => item.product.id === productId);
    if (existing && existing.quantity > 1) {
      setSelectedItems(selectedItems.map(item =>
        item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      ));
    } else {
      setSelectedItems(selectedItems.filter(item => item.product.id !== productId));
    }
  };

  // Submit manual POS cashier comanda
  const handleCreateComanda = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert("Adicione pelo menos 1 item na comanda!");
      return;
    }

    const mappedItems = selectedItems.map(item => ({
      product: { id: item.product.id, name: item.product.name, price: item.product.price },
      quantity: item.quantity,
      selectedExtras: [],
      observation: itemObservation
    }));

    onAddManualOrder({
      clientName: manualClient.trim() || "Cliente Balcão",
      type: manualType,
      items: mappedItems,
      paymentMethod: manualPayment
    });

    // Reset fields
    setManualClient("");
    setSelectedItems([]);
    setItemObservation("");
    setCashierTab("comandas");
    alert("Comanda emitida com sucesso!");
  };

  // Submit Sangria / Suprimento
  const handleRegisterTx = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(txAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Insira um valor financeiro válido!");
      return;
    }

    onAddFinanceTransaction({
      type: txType,
      amount: parsedAmount,
      description: txReason.trim() || `${txType === "sangria" ? "Retirada" : "Injeção"} manual no caixa`,
      paymentMethod: "dinheiro"
    });

    setTxAmount("");
    setTxReason("");
    alert(`${txType === "sangria" ? "Sangria" : "Suprimento"} registrado com sucesso no caixa!`);
  };

  // Calculate manual order subtotal
  const manualSubtotal = selectedItems.reduce((acc, current) => {
    return acc + (current.product.price * current.quantity);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans" id="cashier-root">
      
      {/* Top Action Ribbon */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          
          <div className="flex items-center gap-2.5">
            <div className="bg-orange-500 p-2 rounded-xl text-white">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xxs uppercase tracking-wider text-amber-400 font-extrabold block">PAINEL OPERACIONAL DOCS</span>
              <h1 className="text-sm font-black text-white">Operador de Caixa: {currentUser}</h1>
            </div>
          </div>

          {/* Quick Stats Panel inline */}
          <div className="hidden lg:flex items-center gap-6 text-xxs text-slate-300">
            <div className="font-mono">
              <span className="text-slate-400 block uppercase font-bold">PIX Hoje</span>
              <span className="font-black text-emerald-400 block mt-0.5">R$ {salesByPix.toFixed(2)}</span>
            </div>
            <div className="font-mono">
              <span className="text-slate-400 block uppercase font-bold">DINHEIRO</span>
              <span className="font-black text-amber-500 block mt-0.5">R$ {salesByCash.toFixed(2)}</span>
            </div>
            <div className="font-mono">
              <span className="text-slate-400 block uppercase font-bold">CARTÕES</span>
              <span className="font-black text-blue-400 block mt-0.5">R$ {salesByCard.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Connection Mode Toggler */}
            <div className="flex items-center gap-2 bg-slate-950/45 px-3 py-1.5 rounded-2xl border border-slate-750">
              <Wifi className={`w-3.5 h-3.5 ${isLocalMode ? "text-amber-500" : "text-emerald-500 animate-pulse"}`} />
              <div className="text-left">
                <span className="text-[8px] uppercase tracking-wider text-slate-450 block font-bold leading-none">Conectividade</span>
                <span className="text-[10px] font-black text-white leading-none">
                  {isLocalMode ? "MODO SIMULADO (OFFLINE)" : "INTEGRADOR LIVE (PROD)"}
                </span>
              </div>
              {onToggleLocalMode && (
                <button
                  type="button"
                  onClick={() => onToggleLocalMode(!isLocalMode)}
                  className={`ml-1.5 py-1 px-2 rounded-md text-[9px] font-black uppercase transition cursor-pointer shrink-0 ${
                    isLocalMode 
                      ? "bg-amber-600 hover:bg-amber-500 text-white animate-pulse" 
                      : "bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700"
                  }`}
                  title={isLocalMode ? "Desativar demonstração e usar banco de dados real com as integrações ligadas" : "Ativar modo off-line local de teste"}
                >
                  {isLocalMode ? "Ativar Produção" : "Usar Demo"}
                </button>
              )}
            </div>

            {/* Status do Dia (Caixa) */}
            <div className="flex items-center gap-2 bg-slate-950/45 px-3 py-1.5 rounded-2xl border border-slate-700/50">
              <div className={`w-2 h-2 rounded-full shrink-0 ${caixaStatus?.isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
              <div className="text-left">
                <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-bold leading-none">Status de Operação</span>
                <span className="text-[10px] font-black text-white leading-none">
                  {caixaStatus?.isOpen ? "DIA ABERTO (OPERANDO)" : "DIA FECHADO"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (caixaStatus?.isOpen) {
                    setIsCloseDayModalOpen(true);
                  } else {
                    setIsOpenDayModalOpen(true);
                  }
                }}
                className={`ml-1.5 flex items-center gap-1 py-1 px-2 rounded-md text-[9px] font-bold uppercase transition cursor-pointer shrink-0 ${
                  caixaStatus?.isOpen 
                    ? "bg-slate-850 hover:bg-slate-800 text-rose-450 border border-slate-700/50" 
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {caixaStatus?.isOpen ? (
                  <>
                    <Lock className="w-2.5 h-2.5" /> Fechar Dia
                  </>
                ) : (
                  <>
                    <Unlock className="w-2.5 h-2.5" /> Abrir o Dia
                  </>
                )}
              </button>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-red-950/50 hover:bg-red-900 border border-red-800/40 text-red-100 text-xxs py-1.5 px-3 rounded-xl font-bold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Fazer Logout
            </button>
          </div>

        </div>
      </header>

      {/* Internal Tabs Navigator */}
      <div className="bg-slate-800 text-white border-b border-slate-700 px-4 py-2">
        <div className="max-w-7xl mx-auto flex gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap pb-1 lg:pb-0">
          <button
            onClick={() => setCashierTab("comandas")}
            className={`py-2 px-4 rounded-lg text-xxs font-black uppercase tracking-wider transition shrink-0 cursor-pointer ${cashierTab === "comandas" ? "bg-slate-900 text-orange-400 border border-slate-705" : "bg-slate-800 text-slate-300 hover:text-white"}`}
          >
            📋 Monitor de Comandas ({orders.filter(o => o.status !== OrderStatus.FINALIZADO && o.status !== OrderStatus.ENTREGUE && o.status !== OrderStatus.CANCELADO).length})
          </button>
          <button
            onClick={() => setCashierTab("novo_pedido")}
            className={`py-2 px-4 rounded-lg text-xxs font-black uppercase tracking-wider transition shrink-0 cursor-pointer ${cashierTab === "novo_pedido" ? "bg-slate-900 text-orange-400 border border-slate-705" : "bg-slate-800 text-slate-300 hover:text-white"}`}
          >
            ➕ Comanda Manual (Frente-Caixa)
          </button>
          <button
            onClick={() => setCashierTab("caixa_financeiro")}
            className={`py-2 px-4 rounded-lg text-xxs font-black uppercase tracking-wider transition shrink-0 cursor-pointer ${cashierTab === "caixa_financeiro" ? "bg-slate-900 text-orange-400 border border-slate-705" : "bg-slate-800 text-slate-300 hover:text-white"}`}
          >
            💸 Livro Caixa & Controles Térmicos
          </button>
          <button
            onClick={() => setCashierTab("whatsapp_crm")}
            className={`py-2 px-4 rounded-lg text-xxs font-black uppercase tracking-wider transition shrink-0 cursor-pointer border ${cashierTab === "whatsapp_crm" ? "bg-slate-900 text-emerald-400 border-emerald-500/30" : "bg-slate-850 text-slate-300 hover:text-white border-transparent"}`}
          >
            💬 WhatsApp CRM & Chatbot
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4">
        
        {!caixaStatus?.isOpen && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 text-slate-900 p-2 rounded-xl shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black text-slate-950 uppercase tracking-tight">O Dia de Trabalho está Fechado</h4>
                <p className="text-xxs text-slate-600 leading-normal">
                  Para registrar pedidos manuais, realizar sangrias ou suprimentos, ou sincronizar comandas de balcão e iFood, por favor abra o caixa.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpenDayModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xxs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm inline-flex items-center gap-2 shrink-0 border border-amber-400"
            >
              <Unlock className="w-3 h-3" /> Abrir o Dia de Trabalho
            </button>
          </div>
        )}
        
        {/* VIEW 1: MONITOR DE COMANDAS */}
        {cashierTab === "comandas" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="cashier-monitor-layout">
            
            {/* Left Col: Pending digital or iFood approvals needs approval */}
            <div className="xl:col-span-2 space-y-4">
              <div className="bg-white border rounded-2xl p-4 shadow-sm">
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                  <span>🍔 Comandas Ativas de Produção</span>
                  <div className="flex items-center gap-2">
                    {onPollNowIFood && (
                      <button
                        onClick={handleCashierSync}
                        disabled={cashierSyncLoading}
                        title="Buscar novos pedidos no iFood"
                        className="text-xxxxs bg-orange-100 hover:bg-orange-200 disabled:bg-slate-100 disabled:text-slate-400 text-orange-850 font-black px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1 transition shadow-xs"
                      >
                        {cashierSyncLoading ? (
                          <span className="animate-spin text-orange-650 border border-t-transparent border-orange-550 rounded-full w-2 h-2"></span>
                        ) : "🔄"} Sincronizar iFood
                      </button>
                    )}
                    <span className="text-xxs text-amber-600 bg-amber-50 py-0.5 px-2 rounded-full font-bold">Fila Interna + iFood</span>
                  </div>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orders.filter(o => o.status !== OrderStatus.FINALIZADO && o.status !== OrderStatus.ENTREGUE && o.status !== OrderStatus.CANCELADO).map((order) => {
                    const isAwaitingApproval = order.type === "ifood" && order.status === OrderStatus.NOVO;
                    const isReadyToDeliver = order.status === OrderStatus.PRONTO;
                    
                    return (
                      <div 
                        key={order.id} 
                        className={`border rounded-2.5xl p-4 flex flex-col justify-between transition ${isReadyToDeliver ? "border-emerald-500/40 bg-emerald-50/20" : isAwaitingApproval ? "border-amber-500/50 bg-amber-550/5 animate-pulse" : "bg-white"}`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <span className="font-extrabold text-xs block text-slate-900 capitalize">#{order.displayId} &bull; {order.clientName}</span>
                              <span className="text-xxxxs uppercase tracking-widest font-black block text-slate-400">
                                {order.type === "ifood" ? "🚲 Delivery iFood" : order.type === "qrcode" ? `📱 QR Mesa ${order.tableNum || ""}` : "🛍️ Balcão Presencial"}
                              </span>
                            </div>
                            <span className={`py-0.5 px-2 rounded font-black text-xxxxs uppercase tracking-wider ${isReadyToDeliver ? "bg-emerald-500/10 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                              Status: {order.status}
                            </span>
                          </div>

                          {/* Items table */}
                          <div className="my-3 py-2 border-t border-b border-slate-100 space-y-1">
                            {order.items.map((item, id) => (
                              <div key={id} className="text-xxs flex justify-between">
                                <span className="text-slate-700"><span className="font-bold text-slate-900">{item.quantity}x</span> {item.product.name}</span>
                                <span className="font-bold font-sans">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive operational dispatch actions */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100/60 flex items-center justify-between gap-1.5 flex-wrap">
                          <span className="text-xs font-black font-sans text-slate-900">R$ {getOrderTotal(order).toFixed(2)} ({order.paymentMethod?.toUpperCase() || "N/A"})</span>
                          
                          <div className="flex items-center gap-1">
                            {/* Sound/Thermal print simulator button */}
                            <button
                              onClick={() => setTicketOrder(order)}
                              className="bg-slate-105 hover:bg-slate-200 border text-slate-600 p-1.5 rounded-lg"
                              title="Simular Impressão Cupom"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* WhatsApp Direct Dispatch template button */}
                            <button
                              type="button"
                              onClick={() => {
                                const phoneNumber = "5511999999999";
                                const formattedText = encodeURIComponent(
                                  `*Lounge & Burgueria 360* 🍔\n\nOlá, *${order.clientName}*!\nSeu pedido *#${order.displayId}* (${order.type === 'ifood' ? 'Delivery iFood' : 'Mesa ' + (order.tableNum || 'Balcão')}) está atualmente: *${order.status}*!\n\n*📋 Detalhes do seu Pedido:*\n${order.items.map(item => `- ${item.quantity}x ${item.product.name}`).join('\n')}\n*Total:* R$ ${getOrderTotal(order).toFixed(2)}\n\nAgradecemos imensamente a preferência! Se precisar de algo, nos chame. 😊`
                                );
                                window.open(`https://api.whatsapp.com/send?phone=${phoneNumber}&text=${formattedText}`, '_blank');
                              }}
                              className="bg-emerald-55 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-650 p-1.5 rounded-lg cursor-pointer flex items-center justify-center"
                              title="Disparar Status Real via WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete/Exclude order button with custom modal confirm */}
                            <button
                              onClick={() => setOrderToDelete(order)}
                              className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 p-1.5 rounded-lg cursor-pointer"
                              title="Excluir Pedido Definitivamente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {isAwaitingApproval ? (
                              <>
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, OrderStatus.EM_PREPARO)}
                                  className="bg-emerald-600 hover:bg-emerald-555 text-white font-extrabold text-xxxxs py-1.5 px-2.5 rounded-lg uppercase tracking-wider"
                                >
                                  Aceitar iFood
                                </button>
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, OrderStatus.CANCELADO)}
                                  className="bg-red-100 text-red-650 hover:bg-red-200 font-extrabold text-xxxxs py-1.5 px-2 rounded-lg"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : isReadyToDeliver ? (
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, OrderStatus.FINALIZADO)}
                                className="bg-emerald-600 hover:bg-emerald-555 text-white font-extrabold text-xxxxs py-1.5 px-3 rounded-lg uppercase tracking-widest flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Despachar (Entregue)
                              </button>
                            ) : (
                              <span className="text-xxxxs text-slate-400 italic">Preparo na cozinha...</span>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {orders.filter(o => o.status !== OrderStatus.FINALIZADO && o.status !== OrderStatus.ENTREGUE && o.status !== OrderStatus.CANCELADO).length === 0 && (
                    <div className="col-span-2 text-center py-10 border border-dashed rounded-2xl bg-slate-50">
                      <Coffee className="w-8 h-8 text-slate-405 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 font-medium">Nenhum pedido em aberto. Caixa pronto!</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Right Col: Instant physical metrics counter */}
            <div>
              <div className="bg-gradient-to-tr from-slate-905 to-slate-900 text-white rounded-3xl p-5 shadow-lg space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-xxs uppercase tracking-wider text-orange-400 font-bold">FECHAMENTO DIPLOMA</span>
                  <span className="text-xxxxs uppercase font-black bg-emerald-600 py-0.5 px-2 rounded">Aberto</span>
                </div>

                <div>
                  <span className="text-xxxxs uppercase font-bold text-slate-450">Faturamento Entregue</span>
                  <div className="text-2xl font-black font-sans text-white mt-0.5">R$ {(salesByPix + salesByCash + salesByCard).toFixed(2)}</div>
                </div>

                <div className="space-y-2 py-3 border-t border-b border-white/5 text-xxs font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span>Pix Registrados:</span>
                    <span className="text-white font-bold">R$ {salesByPix.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dinheiro em Mão:</span>
                    <span className="text-white font-bold font-sans">R$ {salesByCash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cartão Crédito/Débito:</span>
                    <span className="text-white font-bold">R$ {salesByCard.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xxxxs uppercase font-bold text-slate-450 block mb-2">Simulação de Fluxo</span>
                  <button
                    onClick={() => {
                      alert("Impressão Geral consolidada para fiscalização enviada para impressora padrão.");
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-750 text-white font-bold py-2 rounded-xl text-xxs flex items-center justify-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-orange-450" /> Consolidar Relatório Operador
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: NOVO PEDIDO MANUAL */}
        {cashierTab === "novo_pedido" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="cashier-manual-pos">
            
            {/* Products grid selector */}
            <div className="lg:col-span-2 bg-white border rounded-2.5xl p-4 shadow-sm">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3">Selecione os produtos para comanda rápida</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => addProductToManualOrder(p)}
                    className="border hover:border-orange-500 rounded-xl p-2.5 flex flex-col justify-between cursor-pointer hover:shadow-xs transition bg-slate-50/50"
                  >
                    <div className="flex gap-2 items-center">
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-cover rounded-lg shrink-0 bg-white"
                      />
                      <span className="text-xxs font-bold text-slate-900 leading-tight line-clamp-2">{p.name}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                      <span className="text-xxs font-black text-slate-800">R$ {p.price.toFixed(2)}</span>
                      <span className="text-xxxxs bg-orange-100 text-orange-800 font-extrabold px-1 rounded">+</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill calculator / Checkout details */}
            <div className="bg-white border rounded-2.5xl p-4 shadow-sm">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-650 border-b pb-2 mb-3">Comanda de Caixa</h3>
              
              <form onSubmit={handleCreateComanda} className="space-y-4">
                
                <div>
                  <label className="block text-xxxxs uppercase font-black tracking-wider text-slate-500 mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    required
                    value={manualClient}
                    onChange={(e) => setManualClient(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full text-xs font-bold border py-2 px-3 rounded-lg bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xxxxs uppercase font-black tracking-wider text-slate-500 mb-1">Origem do Pedido</label>
                  <select
                    value={manualType}
                    onChange={(e: any) => setManualType(e.target.value)}
                    className="w-full text-xs font-bold border py-2 px-2 rounded-lg bg-slate-50"
                  >
                    <option value="balcao">🛍️ Retirada no Balcão</option>
                    <option value="ifood">🚲 Simulação Delivery iFood</option>
                  </select>
                </div>

                {/* Items selection display */}
                <div className="space-y-1.5 border-t border-b py-3 max-h-48 overflow-y-auto">
                  <span className="block text-xxxxs uppercase font-black text-slate-400">Itens Adicionados ({selectedItems.length})</span>
                  {selectedItems.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center text-xxs bg-slate-50 p-2 rounded-xl border">
                      <span className="truncate max-w-[120px] font-bold">{item.product.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decreaseProductManual(item.product.id)}
                          className="bg-slate-200 hover:bg-slate-350 font-black rounded-lg w-7 h-7 flex items-center justify-center text-xs cursor-pointer text-slate-800"
                        >
                          -
                        </button>
                        <span className="font-mono text-slate-900 font-extrabold text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => addProductToManualOrder(item.product)}
                          className="bg-slate-200 hover:bg-slate-350 font-black rounded-lg w-7 h-7 flex items-center justify-center text-xs cursor-pointer text-slate-805"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}

                  {selectedItems.length === 0 && (
                    <p className="text-xxs text-slate-400 italic text-center py-4">Nenhum hambúrguer adicionado ainda.</p>
                  )}
                </div>

                {/* Observations input details */}
                <div>
                  <label className="block text-xxxxs uppercase font-black tracking-wider text-slate-405 mb-1">Instruções Prato / Cozinha</label>
                  <input
                    type="text"
                    value={itemObservation}
                    onChange={(e) => setItemObservation(e.target.value)}
                    placeholder="Sem cebola, pão bem passado..."
                    className="w-full text-xxs border py-2 px-3 rounded-lg bg-slate-50"
                  />
                </div>

                {/* Payment Selector */}
                <div>
                  <label className="block text-xxxxs uppercase font-black tracking-wider text-slate-405 mb-1">Método de Cobrança</label>
                  <select
                    value={manualPayment}
                    onChange={(e) => setManualPayment(e.target.value)}
                    className="w-full text-xs font-bold border py-2 px-2 rounded-lg bg-slate-50"
                  >
                    <option value="pix">PIX</option>
                    <option value="dinheiro">Dinheiro (Cédula)</option>
                    <option value="credito">Corte Crédito</option>
                    <option value="debito">Corte Débito</option>
                  </select>
                </div>

                <div className="border-t pt-3 flex justify-between items-center text-xs font-black">
                  <span>SUBTOTAL POS:</span>
                  <span className="text-orange-600 font-sans text-sm">R$ {manualSubtotal.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xxs uppercase tracking-wider transition cursor-pointer"
                >
                  Emitir Comanda Direta para Cozinha
                </button>

              </form>
            </div>

          </div>
        )}

        {/* VIEW 3: INGRESSO LIVRO CAIXA & AUDIT */}
        {cashierTab === "caixa_financeiro" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="cashier-finance-book">
            
            {/* Input transaction form */}
            <div className="bg-white border rounded-2.5xl p-4 shadow-sm">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1">
                <MinusCircle className="w-4 h-4 text-orange-500 animate-pulse" /> Registro Sangria & Suprimentos
              </h3>

              <form onSubmit={handleRegisterTx} className="space-y-4">
                
                <div>
                  <label className="block text-xxxxs uppercase font-black tracking-wider text-slate-500 mb-1">Tipo de Movimentação</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTxType("sangria")}
                      className={`py-2 border rounded-xl text-xxs font-bold text-center ${txType === "sangria" ? "border-red-500 bg-red-550/5 text-red-750" : "bg-slate-50"}`}
                    >
                      Sangria 💸 (Retirar Dinheiro)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType("suprimento")}
                      className={`py-2 border rounded-xl text-xxs font-bold text-center ${txType === "suprimento" ? "border-emerald-500 bg-emerald-555/5 text-emerald-850" : "bg-slate-50"}`}
                    >
                      Suprimento 💰 (Injetar Moeda)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xxxxs uppercase font-black tracking-wider text-slate-500 mb-1">Valor do Lançamento</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 150.00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full text-xs font-bold border py-2 px-3 rounded-lg bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xxxxs uppercase font-black tracking-wider text-slate-500 mb-1">Motivação / Justificativa</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: compra de sacolas de papel, troco inicial"
                    value={txReason}
                    onChange={(e) => setTxReason(e.target.value)}
                    className="w-full text-xxs border py-2 px-3 rounded-lg bg-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xxs uppercase tracking-wider transition"
                >
                  Confirmar Registro em Comprovante
                </button>

              </form>
            </div>

            {/* List transactions ledger */}
            <div className="lg:col-span-2 bg-white border rounded-2.5xl p-4 shadow-sm">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-500 mb-3">Histórico de Ajustes de Caixa</h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {transactions.map((tx) => (
                  <div key={tx.id} className="border-b pb-2 text-xxs flex justify-between items-center">
                    <div>
                      <span className={`inline-block px-1.5 py-0.5 rounded font-black uppercase text-xxxxs mr-2 ${tx.category === "Sangria" ? "bg-red-100 text-red-700" : tx.category === "Suprimento" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                        {tx.category || tx.type}
                      </span>
                      <span className="font-bold text-slate-800">{tx.description}</span>
                      <span className="text-xxxxs block text-slate-400 mt-0.5">{new Date(tx.date).toLocaleString()}</span>
                    </div>
                    <span className={`font-mono font-black text-xs ${tx.type === "despesa" || tx.category === "Sangria" ? "text-red-600" : "text-emerald-600"}`}>
                      {tx.type === "despesa" || tx.category === "Sangria" ? "-" : "+"} R$ {tx.amount.toFixed(2)}
                    </span>
                  </div>
                ))}

                {transactions.length === 0 && (
                  <p className="text-xxs text-slate-400 italic text-center py-6">Nenhum ajuste registrado neste turno.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 4: WHATSAPP INTEGRATION & CRM */}
        {cashierTab === "whatsapp_crm" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="cashier-whatsapp-crm">
            
            {/* Left Column: Chats List & Real-time Live Simulator */}
            <div className="space-y-4">
              
              {/* WhatsApp Live Simulator Panel */}
              <div className="bg-gradient-to-tr from-emerald-950 to-teal-900 border border-emerald-800/40 p-4 rounded-3xl text-white shadow-lg space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500 text-slate-100 p-1.5 rounded-lg">
                    <Smartphone className="w-4 h-4 text-slate-900" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">Simulador de WhatsApp Cliente</h4>
                    <span className="text-[9px] text-emerald-100 font-mono">Envie mensagens de teste para o sistema</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1.5 border-t border-emerald-850">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-emerald-200 mb-1">Nome do Cliente Fictício</label>
                    <input
                      type="text"
                      placeholder="Ex: Rafael Silva"
                      value={mockUserName}
                      onChange={(e) => setMockUserName(e.target.value)}
                      className="w-full text-xxs bg-emerald-900/40 border border-emerald-700/50 rounded-lg py-1.5 px-2.5 text-white placeholder-emerald-500 focus:outline-none focus:border-emerald-400 font-bold font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-bold text-emerald-200 mb-1">Diga algo (Chatbot irá responder)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Ex: Quero ver o cardápio..."
                        value={mockUserMessage}
                        onChange={(e) => setMockUserMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSimulateClientMsg();
                        }}
                        className="flex-1 text-xxs bg-emerald-900/40 border border-emerald-700/50 rounded-lg py-1.5 px-2.5 text-white placeholder-emerald-500 focus:outline-none font-sans"
                      />
                      <button
                        type="button"
                        onClick={handleSimulateClientMsg}
                        className="bg-emerald-500 hover:bg-emerald-400 transition text-slate-950 text-xxxxs uppercase font-black px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => { setMockUserMessage("cardapio"); setMockUserName("Diego Santos"); }}
                    className="text-[9px] bg-emerald-850 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/55 py-0.5 px-1.5 rounded-md cursor-pointer font-sans"
                  >
                    💡 pedir cardápio
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMockUserMessage("Tem cupom de desconto?"); setMockUserName("Aline Dias"); }}
                    className="text-[9px] bg-emerald-850 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/55 py-0.5 px-1.5 rounded-md cursor-pointer font-sans"
                  >
                    💡 cupom ativo
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMockUserMessage("Qual o status do meu pedido?"); setMockUserName("Lucas Costa (Mesa 03)"); }}
                    className="text-[9px] bg-emerald-850 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/55 py-0.5 px-1.5 rounded-md cursor-pointer font-sans"
                  >
                    💡 consultar status
                  </button>
                </div>
              </div>

              {/* Chats List Sidebar panel (WhatsApp styling) */}
              <div className="bg-white border rounded-3xl p-3 shadow-md">
                <div className="flex items-center justify-between mb-3 pb-2 border-b">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1 font-sans">
                    <MessageCircle className="w-4 h-4 text-emerald-500" /> Conversas Ativas
                  </span>
                  
                  {/* Chatbot Toggle Switch */}
                  <div className="flex items-center gap-1.5 bg-slate-100 py-0.5 px-2 rounded-full border">
                    <span className="text-[9px] font-bold text-slate-500 uppercase font-sans">Chatbot</span>
                    <button
                      type="button"
                      onClick={() => setIsChatbotActive(!isChatbotActive)}
                      className={`w-7 h-4 rounded-full transition-colors relative flex items-center ${isChatbotActive ? "bg-emerald-500" : "bg-slate-300"}`}
                    >
                      <span className={`w-3 h-3 bg-white rounded-full transition-transform absolute ${isChatbotActive ? "translate-x-[14px]" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-[300px] overflow-y-auto scrollbar-thin">
                  {chats.map((chat) => {
                    const isSelected = chat.id === selectedChatId;
                    const lastMsg = chat.messages[chat.messages.length - 1];
                    return (
                      <div
                        key={chat.id}
                        onClick={() => {
                          setSelectedChatId(chat.id);
                          // Clear unread on select
                          setChats(chats.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
                        }}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl transition cursor-pointer border ${isSelected ? "bg-emerald-50/40 border-emerald-500/20 shadow-xs" : "hover:bg-slate-50 border-transparent"}`}
                      >
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm border shadow-xs shrink-0">
                          {chat.avatar}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-center">
                            <span className="text-xxs font-black text-slate-800 truncate font-sans">{chat.name}</span>
                            <span className="text-[8px] text-slate-400 font-mono">{lastMsg ? lastMsg.time : ""}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate font-mono">{chat.phone}</span>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5 leading-snug font-sans">
                            {lastMsg ? `${lastMsg.sender === "operator" ? "Você: " : lastMsg.sender === "chatbot" ? "Robô: " : ""}${lastMsg.text}` : "Nenhuma mensagem..."}
                          </p>
                        </div>
                        {chat.unread > 0 && (
                          <span className="bg-emerald-500 text-white font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 shadow-sm animate-pulse font-mono">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Chat Window and Fast Dispatch Templates */}
            <div className="col-span-1 lg:col-span-2 space-y-4">
              
              {/* WhatsApp Web interface */}
              {(() => {
                const activeChat = chats.find(c => c.id === selectedChatId);
                if (!activeChat) return (
                  <div className="bg-slate-50 border rounded-3xl p-8 text-center text-slate-400 font-medium font-sans">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    Selecione uma conversa ao lado para responder.
                  </div>
                );

                return (
                  <div className="bg-white border rounded-3xl shadow-md overflow-hidden flex flex-col h-[520px] relative">
                    
                    {/* Chat Header */}
                    <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-emerald-700 rounded-full flex items-center justify-center text-lg border border-white/20 shadow-xs">
                          {activeChat.avatar}
                        </div>
                        <div>
                          <h4 className="text-xxs font-black tracking-wide text-white uppercase font-sans">{activeChat.name}</h4>
                          <span className="text-[9px] text-emerald-100 font-medium block flex items-center gap-1 font-sans">
                            <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping"></span>
                            {activeChat.lastSeen}
                          </span>
                        </div>
                      </div>
                      
                      {/* Badge info */}
                      <span className="text-[9px] font-bold bg-emerald-800 text-white py-1 px-2.5 rounded-full border border-white/10 uppercase tracking-widest font-mono">
                        Handshake OK
                      </span>
                    </div>

                    {/* Chat Messages Log (Simulated sand/beige chat background style of WhatsApp) */}
                    <div 
                      className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col"
                      style={{ 
                        backgroundColor: "#f0f2f5",
                        backgroundImage: "radial-gradient(#e5ddd5 10%, transparent 11%)",
                        backgroundSize: "12px 12px"
                      }}
                    >
                      {activeChat.messages.map((msg, idx) => {
                        const isMe = msg.sender === "operator";
                        const isBot = msg.sender === "chatbot";
                        return (
                          <div 
                            key={idx} 
                            className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm relative font-sans ${isMe ? "bg-emerald-100 text-slate-900 ml-auto rounded-tr-none" : isBot ? "bg-amber-50 text-slate-900 border border-amber-200/50 mr-auto rounded-tl-none font-medium" : "bg-white text-slate-900 mr-auto rounded-tl-none"}`}
                          >
                            {isBot && (
                              <span className="text-[8px] uppercase font-black text-amber-600 block mb-1 font-sans">🤖 AUTOMAÇÃO CHATBOT</span>
                            )}
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            <div className="text-right text-[8px] text-slate-400 mt-1 font-mono tracking-wider">
                              {msg.time} {isMe && <span className="text-emerald-600 font-bold ml-1">✓✓</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chat Action Fast templates toolbar */}
                    <div className="bg-slate-50 border-t border-b px-4 py-2 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
                      <span className="text-[9px] font-black uppercase text-slate-400 self-center tracking-wider mr-1 font-sans">Rápidos:</span>
                      <button
                        type="button"
                        onClick={() => handleSendChatText("Olá! Aqui está o cardápio oficial da Lounge & Burgueria 360 no seu celular: https://ai.studio/build/lounge360 📱 Venha conferir as novidades!")}
                        className="text-[9px] font-bold bg-white hover:bg-slate-100 border text-slate-600 py-1 px-2.5 rounded-lg transition shrink-0 shadow-xs cursor-pointer font-sans"
                      >
                        🚀 Disparar Cardápio Digital
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendChatText("Seu pedido já foi aprovado pelo nosso caixa e do iFood! Já entrou na grelha e forno para preparo ágil. 🔥 Obrigado pela preferência!")}
                        className="text-[9px] font-bold bg-white hover:bg-slate-100 border text-slate-600 py-1 px-2.5 rounded-lg transition shrink-0 shadow-xs cursor-pointer font-sans"
                      >
                        ✅ Mandar Confirmação & Preparo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendChatText("Seu pedido acabou de ficar pronto na cozinha! O motoboy está carregando a bag térmica de entrega. 🛵 Prepare-se para receber!")}
                        className="text-[9px] font-bold bg-white hover:bg-slate-100 border text-slate-600 py-1 px-2.5 rounded-lg transition shrink-0 shadow-xs cursor-pointer font-sans"
                      >
                        🛵 Aviso de Pronto / Saiu
                      </button>
                    </div>

                    {/* Chat Input form footer */}
                    <div className="p-3 bg-slate-100 border-t flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Digite sua resposta personalizada..."
                        value={chatInputText}
                        onChange={(e) => setChatInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendChatText();
                        }}
                        className="flex-1 bg-white border rounded-xl py-2 px-3 text-xxs focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-inner font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendChatText()}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl transition shadow-md active:scale-95 flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })()}

              {/* Physical API connection description & WhatsApp custom web link generators */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-4 text-emerald-850 flex flex-col md:flex-row items-center justify-between gap-4 font-sans font-sans">
                <div className="text-left space-y-1">
                  <h4 className="text-xxs font-black uppercase tracking-tight text-emerald-950">Suporte a Links de Conversação Real (Disparo Direto)</h4>
                  <p className="text-[10px] text-emerald-800 leading-relaxed">
                    Você também pode clicar no botão de <span className="font-bold">WhatsApp</span> nas comandas ativas para gerar e disparar links de checkout e avisos reais via WhatsApp Web local, prontinho para enviar ao celular de qualquer cliente!
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    type="button"
                    onClick={() => window.open("https://web.whatsapp.com", "_blank")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xxs py-2 px-4 rounded-xl transition uppercase shadow-sm cursor-pointer font-sans"
                  >
                    Abrir WhatsApp Web
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* PAPER THERMAL RECEIPT POPUP (SIMULATOR FOR CHEF / CUSTOMER DISPATCH) */}
      {ticketOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xxs flex items-center justify-center z-50 p-4">
          <div className="bg-white text-black font-mono p-6 rounded-2xl shadow-2xl w-full max-w-xs relative border-4 border-slate-350 max-h-[90vh] overflow-y-auto scrollbar-thin flex flex-col">
            
            {/* Header paper decoration cut */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-b from-transparent to-slate-100 pointer-events-none"></div>

            <div className="flex-1 overflow-y-auto pr-1">
              <div className="text-center space-y-1 text-xxxxs border-b border-dashed border-black pb-3">
                <h4 className="font-extrabold text-xs tracking-wider">BURGUERIA 360 COMANDA</h4>
                <p>Rua dos Lanches, 360 - Centro</p>
                <p>CNPJ: 00.360.000/0001-99</p>
                <p>Simulação Ticket de Produção</p>
              </div>

              <div className="text-xxs py-3 border-b border-dashed border-black space-y-1">
                <p><span className="font-black">PEDIDO:</span> #{ticketOrder.displayId}</p>
                <p><span className="font-black">CLIENTE:</span> {ticketOrder.clientName}</p>
                <p><span className="font-black">DATA:</span> {new Date(ticketOrder.createdAt).toLocaleString()}</p>
                <p><span className="font-black">MODALIDADE:</span> {ticketOrder.type.toUpperCase()}</p>
                {ticketOrder.tableNum && <p><span className="font-black">MESA:</span> {ticketOrder.tableNum}</p>}
              </div>

              {/* List items details */}
              <div className="py-3 border-b border-dashed border-black space-y-2 text-xxs">
                <p className="font-black flex justify-between">
                  <span>ITEM DESC</span>
                  <span>TOTAL</span>
                </p>
                {ticketOrder.items.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between font-bold">
                      <span>{item.quantity}x {item.product.name}</span>
                      <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                    {item.selectedExtras?.map((e: any, i) => (
                      <div key={i} className="text-xxxxs text-slate-700 ml-4 font-normal">
                        + {e.name} (R$ {e.price.toFixed(2)})
                      </div>
                    ))}
                    {item.observation && (
                      <div className="text-xxxxs text-slate-800 italic ml-4 font-semibold">
                        Obs: "{item.observation}"
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="py-2.5 text-right text-xs font-black">
                <p>TOTAL FISCAL: R$ {getOrderTotal(ticketOrder).toFixed(2)}</p>
                <p className="text-xxs font-normal">Forma: {ticketOrder.paymentMethod?.toUpperCase() || "N/A"}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-dashed border-black text-center text-xxxxs leading-relaxed">
                <p>&bull; EQUIPE DE ATENDIMENTO AGRADECE A PREFERÊNCIA &bull;</p>
                <p>Software de Atendimento 360 Ativo</p>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-dashed border-slate-200 shrink-0">
              <button
                onClick={() => {
                  alert("Simulando envio de sinal térmico para impressora Bluetooth térmica...");
                  setTicketOrder(null);
                }}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-2 rounded-xl text-xxs tracking-wider uppercase transition cursor-pointer"
              >
                Confirmar & Cortar Via (Imprimir)
              </button>
              
              <button
                onClick={() => setTicketOrder(null)}
                className="mt-2 w-full text-slate-400 hover:text-red-500 font-bold py-1 text-xxxxs uppercase block text-center"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

       {/* MODAL PARA ABERTURA DE CAIXA / DIA */}
      {isOpenDayModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-150 text-slate-900">
            <button 
              type="button"
              onClick={() => setIsOpenDayModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                🔓
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">Abrir Dia / Iniciar Caixa</h3>
              <p className="text-xxs text-slate-500 leading-relaxed">
                Insira o saldo inicial de reserva (fundo de troco) para iniciar as operações de venda de hoje.
              </p>
              
              <div className="text-left space-y-1.5 mt-2">
                <label className="block text-[9px] uppercase font-bold text-slate-500">Valor Fundo de Reservas (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full text-sm font-black border py-2.5 px-3 rounded-xl bg-slate-50 text-slate-900 outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                  value={initialBalanceForm}
                  onChange={(e) => setInitialBalanceForm(e.target.value)}
                  placeholder="Ex: 150.00"
                />
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsOpenDayModalOpen(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xxs transition cursor-pointer text-center"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onToggleCaixa) {
                    onToggleCaixa(true, Number(initialBalanceForm) || 0);
                  }
                  setIsOpenDayModalOpen(false);
                }}
                className="w-full bg-emerald-605 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xxs transition cursor-pointer text-center"
              >
                Confirmar Abertura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA FECHAMENTO DE CAIXA / DIA */}
      {isCloseDayModalOpen && (() => {
        const lastOpenedAt = caixaStatus?.openedAt || "";
        const incomeSinceOpened = orders
          .filter(o => (o.status === OrderStatus.FINALIZADO || o.status === OrderStatus.ENTREGUE) && o.completedAt && o.completedAt > lastOpenedAt)
          .reduce((sum, o) => sum + getOrderTotal(o), 0);
        const closingEstimate = (caixaStatus?.initialBalance || 0) + incomeSinceOpened;

        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-150 text-slate-900">
              <button 
                type="button"
                onClick={() => setIsCloseDayModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
                  🔒
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">Fechar Caixa / Fechar Dia</h3>
                <p className="text-xxs text-slate-500 leading-relaxed">
                  Confira o resumo das movimentações financeiras de hoje antes de encerrar o caixa:
                </p>

                <div className="bg-slate-50 p-3 rounded-2xl border text-left text-xxs text-slate-600 font-sans space-y-1.5 font-mono">
                  <div className="flex justify-between border-b pb-1 text-xxxxs">
                    <span>Abertura:</span>
                    <span className="text-slate-800">{lastOpenedAt ? new Date(lastOpenedAt).toLocaleTimeString() : "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Fundo Inicial:</span>
                    <span className="text-slate-800">R$ {(caixaStatus?.initialBalance || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1 text-emerald-600 font-extrabold">
                    <span>Faturamento:</span>
                    <span>+ R$ {incomeSinceOpened.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1 font-black text-xs text-orange-600">
                    <span>Espécie em Gaveta:</span>
                    <span>R$ {closingEstimate.toFixed(2)}</span>
                  </div>
                </div>

                <span className="block text-xxxxs text-slate-400">
                  Novos pedidos e sincronizações ficarão travados até a abertura de um novo dia comercial.
                </span>
              </div>
              
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsCloseDayModalOpen(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xxs transition cursor-pointer text-center"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onToggleCaixa) {
                      onToggleCaixa(false, 0);
                    }
                    setIsCloseDayModalOpen(false);
                    alert("Sucesso! O dia de trabalho foi encerrado definitivamente.");
                  }}
                  className="w-full bg-rose-655 bg-rose-600 hover:bg-rose-750 text-white font-extrabold py-2.5 rounded-xl text-xxs transition cursor-pointer text-center"
                >
                  Fechar Caixa
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CUSTOM CONFIRMATION MODAL FOR DEFINITIVE DELETION OF ORDERS */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-150 text-slate-900">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl">
                ⚠️
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">Excluir Pedido Definitivamente</h3>
              <p className="text-xxs text-slate-500 leading-relaxed">
                Você tem certeza que deseja deletar totalmente o pedido <span className="font-bold text-slate-800">#{orderToDelete.displayId}</span> do cliente <span className="font-bold text-slate-800">{orderToDelete.clientName}</span>?
              </p>
              <div className="bg-slate-50 p-3 rounded-2xl border text-left text-xxxxs text-slate-500 font-mono space-y-1">
                <p><span className="font-bold">Mesa/Pedido:</span> {orderToDelete.tableNum || "Balcão"}</p>
                <p><span className="font-bold">Itens:</span> {orderToDelete.items.map(i => `${i.quantity}x ${i.product.name}`).join(", ")}</p>
                <p><span className="font-bold">Valor:</span> R$ {getOrderTotal(orderToDelete).toFixed(2)}</p>
              </div>
              <span className="block text-xxxxs text-red-500 font-bold bg-red-50 px-2 py-1 rounded-lg">
                Esta ação é irreversível e o pedido será removido de todas as telas.
              </span>
            </div>
            
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xxs transition cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-2.5 rounded-xl text-xxs transition cursor-pointer text-center"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
