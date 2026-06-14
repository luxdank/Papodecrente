/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useAppState } from "./useAppState";
import { LoginScreen } from "./components/LoginScreen";
import { ClientMenu } from "./components/ClientMenu";
import { KitchenDashboard } from "./components/KitchenDashboard";
import { CashierDashboard } from "./components/CashierDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { UserRole, OrderStatus } from "./types";
import { Sparkles, Store, RefreshCw, AlertCircle } from "lucide-react";

export default function App() {
  const {
    state,
    loading,
    error,
    toggleCaixa,
    addOrder,
    updateOrderStatus,
    saveProduct,
    deleteOrder,
    addTransaction,
    simulateIFood,
    pollNowIFood,
    resetStore
  } = useAppState();

  // Session state
  const [role, setRole] = useState<UserRole | "cliente" | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("");

  // Handling login success
  const handleLoginSuccess = (selectedRole: UserRole, name: string) => {
    setRole(selectedRole);
    setCurrentUser(name);
  };

  const handleSelectClientMenu = () => {
    setRole("cliente");
    setCurrentUser("Cliente da Mesa");
  };

  const handleLogout = () => {
    setRole(null);
    setCurrentUser("");
  };

  // High fidelity client order submit
  const handleClientOrderSubmitted = async (orderData: {
    clientName: string;
    type: "qrcode";
    tableNum: string;
    items: any[];
    paymentMethod: string;
  }) => {
    if (!addOrder) return null;
    // Map status initially as CONFIRMADO if they chose pix/card, or NOVO if cash checkout
    const initialStatus = orderData.paymentMethod === "dinheiro" 
      ? OrderStatus.AGUARDANDO_PAGAMENTO 
      : OrderStatus.CONFIRMADO;

    return await addOrder({
      clientName: orderData.clientName,
      type: "qrcode",
      tableNum: orderData.tableNum,
      items: orderData.items,
      paymentMethod: orderData.paymentMethod,
      status: initialStatus,
      user: "Menu QR Code"
    });
  };

  // Caixa manual order submit
  const handleCashierManualOrder = (orderData: {
    clientName: string;
    type: "balcao" | "ifood" | "qrcode";
    items: any[];
    paymentMethod: string;
  }) => {
    if (!addOrder) return;
    addOrder({
      clientName: orderData.clientName,
      type: orderData.type,
      items: orderData.items,
      paymentMethod: orderData.paymentMethod,
      status: OrderStatus.CONFIRMADO, // Goes straight to cooking queue!
      user: currentUser
    });
  };

  // Cashier manual ledger transaction
  const handleCashierTransaction = (tx: {
    type: "entrada" | "saida" | "sangria" | "suprimento";
    amount: number;
    description: string;
    paymentMethod: string;
  }) => {
    if (!addTransaction) return;
    const mappedType = tx.type === "sangria" || tx.type === "saida" ? "despesa" : "receita";
    addTransaction({
      type: mappedType,
      category: tx.type === "sangria" ? "Sangria" : "Suprimento",
      description: tx.description,
      amount: tx.amount,
      user: currentUser
    });
  };

  // Admin adjustments
  const handleAdminAddProduct = (prodData: any) => {
    if (!saveProduct) return;
    saveProduct(prodData, currentUser);
  };

  const handleAdminToggleAvailability = (prodId: string) => {
    if (!saveProduct || !state) return;
    const original = state.products.find(p => p.id === prodId);
    if (original) {
      saveProduct({
        id: prodId,
        available: !original.stock // standard stock toggle as availability
      }, currentUser);
    }
  };

  const handleAdminModifyPrice = (prodId: string, newPrice: number) => {
    if (!saveProduct) return;
    saveProduct({
      id: prodId,
      price: newPrice
    }, currentUser);
  };

  // Loading Splash Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="text-center space-y-4">
          <div className="relative inline-flex p-4 bg-orange-500/10 rounded-2xl text-orange-500 animate-pulse border border-orange-500/20">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-lg font-black tracking-widest uppercase text-white">Sincronizando Sistema 360</h2>
          <p className="text-xxs text-slate-500 font-mono tracking-wider">Aguardando resposta do servidor local...</p>
        </div>
      </div>
    );
  }

  // Display Synchronized server down error
  if (error || !state) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="text-center max-w-sm space-y-4 bg-slate-900 p-6 border border-slate-800 rounded-3xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
          <h2 className="text-base font-black uppercase text-white">Falha de Comunicação</h2>
          <p className="text-xxs text-slate-400 leading-relaxed">Não foi possível conectar com o banco de dados principal. Certifique-se de que o servidor está rodando.</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-xxs transition cursor-pointer"
          >
            Tentar Reconectar
          </button>
        </div>
      </div>
    );
  }

  // 1. Consumer mode QR Code Menu
  if (role === "cliente") {
    return (
      <ClientMenu
        products={state.products}
        onOrderSubmitted={handleClientOrderSubmitted}
        onExit={handleLogout}
      />
    );
  }

  // 2. Cozinheiro (Kitchen screen for Chef Marcos)
  if (role === "cozinha") {
    return (
      <KitchenDashboard
        orders={state.orders}
        onUpdateOrderStatus={(id, status) => {
          if (updateOrderStatus) updateOrderStatus(id, status, currentUser);
        }}
        onLogout={handleLogout}
        currentUser={currentUser}
      />
    );
  }

  // 3. Caixa (Operational cashier desk for Bruna)
  if (role === "caixa") {
    return (
      <CashierDashboard
        orders={state.orders}
        products={state.products}
        transactions={state.transactions}
        caixaStatus={state.caixaStatus}
        onToggleCaixa={(open, initialBalance) => {
          if (toggleCaixa) toggleCaixa(open, initialBalance, currentUser);
        }}
        onUpdateOrderStatus={(id, status) => {
          if (updateOrderStatus) updateOrderStatus(id, status, currentUser);
        }}
        onAddManualOrder={handleCashierManualOrder}
        onAddFinanceTransaction={handleCashierTransaction}
        onLogout={handleLogout}
        currentUser={currentUser}
        onPollNowIFood={pollNowIFood}
        onDeleteOrder={(id) => {
          if (deleteOrder) deleteOrder(id, currentUser);
        }}
      />
    );
  }

  // 4. ADM (Master administrator setup for Aline)
  if (role === "admin") {
    return (
      <AdminDashboard
        products={state.products}
        orders={state.orders}
        transactions={state.transactions}
        onAddProduct={handleAdminAddProduct}
        onToggleProductAvailable={(id) => {
          // simple toggle availability
          if (saveProduct) {
            const original = state.products.find(p => p.id === id);
            if (original) {
              saveProduct({
                id: id,
                stock: original.stock > 0 ? 0 : 50 // 0 means out of stock/disabled
              }, currentUser);
            }
          }
        }}
        onModifyProductPrice={handleAdminModifyPrice}
        onLogout={handleLogout}
        currentUser={currentUser}
        ifoodConfig={state.ifoodConfig}
        onPollNowIFood={pollNowIFood}
      />
    );
  }

  // 5. Default view: Clean Multi-Role Unified Entry Login Portals
  return (
    <LoginScreen
      onLoginSuccess={handleLoginSuccess}
      onSelectClientMenu={handleSelectClientMenu}
    />
  );
}
