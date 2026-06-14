import { useState, useEffect, useCallback } from "react";
import { AppState, Order, OrderStatus, Product, FinancialTransaction } from "./types.js";

// Helper for playing audio sound alerts when a new order arrives
const playAlertSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play double beep (standard kitchen printer chime)
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
    playBeep(880, now, 0.1); // high note
    playBeep(880, now + 0.15, 0.15); // high note
  } catch (err) {
    console.warn("Audio Context playback failed or blocked by user gesture:", err);
  }
};

export function useAppState() {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastOrderCount, setLastOrderCount] = useState<number>(0);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/state");
      if (!res.ok) throw new Error("Falha ao sincronizar com o servidor");
      const data: AppState = await res.json();
      
      setState(data);

      // Check if new orders arrived to play kitchen alert sound
      if (data.orders && data.orders.length > 0) {
        if (lastOrderCount > 0 && data.orders.length > lastOrderCount) {
          // Verify if the newest order is indeed "NOVO" or "CONFIRMADO"
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
    } catch (err: any) {
      setError(err.message || "Erro de sincronização");
      setLoading(false);
    }
  }, [lastOrderCount]);

  // Initial load and periodic polling to simulate real-time WebSockets
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3500); // Pool every 3.5s for fast simulation
    return () => clearInterval(interval);
  }, [fetchState]);

  const toggleCaixa = async (open: boolean, initialBalance: number, user: string) => {
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

  const simulateIFood = async (simulateFailure: boolean, clientName?: string) => {
    try {
      const res = await fetch("/api/ifood/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulateFailure, clientName })
      });
      const body = await res.json();
      setState(body.data);
      return body.order;
    } catch (err) {
      console.error(err);
    }
  };

  const reprocessIFood = async (orderId: string, user: string) => {
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
    playAlertSound
  };
}
