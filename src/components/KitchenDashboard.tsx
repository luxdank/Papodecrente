/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Order, OrderStatus } from "../types";
import { 
  Play, 
  CheckCircle, 
  Utensils, 
  Clock, 
  Volume2, 
  VolumeX, 
  AlertTriangle,
  LogOut,
  Flame,
  ChefHat
} from "lucide-react";

interface KitchenDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onLogout: () => void;
  currentUser: string;
}

// Helper to play physical buzz
const triggerKitchenBell = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch ring
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15); // Short ring
  } catch (error) {
    console.log("Audio API not supported directly or awaiting interaction", error);
  }
};

export function KitchenDashboard({ orders, onUpdateOrderStatus, onLogout, currentUser }: KitchenDashboardProps) {
  const [filterType, setFilterType] = useState<"todos" | "burgers" | "entregas">("todos");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Time elapsed ticker effect for visual tracking
  const [ticker, setTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((t) => t + 1);
    }, 10000); // refresh every 10 seconds
    return () => clearInterval(timer);
  }, []);

  // Compute minute difference for delay indicator
  const getElapsedMinutes = (createdAt: Date | string) => {
    const orderTime = new Date(createdAt).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((now - orderTime) / 60000));
  };

  // Kitchen filtered collections: pending is NOVO/CONFIRMADO, preparing is EM_PREPARO
  const activeOrders = orders.filter(o => 
    o.status === OrderStatus.NOVO || 
    o.status === OrderStatus.CONFIRMADO || 
    o.status === OrderStatus.EM_PREPARO
  );

  const filteredKitchenOrders = activeOrders.filter(o => {
    if (filterType === "todos") return true;
    if (filterType === "burgers") {
      return o.items.some(item => 
        item.product.name.toLowerCase().includes("hamburger") || 
        item.product.name.toLowerCase().includes("burguer") ||
        item.product.name.toLowerCase().includes("burger") ||
        item.product.name.toLowerCase().includes("lanche")
      );
    }
    if (filterType === "entregas") return o.type === "ifood" || o.type === "balcao";
    return true;
  });

  // Calculate kitchen stats
  const totalBurgersRequired = orders
    .filter(o => o.status === OrderStatus.EM_PREPARO || o.status === OrderStatus.CONFIRMADO || o.status === OrderStatus.NOVO)
    .reduce((total, o) => {
      const burgerCount = o.items.reduce((sum, item) => {
        const isBurger = item.product.name.toLowerCase().includes("burguer") || item.product.name.toLowerCase().includes("burger");
        return sum + (isBurger ? item.quantity : 0);
      }, 0);
      return total + burgerCount;
    }, 0);

  const pendingCount = orders.filter(o => o.status === OrderStatus.NOVO || o.status === OrderStatus.CONFIRMADO).length;
  const preparingCount = orders.filter(o => o.status === OrderStatus.EM_PREPARO).length;

  const handleStartPrep = (orderId: string) => {
    onUpdateOrderStatus(orderId, OrderStatus.EM_PREPARO);
    if (soundEnabled) triggerKitchenBell();
  };

  const handleFinishPrep = (orderId: string) => {
    onUpdateOrderStatus(orderId, OrderStatus.PRONTO);
    if (soundEnabled) {
      triggerKitchenBell();
      setTimeout(() => triggerKitchenBell(), 200); // Double ring
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="kitchen-root">
      
      {/* Upper Status Line & Branding */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 font-sans">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/20 p-2 rounded-xl text-orange-400 border border-orange-500/10">
            <ChefHat className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xxs uppercase tracking-widest font-black text-orange-500">PAINEL DE PRODUÇÃO</span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            </div>
            <h1 className="text-sm font-black text-white capitalize">Cozinheiro: {currentUser}</h1>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2">
          {/* Sound Alarm Test button */}
          <button
            onClick={() => {
              triggerKitchenBell();
              alert("Sino de Alerta Sonora acionado!");
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-xl text-xxs font-bold border border-slate-700 cursor-pointer"
            title="Testar alerta sonora de aviso de pedido"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Testar Sino
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-xl border flex items-center justify-center cursor-pointer ${soundEnabled ? "bg-slate-800 border-slate-700 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-600"}`}
            title="Ativar/Desativar som de transição"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Separation line */}
          <span className="text-slate-700">|</span>

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 bg-red-950/40 hover:bg-red-900 text-red-300 hover:text-white border border-red-900/30 py-1.5 px-3 rounded-xl text-xxs font-bold transition cursor-pointer"
            id="kitchen-logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </div>

      {/* Kitchen Fast Stats Widget Row */}
      <div className="bg-slate-900/40 border-b border-slate-800/60 p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xxs">
        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-slate-400 block uppercase font-bold tracking-wider">Hambúrgueres na Chapa</span>
            <span className="text-lg font-black text-orange-500 font-mono mt-0.5">{totalBurgersRequired} un</span>
          </div>
          <Flame className="w-6 h-6 text-orange-500 animate-pulse shrink-0" />
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-2xl">
          <span className="text-slate-400 block uppercase font-bold tracking-wider">Pendentes de Início</span>
          <span className="text-lg font-black text-white font-mono mt-0.5">{pendingCount} pedidos</span>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-2xl">
          <span className="text-slate-400 block uppercase font-bold tracking-wider">Preparando Agora</span>
          <span className="text-lg font-black text-amber-400 font-mono mt-0.5">{preparingCount} comandas</span>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-slate-400 block uppercase font-bold tracking-wider">Modo Monitor</span>
            <span className="text-xxs font-extrabold text-emerald-400 uppercase mt-1 block">✓ Auto-Alerta Ativo</span>
          </div>
          <Clock className="w-5 h-5 text-slate-500 shrink-0" />
        </div>
      </div>

      {/* Kitchen Categorized filter Tabs */}
      <div className="px-4 py-3 bg-slate-950 flex items-center gap-2 overflow-x-auto scrollbar-none whitespace-nowrap">
        <span className="text-xxs font-bold text-slate-400 mr-2 uppercase tracking-tight font-sans shrink-0">Filtrar Monitor:</span>
        <button
          onClick={() => setFilterType("todos")}
          className={`py-1.5 px-3.5 rounded-lg text-xxs font-bold cursor-pointer shrink-0 ${filterType === "todos" ? "bg-orange-550 text-white font-black" : "bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-750"}`}
        >
          Todos ({activeOrders.length})
        </button>
        <button
          onClick={() => setFilterType("burgers")}
          className={`py-1.5 px-3.5 rounded-lg text-xxs font-bold cursor-pointer shrink-0 ${filterType === "burgers" ? "bg-orange-550 text-white font-black" : "bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-750"}`}
        >
          Só Hambúrgueres 🍔
        </button>
        <button
          onClick={() => setFilterType("entregas")}
          className={`py-1.5 px-3.5 rounded-lg text-xxs font-bold cursor-pointer shrink-0 ${filterType === "entregas" ? "bg-orange-550 text-white font-black" : "bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-750"}`}
        >
          Delivery/Balcão
        </button>
      </div>

      {/* Two-Column Kanban Workspace for Kitchen (Pending vs Preparing) */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 h-full" id="kitchen-kanban">
        
        {/* Column 1: Pendentes (Queue awaiting start) */}
        <div className="bg-slate-900/30 border border-slate-850 rounded-2.5xl p-4 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-3.5 border-b border-slate-800/80 pb-2">
            <span className="text-xs uppercase font-black text-rose-400 tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shrink-0"></span>
              Fila Pendente ({filteredKitchenOrders.filter(o => o.status === OrderStatus.NOVO || o.status === OrderStatus.CONFIRMADO).length})
            </span>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[600px] pr-1" id="kitchen-pending-col">
            {filteredKitchenOrders.filter(o => o.status === OrderStatus.NOVO || o.status === OrderStatus.CONFIRMADO).map((order) => {
              const minutesElapsed = getElapsedMinutes(order.createdAt);
              const isUrgent = minutesElapsed >= 10;

              return (
                <div 
                  key={order.id} 
                  className={`border rounded-2xl p-4 bg-slate-905 transition hover:shadow-lg ${isUrgent ? "border-red-500/50 bg-red-500/5 shadow-md shadow-red-500/1" : "border-slate-800"}`}
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white capitalize font-mono">#{order.displayId} &bull; {order.clientName}</span>
                        {isUrgent && (
                          <span className="bg-red-500/20 text-red-400 py-0.5 px-1.5 rounded text-xxxxs uppercase font-black tracking-widest flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5 inline" /> Atrasado!
                          </span>
                        )}
                      </div>
                      <span className="text-xxxxs uppercase font-bold tracking-wider text-slate-400 block mt-0.5">
                        {order.type === "ifood" ? "🚲 Delivery iFood" : order.type === "qrcode" ? `📱 Mesa ${order.tableNum || "Digital"}` : "🛍️ Retirada Balcão"}
                      </span>
                    </div>

                    <div className="text-right text-xxxxs text-slate-400">
                      <span className={`font-mono text-xxs font-black flex items-center gap-1 ${isUrgent ? "text-red-400" : "text-white"}`}>
                        <Clock className="w-3 h-3 text-amber-500" /> {minutesElapsed} min atrás
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-1.5 my-3 border-t border-b border-slate-800/60 py-2.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex justify-between font-bold">
                          <span>
                            <span className="text-orange-400 font-extrabold mr-1">{item.quantity}x</span> 
                            <span className="text-slate-100">{item.product.name}</span>
                          </span>
                        </div>
                        {item.selectedExtras.length > 0 && (
                          <div className="text-xxs text-emerald-400 ml-5 font-medium">
                            + Opcionais: {item.selectedExtras.map((e: any) => e.name).join(", ")}
                          </div>
                        )}
                        {item.observation && (
                          <div className="text-xxs text-amber-400 ml-5 italic mt-0.5">
                            Obs: "{item.observation}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => handleStartPrep(order.id)}
                    className="w-full bg-slate-800 hover:bg-orange-550 active:scale-[0.98] border border-slate-755 hover:border-orange-550 text-white font-bold py-2 rounded-xl text-xxs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-orange-400" /> Iniciar Preparo
                  </button>
                </div>
              );
            })}

            {filteredKitchenOrders.filter(o => o.status === OrderStatus.NOVO || o.status === OrderStatus.CONFIRMADO).length === 0 && (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
                <Utensils className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <span className="text-xxs block text-slate-505 uppercase font-bold tracking-wider">Nenhum pedido pendente nesta fila</span>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Preparando (Orders in cooking process) */}
        <div className="bg-slate-900/30 border border-slate-850 rounded-2.5xl p-4 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-3.5 border-b border-slate-800/80 pb-2">
            <span className="text-xs uppercase font-black text-amber-400 tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping shrink-0"></span>
              Em Preparo ({filteredKitchenOrders.filter(o => o.status === OrderStatus.EM_PREPARO).length})
            </span>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[600px] pr-1" id="kitchen-preparing-col">
            {filteredKitchenOrders.filter(o => o.status === OrderStatus.EM_PREPARO).map((order) => {
              const minutesElapsed = getElapsedMinutes(order.createdAt);
              const isUrgent = minutesElapsed >= 15;

              return (
                <div 
                  key={order.id} 
                  className={`border rounded-2xl p-4 bg-slate-905 transition hover:shadow-lg ${isUrgent ? "border-red-500/50 bg-red-500/5" : "border-amber-500/40 bg-amber-500/2"}`}
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white capitalize font-mono">#{order.displayId} &bull; {order.clientName}</span>
                        <span className="bg-amber-500/20 text-amber-400 py-0.5 px-1.5 rounded text-xxxxs uppercase font-black tracking-widest flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 inline" /> Na Chapa
                        </span>
                      </div>
                      <span className="text-xxxxs uppercase font-bold tracking-wider text-slate-400 block mt-0.5">
                        {order.type === "ifood" ? "🚲 Delivery iFood" : order.type === "qrcode" ? `📱 Mesa ${order.tableNum || "Digital"}` : "🛍️ Retirada Balcão"}
                      </span>
                    </div>

                    <div className="text-right text-xxxxs text-slate-400">
                      <span className={`font-mono text-xxs font-black flex items-center gap-1 ${isUrgent ? "text-red-400" : "text-white"}`}>
                        <Clock className="w-3 h-3 text-orange-500 animate-pulse" /> {minutesElapsed} min total
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-1.5 my-3 border-t border-b border-slate-800/60 py-2.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex justify-between font-bold">
                          <span>
                            <span className="text-orange-400 font-extrabold mr-1">{item.quantity}x</span> 
                            <span className="text-slate-100">{item.product.name}</span>
                          </span>
                        </div>
                        {item.selectedExtras.length > 0 && (
                          <div className="text-xxs text-emerald-400 ml-5 font-medium">
                            + Opcionais: {item.selectedExtras.map((e: any) => e.name).join(", ")}
                          </div>
                        )}
                        {item.observation && (
                          <div className="text-xxs text-amber-400 ml-5 italic mt-0.5">
                            Obs: "{item.observation}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => handleFinishPrep(order.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-555 text-white font-bold py-2.5 rounded-xl text-xxs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-white" /> Concluir Preparo (Pronto)
                  </button>
                </div>
              );
            })}

            {filteredKitchenOrders.filter(o => o.status === OrderStatus.EM_PREPARO).length === 0 && (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
                <Flame className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <span className="text-xxs block text-slate-505 uppercase font-bold tracking-wider">Nada na chapa no momento</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
