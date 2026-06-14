/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Product, CartItem, ExtraItem, OrderStatus } from "../types";
import { 
  ShoppingCart, 
  Trash2, 
  CheckCircle2, 
  ArrowLeft, 
  ChevronRight, 
  Sparkles, 
  Store, 
  Info,
  Clock,
  Plus,
  Minus
} from "lucide-react";

interface ClientMenuProps {
  products: Product[];
  onOrderSubmitted: (orderData: {
    clientName: string;
    type: "qrcode";
    tableNum: string;
    items: any[];
    paymentMethod: string;
  }) => Promise<any>;
  onExit: () => void;
}

export function ClientMenu({ products, onOrderSubmitted, onExit }: ClientMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  
  // Cart management
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Selected product details modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<ExtraItem[]>([]);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemObservation, setItemObservation] = useState("");

  // Checkout flow inputs
  const [tableNum, setTableNum] = useState("Mesa 05");
  const [clientName, setClientName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credito" | "debito" | "dinheiro">("pix");
  const [discountCoupon, setDiscountCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [addedItemName, setAddedItemName] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const triggerNotification = (name: string) => {
    setAddedItemName(name);
    setTimeout(() => {
      setAddedItemName(prev => prev === name ? null : prev);
    }, 2500);
  };

  const categories = [
    { id: "todos", label: "Todos" },
    { id: "lanches", label: "Burgers 🍔" },
    { id: "bebidas", label: "Bebidas 🥤" },
    { id: "porcoes", label: "Porções 🍟" },
    { id: "sobremesas", label: "Sobremesas 🍧" },
    { id: "combos", label: "Combos 😍" }
  ];

  const filteredProducts = activeCategory === "todos" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  // Add item to active cart
  const handleOpenProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setSelectedExtras([]);
    setItemQuantity(1);
    setItemObservation("");
  };

  const toggleExtra = (extra: ExtraItem) => {
    if (selectedExtras.some(e => e.id === extra.id)) {
      setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const newItem: CartItem = {
      product: selectedProduct,
      quantity: itemQuantity,
      selectedExtras: [...selectedExtras],
      observation: itemObservation
    };
    setCart([...cart, newItem]);
    triggerNotification(`${itemQuantity}x ${selectedProduct.name} adicionado ao carrinho!`);
    setSelectedProduct(null);
  };

  const removeItem = (index: number) => {
    setCart(cart.filter((_, idx) => idx !== index));
  };

  // Cart total math
  const cartSubtotal = cart.reduce((acc, current) => {
    const itemExtrasPrice = current.selectedExtras.reduce((sum, ext) => sum + ext.price, 0);
    return acc + (current.product.price + itemExtrasPrice) * current.quantity;
  }, 0);

  const discountAmount = couponApplied ? cartSubtotal * 0.1 : 0;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  const handleApplyCoupon = () => {
    if (discountCoupon.trim().toUpperCase() === "CUPOM10" || discountCoupon.trim().toUpperCase() === "LANCHE10") {
      setCouponApplied(true);
    } else {
      alert("Cupom inválido! Experimente aplicar CUPOM10.");
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const orderName = clientName.trim() || `Mesa ${tableNum}`;
      const mappedItems = cart.map(item => ({
        product: { id: item.product.id, name: item.product.name, price: item.product.price },
        quantity: item.quantity,
        selectedExtras: item.selectedExtras,
        observation: item.observation
      }));

      const newOrder = await onOrderSubmitted({
        clientName: orderName,
        type: "qrcode",
        tableNum: tableNum,
        items: mappedItems,
        paymentMethod: paymentMethod
      });

      if (newOrder) {
        setSuccessOrder(newOrder);
        setCart([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 flex flex-col font-sans" id="client-digital-menu">
      
      {/* Toast Notification for items added to cart */}
      {addedItemName && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xs px-4 py-3 bg-slate-905 border border-orange-500/40 text-white rounded-2xl shadow-xl flex items-center justify-between gap-3 font-bold text-xxs">
          <div className="flex items-center gap-2">
            <span className="bg-orange-500/20 text-orange-500 p-1 rounded-lg">🛒</span>
            <span className="line-clamp-2">{addedItemName}</span>
          </div>
          <span className="text-orange-400 font-extrabold text-xxxxs uppercase shrink-0">No Carrinho</span>
        </div>
      )}
      
      {/* Top Client Header */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wide uppercase">Lounge & Burgueria 360</h2>
              <span className="text-xxs text-amber-400 font-semibold block">📱 Pedidos por QR Code</span>
            </div>
          </div>
          <button
            onClick={onExit}
            className="text-xs bg-slate-850 hover:bg-slate-800 text-slate-300 py-1.5 px-3 rounded-lg border border-slate-700 font-bold"
          >
            Sair do Menu
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-md mx-auto w-full bg-white shadow-xl min-h-[calc(100vh-60px)] pb-24 relative">
        
        {/* Banner with logo */}
        <div className="bg-gradient-to-br from-slate-900 to-orange-950 p-6 text-white text-center rounded-b-[2rem] shadow-md border-b-2 border-orange-500/20">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow">
            <Store className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-lg font-black tracking-tight text-white mb-1">MESA DIGITAL AUTOMÁTICA</h1>
          <p className="text-xxs text-slate-300 max-w-xs mx-auto">Seu pedido vai direto para a nossa cozinha e painel do caixa!</p>
          
          <div className="mt-4 flex items-center justify-center gap-4 text-xxs text-slate-300 font-medium bg-black/25 py-1.5 px-3 rounded-full w-max mx-auto">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-orange-400" /> 20-30 min</span>
            <span className="text-slate-650">|</span>
            <span className="text-amber-400">🔥 Pratos Quentes</span>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="px-4 mt-6 overflow-x-auto flex gap-2 scrollbar-none py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${activeCategory === cat.id ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Success Placement Banner */}
        {successOrder && (
          <div className="mx-4 mt-6 p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl relative shadow-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-white shrink-0 animate-bounce" />
              <div>
                <h4 className="font-extrabold text-sm uppercase">Pedido Enviado com Sucesso!</h4>
                <p className="text-xxs text-teal-100 mt-1">Seu pedido é o de número <span className="font-mono text-xs font-black bg-emerald-700/60 px-1.5 py-0.5 rounded text-yellow-300">#{successOrder.displayId}</span>.</p>
                <p className="text-xxs text-teal-100 mt-0.5">Aguardando a confirmação do operador de caixa para seguir para a cozinha.</p>
              </div>
            </div>
            <button
              onClick={() => setSuccessOrder(null)}
              className="mt-4 w-full bg-white text-emerald-800 font-bold py-2 rounded-xl text-xxs transition active:scale-[0.98]"
            >
              Fazer outro pedido nesta mesa
            </button>
          </div>
        )}

        {/* Product Catalog Cards */}
        <div className="px-4 mt-6 space-y-4" id="client-catalog-list">
          <div className="flex items-center justify-between border-b pb-1.5">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-500">Filtrando Cardápio</h3>
            <span className="text-xxs text-slate-400">{filteredProducts.length} itens disponíveis</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => handleOpenProduct(p)}
                className="bg-white border hover:border-orange-200 rounded-2xl p-3 flex gap-3 cursor-pointer hover:shadow-xs transition active:scale-[0.99]"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 bg-slate-100 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-slate-905 text-sm line-clamp-1">{p.name}</h4>
                      {p.popular && (
                        <span className="bg-orange-100 text-orange-850 py-0.5 px-1.5 rounded text-xxxxs uppercase font-black tracking-wider shrink-0">Bestseller</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xxs mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <span className="font-black text-sm text-slate-900 font-sans">R$ {p.price.toFixed(2)}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xxxxs text-slate-400 font-bold hover:underline">Opcionais &gt;</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newItem: CartItem = {
                            product: p,
                            quantity: 1,
                            selectedExtras: [],
                            observation: ""
                          };
                          setCart((prev) => [...prev, newItem]);
                          triggerNotification(`${p.name} adicionado ao carrinho!`);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xxs py-2 px-3.5 rounded-xl transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-md shadow-orange-500/10"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky footer checkout bar if cart not empty */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-4 shadow-xl max-w-md mx-auto z-40">
            {!isCheckoutOpen ? (
              /* COMPACT DRAWER TRIGGER BAR */
              <div className="flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="bg-orange-100 p-2 rounded-xl text-orange-600 relative">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div>
                    <span className="font-extrabold text-xxs text-slate-800 block leading-tight">Itens Escolhidos</span>
                    <span className="text-xxxxs text-slate-400 font-bold">Total: R$ {cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md shadow-orange-500/20"
                >
                  Ver Carrinho e Pedir ➔
                </button>
              </div>
            ) : (
              /* DETAILED EXPANDED CART & CHECKOUT FORM */
              <div className="space-y-3 animate-slide-up">
                <div className="flex items-center justify-between border-b pb-2">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="text-xxxxs text-slate-500 hover:text-orange-600 font-extrabold flex items-center gap-1 transition"
                  >
                    &larr; Continuar Comprando
                  </button>
                  <span className="font-extrabold text-xxs text-slate-800">Finalizar Mesa</span>
                  <span className="text-xxs font-black text-slate-900 font-mono">R$ {cartTotal.toFixed(2)}</span>
                </div>

                {/* Quick checkout form inside cart view Drawer */}
                <div className="bg-slate-50 p-3 rounded-2xl border mb-2 space-y-3 max-h-[40vh] overflow-y-auto scrollbar-thin">
                  
                  {/* Detailed cart contents listed inside the expanded panel */}
                  <div className="space-y-2 border-b pb-3 border-dashed">
                    <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Itens no seu Carrinho</span>
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-2 text-xxs">
                        <div>
                          <span className="font-bold text-orange-600">{item.quantity}x</span> <span className="font-semibold text-slate-900">{item.product.name}</span>
                          {item.selectedExtras.length > 0 && (
                            <span className="text-xxxxs block text-slate-400">+ Adicionais: {item.selectedExtras.map(e => e.name).join(", ")}</span>
                          )}
                          {item.observation && (
                            <span className="text-xxxxs italic block text-amber-505">Obs: "{item.observation}"</span>
                          )}
                        </div>
                        <div className="text-right flex items-center gap-1.5 shrink-0">
                          <span className="font-bold font-mono">R$ {((item.product.price + item.selectedExtras.reduce((sum, e) => sum + e.price, 0)) * item.quantity).toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newCart = cart.filter((_, i) => i !== idx);
                              setCart(newCart);
                              if (newCart.length === 0) {
                                setIsCheckoutOpen(false);
                              }
                            }}
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xxs">
                    <div>
                      <label className="block text-slate-500 uppercase font-black tracking-wider mb-1">Mesa Coletora</label>
                      <input
                        type="text"
                        required
                        value={tableNum}
                        onChange={(e) => setTableNum(e.target.value)}
                        placeholder="Mesa 05"
                        className="w-full bg-white border rounded-lg py-1 px-2 font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 uppercase font-black tracking-wider mb-1">Seu Nome para Comanda</label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Seu Nome"
                        className="w-full bg-white border rounded-lg py-1 px-2 text-slate-800 font-bold"
                      />
                    </div>
                  </div>

                  {/* Coupon Row */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Cupom de Desconto? Usar CUPOM10"
                      value={discountCoupon}
                      onChange={(e) => setDiscountCoupon(e.target.value)}
                      className="flex-1 bg-white border rounded-lg text-xxs px-2 text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-slate-700 text-white font-bold text-xxs py-1.5 px-3 rounded-lg"
                    >
                      Aplicar
                    </button>
                  </div>

                  {couponApplied && (
                    <p className="text-xxxxs text-emerald-600 font-black flex items-center gap-1 bg-emerald-50 p-1 border rounded">
                      <CheckCircle2 className="w-3 h-3" /> Desconto de 10% do CUPOM10 aplicado!
                    </p>
                  )}

                  {/* Payment selector */}
                  <div>
                    <span className="block text-slate-500 uppercase font-black tracking-wider text-xxs mb-1">Como deseja pagar?</span>
                    <div className="grid grid-cols-4 gap-1.5 text-xxs">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("pix")}
                        className={`py-1.5 border rounded-lg font-bold text-center capitalize cursor-pointer ${paymentMethod === "pix" ? "border-orange-500 bg-orange-500/10 text-orange-650" : "bg-white"}`}
                      >
                        PIX
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("credito")}
                        className={`py-1.5 border rounded-lg font-bold text-center capitalize cursor-pointer ${paymentMethod === "credito" ? "border-orange-500 bg-orange-500/10 text-orange-650" : "bg-white"}`}
                      >
                        Crédito
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("debito")}
                        className={`py-1.5 border rounded-lg font-bold text-center capitalize cursor-pointer ${paymentMethod === "debito" ? "border-orange-500 bg-orange-500/10 text-orange-650" : "bg-white"}`}
                      >
                        Débito
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("dinheiro")}
                        className={`py-1.5 border rounded-lg font-bold text-center capitalize cursor-pointer ${paymentMethod === "dinheiro" ? "border-orange-500 bg-orange-500/10 text-orange-650" : "bg-white"}`}
                      >
                        Dinheiro
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit order */}
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white py-3 font-extrabold text-xs uppercase tracking-wide rounded-xl shadow-lg shadow-orange-500/20 transition cursor-pointer"
                >
                  {isSubmitting ? "Enviando Pedido à Cozinha..." : `Confirmar Compra (R$ ${cartTotal.toFixed(2)})`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cart Listing display in customer view (only when checkout drawer is closed) */}
        {cart.length > 0 && !successOrder && !isCheckoutOpen && (
          <div className="mx-4 mt-6 p-4 bg-slate-50 border rounded-2xl animate-fade-in">
            <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider mb-2">Comanda Atual da sua Mesa</h4>
            <div className="space-y-2.5 max-h-40 overflow-y-auto">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-2 text-xs border-b pb-1.5 border-dashed">
                  <div>
                    <span className="font-bold text-teal-605">{item.quantity}x</span> {item.product.name}
                    {item.selectedExtras.length > 0 && (
                      <span className="text-xxs block text-slate-400">+ Adicionais: {item.selectedExtras.map(e => e.name).join(", ")}</span>
                    )}
                    {item.observation && (
                      <span className="text-xxs italic block text-amber-500">Obs: "{item.observation}"</span>
                    )}
                  </div>
                  <div className="text-right flex items-center gap-1.5 shrink-0">
                    <span className="font-bold">R$ {((item.product.price + item.selectedExtras.reduce((sum, e) => sum + e.price, 0)) * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => {
                        const newCart = cart.filter((_, i) => i !== idx);
                        setCart(newCart);
                      }}
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCT DETAILS AND CUSTOMIZATION MODAL (OVERLAY) */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center z-50 p-4">
            <div className="bg-white rounded-t-3xl rounded-b-xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl p-5 border-t-2 border-orange-500 animate-slide-up">
              
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xxxxs bg-orange-100 text-orange-900 font-extrabold tracking-widest uppercase px-1.5 py-0.5 rounded">Adicionar opcionais</span>
                  <h3 className="font-black text-base text-slate-900 mt-1">{selectedProduct.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="bg-slate-100 text-slate-500 hover:text-slate-900 py-1 px-2.5 rounded-lg text-xxs font-black"
                >
                  X
                </button>
              </div>

              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-40 bg-slate-100 rounded-xl object-cover mt-3 shadow-xs"
              />

              <p className="text-slate-500 text-xxs leading-relaxed mt-2.5">{selectedProduct.description}</p>

              {/* Extras List */}
              {selectedProduct.extras.length > 0 && (
                <div className="mt-4 space-y-2">
                  <span className="block text-xxs font-black uppercase tracking-wider text-slate-400">Turbine seu pedido (Opcional)</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {selectedProduct.extras.map((extra) => {
                      const isSelected = selectedExtras.some(e => e.id === extra.id);
                      return (
                        <button
                          key={extra.id}
                          type="button"
                          onClick={() => toggleExtra(extra)}
                          className={`w-full p-2 rounded-xl text-left border flex items-center justify-between text-xs transition ${isSelected ? "border-orange-500 bg-orange-50/60" : "border-slate-100"}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-md border flex items-center justify-center font-bold text-xxs ${isSelected ? "bg-orange-500 border-orange-500 text-white" : "bg-white"}`}>
                              {isSelected && "✓"}
                            </span>
                            <span>{extra.name}</span>
                          </div>
                          <span className="font-bold text-slate-700 font-sans">+ R$ {extra.price.toFixed(2)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Observation Field */}
              <div className="mt-4 space-y-1">
                <span className="block text-xxs font-black uppercase tracking-wider text-slate-400">Observações adicionais</span>
                <textarea
                  placeholder="Ex: sem queijo, mal passado, molho à parte..."
                  value={itemObservation}
                  onChange={(e) => setItemObservation(e.target.value)}
                  className="w-full text-xs font-medium border bg-slate-50 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-orange-500 min-h-[60px]"
                />
              </div>

              {/* Quantity Selector and Total Button */}
              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 bg-slate-100 rounded-2xl p-1.5 shrink-0 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    className="w-9 h-9 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 text-slate-705 flex items-center justify-center transition active:scale-95 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-black text-sm px-1.5 text-slate-900">{itemQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setItemQuantity(itemQuantity + 1)}
                    className="w-9 h-9 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 text-slate-705 flex items-center justify-center transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-extrabold text-xs py-3.5 px-4 rounded-xl text-center shadow shadow-orange-500/20 transition cursor-pointer"
                >
                  Confirmar item (R$ {((selectedProduct.price + selectedExtras.reduce((sum, e) => sum + e.price, 0)) * itemQuantity).toFixed(2)})
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
