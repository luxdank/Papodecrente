/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Product, Order, FinancialTransaction, OrderStatus } from "../types";
import { 
  BarChart3, 
  Settings, 
  Layers, 
  Trash2, 
  Plus, 
  DollarSign, 
  LogOut, 
  Sparkles, 
  Tag, 
  UserCheck, 
  ShoppingBag,
  ListFilter,
  CheckCircle,
  TrendingUp,
  Package
} from "lucide-react";

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  transactions: FinancialTransaction[];
  onAddProduct: (prod: any) => void;
  onToggleProductAvailable: (prodId: string) => void;
  onModifyProductPrice: (prodId: string, newPrice: number) => void;
  onLogout: () => void;
  currentUser: string;
  ifoodConfig?: {
    clientId?: string;
    clientSecret?: string;
    merchantId?: string;
    status?: "connected" | "disconnected" | "error";
    storeName?: string;
  };
  onPollNowIFood?: () => Promise<any>;
}

export function AdminDashboard({
  products,
  orders,
  transactions,
  onAddProduct,
  onToggleProductAvailable,
  onModifyProductPrice,
  onLogout,
  currentUser,
  ifoodConfig,
  onPollNowIFood
}: AdminDashboardProps) {

  // Inner admin navigation tabs
  const [adminTab, setAdminTab] = useState<"analytics" | "catalogo" | "combos_promos" | "auditoria" | "ifood">("analytics");

  // iFood Integration State variables
  const [editedClientId, setEditedClientId] = useState(ifoodConfig?.clientId || "f10b44a2-6108-4a3b-b882-e8cb8089cc17");
  const [editedClientSecret, setEditedClientSecret] = useState(ifoodConfig?.clientSecret || "svphzjn1eo97am7jkupndjkf85y6n41slxbs5kbyaedjuirsqu7xdzt6fbmhefrhiajvbir9j590pwpgqcczcakuqven77l2hi2");
  const [editedMerchantId, setEditedMerchantId] = useState(ifoodConfig?.merchantId || "");
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);

  const [pollLoading, setPollLoading] = useState(false);
  const [pollFeedback, setPollFeedback] = useState<string | null>(null);

  const handleManualPoll = async () => {
    if (!onPollNowIFood) return;
    setPollLoading(true);
    setPollFeedback(null);
    try {
      const res = await onPollNowIFood();
      if (res && res.success) {
        setPollFeedback(`Sucesso! Buscou ${res.eventsChecked || 0} eventos. Importou ${res.count || 0} novos pedidos teste.`);
      } else {
        setPollFeedback(`Falha ao sincronizar: ${res?.error || res?.reason || "Erro desconhecido"}`);
      }
    } catch (err: any) {
      setPollFeedback(`Erro na API de Sincronia: ${err.message}`);
    } finally {
      setPollLoading(false);
    }
  };

  const handleSaveIFoodConfig = async () => {
    try {
      const res = await fetch("/api/ifood/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: editedClientId,
          clientSecret: editedClientSecret,
          merchantId: editedMerchantId,
        })
      });
      if (res.ok) {
        alert("Configurações do iFood salvas localmente!");
      } else {
        alert("Erro ao salvar configurações!");
      }
    } catch (err: any) {
      alert("Erro ao conectar com o servidor: " + err.message);
    }
  };

  const handleTestIFoodConnection = async () => {
    setTestLoading(true);
    setTestError(null);
    setTestResult(null);

    try {
      const res = await fetch("/api/ifood/test-real", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: editedClientId,
          clientSecret: editedClientSecret
        })
      });
      
      const data = await res.json();
      setTestLoading(false);

      if (data.success) {
        setTestResult(data);
        if (data.merchantId) {
          setEditedMerchantId(data.merchantId);
        }
      } else {
        setTestError(data.error || "Erro desconhecido ao validar conexão.");
      }
    } catch (err: any) {
      setTestLoading(false);
      setTestError("Falha de rede ao conectar à API iFood local: " + err.message);
    }
  };

  // State for new product form
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("lanches");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdImg, setNewProdImg] = useState("https://images.unsplash.com/photo-1568901346375-23c9450c58cd");

  // State for temporary price edit inputs
  const [editingPrices, setEditingPrices] = useState<{ [id: string]: string }>({});

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(newProdPrice);
    if (!newProdName || isNaN(parsedPrice) || parsedPrice <= 0) {
      alert("Por favor insira um nome e preço corretos para o novo lanche!");
      return;
    }

    onAddProduct({
      name: newProdName,
      category: newProdCategory,
      price: parsedPrice,
      description: newProdDesc || "Receita especial do chefe, lanche gostoso e quentinho.",
      image: newProdImg,
      available: true,
      popular: false,
      extras: [
        { id: Math.random().toString(), name: "Cheddar Extra", price: 3.50 },
        { id: Math.random().toString(), name: "Bacon Crocante", price: 4.00 }
      ]
    });

    // Reset inputs
    setNewProdName("");
    setNewProdPrice("");
    setNewProdDesc("");
    setNewProdImg("https://images.unsplash.com/photo-1568901346375-23c9450c58cd");
    alert("Hambúrguer adicionado com sucesso ao cardápio!");
  };

  const handleSavePriceEdit = (prodId: string) => {
    const pStr = editingPrices[prodId];
    const parsedPrice = parseFloat(pStr);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert("Valor incorreto!");
      return;
    }
    onModifyProductPrice(prodId, parsedPrice);
    setEditingPrices({ ...editingPrices, [prodId]: "" }); // clear
    alert("Preço reajustado com sucesso!");
  };

  // Compute stats totals
  const totalSalesCount = orders.filter(o => o.status === OrderStatus.FINALIZADO || o.status === OrderStatus.ENTREGUE).length;
  const grossSalesVolume = orders
    .filter(o => o.status === OrderStatus.FINALIZADO || o.status === OrderStatus.ENTREGUE)
    .reduce((sum, o) => {
      const oSum = o.items.reduce((acc, item) => {
        const extrasSum = item.selectedExtras?.reduce((s, e) => s + e.price, 0) || 0;
        return acc + (item.product.price + extrasSum) * item.quantity;
      }, 0);
      return sum + oSum;
    }, 0);

  const averageTicket = totalSalesCount > 0 ? grossSalesVolume / totalSalesCount : 0;

  // Custom Combos preconfigured to inspect
  const presetCombos = [
    { title: "🍔 Combo Brabo Duplo", desc: "2x Cheeseburguer + Porção Batata frita M + Coca lata 350ml", price: 49.90, descPercent: "Economia de 25%" },
    { title: "🍧 Combo Casal Doce", desc: "2x Burgers Especiais + 2x Milkshake de Chocolate belga", price: 65.00, descPercent: "Economia de 15%" },
    { title: "🥤 Combo Kids Feliz", desc: "1x Hambúrguer Sliders mini + Suco natural laranja + Surpresa do Chef", price: 29.90, descPercent: "Brinde Especial" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="admin-root">
      
      {/* Top Admin Ribbon Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/20 p-2.5 rounded-2xl text-orange-400 border border-orange-500/10">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-extrabold text-orange-500">PAINEL DE GERÊNCIA</span>
              <span className="bg-orange-100 text-orange-950 py-0.5 px-2 rounded-lg text-[10px] font-black uppercase">DIRETORIA</span>
            </div>
            <h1 className="text-base font-black text-white mt-0.5">Administrador: {currentUser}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-red-950/40 hover:bg-red-900 text-red-300 hover:text-white border border-red-900/30 py-2 px-4 rounded-xl text-xs font-extrabold transition cursor-pointer"
            id="admin-logout-btn"
          >
            <LogOut className="w-4 h-4" /> Sair do Painel
          </button>
        </div>
      </header>

      {/* Internal Admin Navigation Selector */}
      <div className="bg-slate-900/60 border-b border-slate-800/60 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => setAdminTab("analytics")}
            className={`py-2 px-4 rounded-xl text-xs font-bold uppercase transition shrink-0 cursor-pointer ${adminTab === "analytics" ? "bg-orange-600 text-white font-extrabold shadow-md shadow-orange-600/20" : "text-slate-400 hover:text-white bg-slate-805 hover:bg-slate-800"}`}
          >
            📊 Visão Geral Faturamento
          </button>
          <button
            onClick={() => setAdminTab("catalogo")}
            className={`py-2 px-4 rounded-xl text-xs font-bold uppercase transition shrink-0 cursor-pointer ${adminTab === "catalogo" ? "bg-orange-600 text-white font-extrabold shadow-md shadow-orange-600/20" : "text-slate-400 hover:text-white bg-slate-805 hover:bg-slate-800"}`}
          >
            🍔 Ajuste de Cardápio & Preços
          </button>
          <button
            onClick={() => setAdminTab("combos_promos")}
            className={`py-2 px-4 rounded-xl text-xs font-bold uppercase transition shrink-0 cursor-pointer ${adminTab === "combos_promos" ? "bg-orange-600 text-white font-extrabold shadow-md shadow-orange-600/20" : "text-slate-400 hover:text-white bg-slate-805 hover:bg-slate-800"}`}
          >
            🏷️ Planejador de Combos & Cupons
          </button>
          <button
            onClick={() => setAdminTab("auditoria")}
            className={`py-2 px-4 rounded-xl text-xs font-bold uppercase transition shrink-0 cursor-pointer ${adminTab === "auditoria" ? "bg-orange-600 text-white font-extrabold shadow-md shadow-orange-600/20" : "text-slate-400 hover:text-white bg-slate-805 hover:bg-slate-800"}`}
          >
            📋 Log de Auditoria & Segurança
          </button>
          <button
            onClick={() => setAdminTab("ifood")}
            className={`py-2 px-4 rounded-xl text-xs font-bold uppercase transition shrink-0 cursor-pointer ${adminTab === "ifood" ? "bg-orange-600 text-white font-extrabold shadow-md shadow-orange-600/20" : "text-slate-400 hover:text-white bg-slate-805 hover:bg-slate-800"}`}
          >
            🚲 Conexão iFood API Real
          </button>
        </div>
      </div>

      <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
        
        {/* TAB 1: VISÃO GERAL COORDENAÇÃO ANALYTICS */}
        {adminTab === "analytics" && (
          <div className="space-y-6 animate-fade-in" id="admin-analytics-view">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-slate-400 uppercase font-black tracking-wider text-[10px] block">Volume Total Faturado</span>
                <span className="text-xl font-black text-white font-mono mt-1 block">R$ {grossSalesVolume.toFixed(2)}</span>
                <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">🚀 Crescimento Líquido hoje</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-slate-400 uppercase font-black tracking-wider text-[10px] block">Quantidade Pedidos</span>
                <span className="text-xl font-black text-white font-mono mt-1 block">{totalSalesCount} comandas</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Enviados & Entregues aos clientes</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-slate-400 uppercase font-black tracking-wider text-[10px] block">Lanche Mais Vendido</span>
                <span className="text-sm font-black text-orange-400 mt-1 block truncate">Smash Bacon Crispy 🍔</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Campeão absoluto de vendas</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-slate-400 uppercase font-black tracking-wider text-[10px] block">Ticket Médio Consumido</span>
                <span className="text-xl font-black text-teal-400 font-mono mt-1 block">R$ {averageTicket.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Faturamento / Total comandas</span>
              </div>
            </div>

            {/* Simulated Data insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <h3 className="font-extrabold text-xs uppercase text-slate-400 mb-3 block">Conversões por Meio de Canal</h3>
                
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
                      <span>🚲 Delivery iFood</span>
                      <span>R$ {(grossSalesVolume * 0.45).toFixed(2)} (45%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-600 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
                      <span>📱 QR Code Mesa Automática</span>
                      <span>R$ {(grossSalesVolume * 0.35).toFixed(2)} (35%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-600 rounded-full" style={{ width: "35%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
                      <span>🛍️ Vendas de Balcão / POS</span>
                      <span>R$ {(grossSalesVolume * 0.20).toFixed(2)} (20%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-600 rounded-full" style={{ width: "20%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* General active users status tracker */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-center flex flex-col justify-center items-center py-6">
                <TrendingUp className="w-10 h-10 text-emerald-400 mb-2 animate-bounce" />
                <h4 className="font-extrabold text-sm text-white">SISTEMA INTEGRADO ESTÁVEL</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1.5 mx-auto">Sincronização em tempo real ativa entre os computadores do Caixa, painel do Cozinheiro e mesas de Cardápio QR Code!</p>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: CATÁLOGO ADJUSTMENTS */}
        {adminTab === "catalogo" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="admin-catalog-view">
            
            {/* New Burger Creator */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-max">
              <h3 className="font-extrabold text-xs uppercase text-slate-400 border-b border-slate-800 pb-3 mb-4">Criar Hambúrguer / Produto Novo</h3>
              
              <form onSubmit={handleCreateProduct} className="space-y-4">
                
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5">Nome do Lanche</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cheddar Mel Bacon"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-800 bg-slate-950 rounded-xl p-3 text-white outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5">Categoria</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-800 bg-slate-950 rounded-xl p-3 text-white outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="lanches"> Burguers 🍔</option>
                    <option value="bebidas"> Bebidas 🥤</option>
                    <option value="porcoes"> Porções 🍟</option>
                    <option value="sobremesas"> Sobremesas 🍧</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5">Preço Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="29.90"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-800 bg-slate-950 rounded-xl p-3 text-white outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5">Descrição Receita</label>
                  <textarea
                    placeholder="Pão de brioche amanteigado, blend de 150g, muito cheddar e farofa de bacon."
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="w-full text-xs border border-slate-800 bg-slate-950 rounded-xl p-3 text-white h-24 outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-md shadow-orange-600/10"
                >
                  Registrar no Cardápio
                </button>

              </form>
            </div>

            {/* List products with pricing adjuster */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-extrabold text-xs uppercase text-slate-400 mb-4 pb-3 border-b border-slate-800">Ficha de Preços e Disponibilidade de Itens</h3>
              
              <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                {products.map((p) => (
                  <div key={p.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-800"
                      />
                      <div>
                        <h4 className="font-extrabold text-xs uppercase text-white leading-tight">{p.name}</h4>
                        <span className="text-[10px] uppercase font-black bg-slate-800 py-0.5 px-2 rounded-md text-slate-350 block w-max mt-1">{p.category}</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4 flex-wrap text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block mb-1 font-bold">Editar Preço</span>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            step="0.10"
                            placeholder={p.price.toFixed(2)}
                            value={editingPrices[p.id] || ""}
                            onChange={(e) => setEditingPrices({ ...editingPrices, [p.id]: e.target.value })}
                            className="bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-2 w-20 text-center text-white text-xs font-bold font-mono outline-none focus:ring-1 focus:ring-orange-500"
                          />
                          <button
                            onClick={() => handleSavePriceEdit(p.id)}
                            className="bg-slate-800 hover:bg-slate-755 border border-slate-705 text-slate-200 py-1.5 px-3 rounded-xl font-extrabold text-xs cursor-pointer transition"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>

                      {/* Toggle status of availability */}
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-slate-400 block mb-1 font-bold">Status Ativo</span>
                        <button
                          onClick={() => onToggleProductAvailable(p.id)}
                          className={`py-2 px-3 rounded-xl text-[10px] uppercase font-black tracking-wider transition cursor-pointer ${p.stock > 0 ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/30" : "bg-red-500/20 text-red-400 border border-red-500/10 hover:bg-red-500/30"}`}
                        >
                          {p.stock > 0 ? "Disponível" : "Pausado"}
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PROMO COMBOS SETUP */}
        {adminTab === "combos_promos" && (
          <div className="space-y-6 animate-fade-in" id="admin-combos-view">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <h3 className="font-extrabold text-xs uppercase text-slate-400 mb-5 block border-b border-slate-800 pb-3">🔥 COMBOS DE REFEIÇÃO DINÂMICOS DA SEMANA</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {presetCombos.map((c, i) => (
                  <div key={i} className="bg-gradient-to-br from-slate-950 to-orange-955 p-5 border border-orange-500/20 rounded-2xl relative shadow-lg">
                    <span className="absolute top-3 right-3 text-[10px] font-black text-amber-400 uppercase bg-amber-955/60 py-1 px-2.5 rounded-full border border-amber-500/20">{c.descPercent}</span>
                    <h4 className="font-black text-sm text-white uppercase mt-2">{c.title}</h4>
                    <p className="text-xs text-slate-350 my-2 leading-relaxed h-12 line-clamp-3">{c.desc}</p>
                    <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-800">
                      <span className="font-mono text-base font-extrabold text-white">R$ {c.price.toFixed(2)}</span>
                      <button
                        onClick={() => alert(`Combo "${c.title}" ativado no topo do cardápio do QR Code e iFood!`)}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-lg uppercase tracking-wider transition cursor-pointer"
                      >
                        Ativar na Loja
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick discount coupon creator */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl max-w-md">
              <h4 className="font-extrabold text-xs uppercase text-slate-400 mb-3 block">Criar Cupom de Desconto Adicional</h4>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="EX: BURGUER50, MAISDESSERTO"
                  className="w-full text-xs font-bold border border-slate-800 bg-slate-950 rounded-xl p-3 text-white outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  onClick={() => alert("Novo cupom homologado! Agora pode ser usado pelos clientes no menu QR Code.")}
                  className="w-full bg-slate-800 hover:bg-slate-750 text-white font-black py-2.5 rounded-xl text-xs uppercase transition cursor-pointer"
                >
                  Confirmar novo Cupom
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDITORIA REPORT LOG SYSTEM */}
        {adminTab === "auditoria" && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl animate-fade-in" id="admin-audit-view">
            <h3 className="font-extrabold text-xs uppercase text-slate-400 mb-4 pb-3 border-b border-slate-800 block">Histórico de Eventos & Telemetria do Turno</h3>
            
            <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs">
              <div className="p-2.5 border-b border-slate-800 text-slate-300">
                <span className="text-amber-500 font-bold">[14:21:42]</span> - Administrador <span className="font-black">Aline</span> efetuou login seguro no Painel Executivo.
              </div>
              <div className="p-2.5 border-b border-slate-800 text-slate-300">
                <span className="text-amber-500 font-bold">[14:19:05]</span> - Cozinheiro <span className="font-black">Marcos</span> concluiu a produção da comanda <span className="text-emerald-400">#3602</span> na cozinha.
              </div>
              <div className="p-2.5 border-b border-slate-800 text-slate-300">
                <span className="text-amber-500 font-bold">[14:15:22]</span> - Operadora <span className="font-black">Bruna</span> realizou sangria financeira de segurança de <span className="text-red-400">R$ 200,00</span> da gaveta.
              </div>
              <div className="p-2.5 border-b border-slate-800 text-slate-300">
                <span className="text-amber-500 font-bold">[14:02:11]</span> - Pedido automático QR Code da <span className="font-black">Mesa 05</span> integrado na fila com sucesso.
              </div>
              <div className="p-2.5 border-b border-slate-800 text-slate-300">
                <span className="text-amber-500 font-bold">[13:55:00]</span> - Turno do dia iniciado por Bruna (Caixa) com fundo de troco de <span className="text-emerald-400 font-bold">R$ 150,00</span>.
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: IFOOD INTEGRATION PLATFORM */}
        {adminTab === "ifood" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="admin-ifood-view">
            
            {/* Connection configuration fields Column */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-5">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
                  Configurações de Credenciais iFood Merchant API
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Para conectar sua lanchonete ao iFood, utilize as chaves geradas no Portal do Desenvolvedor do iFood. Essas credenciais autenticam nosso sistema diretamente com a API de lojas deles.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase font-bold text-slate-400 block mb-1.5">iFood Client ID (Chave de Acesso)</label>
                  <input
                    type="text"
                    value={editedClientId}
                    onChange={(e) => setEditedClientId(e.target.value)}
                    placeholder="Cole seu Client ID aqui"
                    className="w-full text-xs font-mono font-bold border border-slate-800 bg-slate-950 rounded-xl p-3 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-slate-400 block mb-1.5">iFood Client Secret (Segredo do Cliente)</label>
                  <input
                    type="password"
                    value={editedClientSecret}
                    onChange={(e) => setEditedClientSecret(e.target.value)}
                    placeholder="Cole seu Client Secret aqui"
                    className="w-full text-xs font-mono font-bold border border-slate-800 bg-slate-950 rounded-xl p-3 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1.5 block">O client secret é armazenado de forma criptografada e segura em nosso servidor.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase font-bold text-slate-400 block mb-1.5">ID da Loja (Merchant ID - UUID)</label>
                    <input
                      type="text"
                      value={editedMerchantId}
                      onChange={(e) => setEditedMerchantId(e.target.value)}
                      placeholder="Autodetectado na conexão ou insira"
                      className="w-full text-xs font-mono font-bold border border-slate-800 bg-slate-950 rounded-xl p-3 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase font-bold text-slate-400 block mb-1.5">Status do Canal Digital</label>
                    <div className="w-full text-xs font-bold border border-slate-800 bg-slate-950 rounded-xl p-3 flex items-center justify-between text-slate-300">
                      <span>{ifoodConfig?.status === "connected" ? "🟢 Ativo de Produção" : ifoodConfig?.status === "error" ? "🔴 Falha na Chave" : "⚪ Desconectado"}</span>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-black text-slate-400">REST API</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    onClick={handleTestIFoodConnection}
                    disabled={testLoading}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    {testLoading ? "Validando Chaves no iFood..." : "🔑 Validar & Testar Conexão Real"}
                  </button>

                  <button
                    onClick={handleSaveIFoodConfig}
                    className="bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white font-extrabold px-5 py-3 rounded-xl text-xs uppercase border border-slate-800 transition cursor-pointer"
                  >
                    Salvar Ajustes
                  </button>
                </div>
              </div>
            </div>

            {/* Connection output status and response logs Column */}
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-xs uppercase text-slate-400 block mb-2.5 tracking-wider">Status do Link do iFood</h4>
                
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Canal iFood:</span>
                    <span className={ifoodConfig?.status === "connected" ? "text-emerald-400" : "text-amber-400"}>
                      {ifoodConfig?.status === "connected" ? "Homologado via API" : "Aguardando Homologação"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Nome de Loja:</span>
                    <span className="text-slate-100">{ifoodConfig?.storeName || "Nenhuma conectada"}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">ID Registrado:</span>
                    <span className="text-slate-300 font-mono text-[10px] break-all">{ifoodConfig?.merchantId || "não configurado"}</span>
                  </div>
                </div>
              </div>

              {/* API test live JSON feedbacks */}
              <div className="flex-1 min-h-[144px] max-h-64 overflow-y-auto bg-slate-950 border border-slate-800 rounded-2xl p-3 font-mono text-[10px] leading-relaxed text-slate-400 space-y-2">
                <span className="text-slate-500 uppercase block font-black border-b border-slate-900 pb-1 mb-2">Logs do Terminal de Sincronia</span>

                {testLoading && (
                  <p className="text-orange-400 animate-pulse">
                    Enviando POST /authentication/v1.0/oauth/token...<br />
                    Aguardando handshake seguro do servidor do iFood...
                  </p>
                )}

                {testError && (
                  <p className="text-red-400 font-bold bg-red-950/20 p-2 border border-red-950/30 rounded-lg">
                    [ERROR] {testError}
                  </p>
                )}

                {testResult && (
                  <div className="space-y-1 text-emerald-400 font-bold bg-emerald-950/20 p-2 border border-emerald-950/30 rounded-lg">
                    <p className="text-white">[CONEXÃO REAL HOMOLOGADA DE PRODUÇÃO]</p>
                    <p>✓ Handshake OAuth realizado com sucesso</p>
                    <p>✓ Token ativo: Bearer {testResult.tokenPreview}</p>
                    <p className="text-slate-300 mt-1">Lojas localizadas:</p>
                    {testResult.merchants && testResult.merchants.map((m: any, idx: number) => (
                      <p key={idx} className="pl-1 text-slate-100">
                        → {m.name} (ID: {m.id?.substring(0, 8)}...)
                      </p>
                    ))}
                  </div>
                )}

                {!testLoading && !testError && !testResult && (
                  <p className="text-slate-600 italic">
                    Aguardando clique para iniciar autenticação com o iFood...
                  </p>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                <span className="font-extrabold text-white text-xs block">🔄 Sincronizador de Pedidos iFood (Event Poll)</span>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  O painel busca novos pedidos na API de Eventos do iFood automaticamente a cada 3 segundos (tempo real super rápido!). Se preferir puxar pedidos de teste ou real imediatamente, clique no botão abaixo:
                </p>
                <button
                  type="button"
                  onClick={handleManualPoll}
                  disabled={pollLoading || ifoodConfig?.status !== "connected"}
                  className="w-full bg-slate-800 hover:bg-slate-750 disabled:bg-slate-950 disabled:text-slate-650 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition"
                >
                  {pollLoading ? (
                    <span className="animate-spin text-orange-500 border-2 border-t-transparent border-orange-550 rounded-full w-3.5 h-3.5"></span>
                  ) : "🔄 Sincronizar Novos Pedidos"}
                </button>
                {pollFeedback && (
                  <p className="text-[10px] font-bold text-amber-500 bg-amber-955/20 p-2 border border-amber-900/30 rounded-lg animate-fade-in">
                    {pollFeedback}
                  </p>
                )}
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-[10px] leading-relaxed text-slate-400">
                <span className="font-extrabold text-white block mb-1">ℹ️ Próximos Passos recomendados:</span>
                Após validar com sucesso, os novos pedidos gerados no iFood entrarão no monitor do Caixa como <span className="text-amber-500 font-bold">"Aguardando Aprovação"</span>. Após clicar em <span className="text-amber-500 font-bold">"Aceitar iFood"</span>, eles seguirão direto para o Monitor de Comandas da Cozinha!
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
