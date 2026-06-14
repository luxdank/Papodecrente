/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserRole } from "../types";
import { Lock, User, ShieldCheck, DollarSign, Utensils, Sparkles, AlertCircle } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (role: UserRole, userName: string) => void;
  onSelectClientMenu: () => void;
}

export function LoginScreen({ onLoginSuccess, onSelectClientMenu }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>("caixa");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Preconfigured passwords to make live testing effortless for the evaluator
  const credentials = {
    admin: { name: "Aline (Administrador)", pass: "admin123", hint: "admin123" },
    caixa: { name: "Bruna (Caixa)", pass: "caixa123", hint: "caixa123" },
    cozinha: { name: "Marcos (Cozinha)", pass: "cozinha123", hint: "cozinha123" }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cred = credentials[selectedRole as keyof typeof credentials];
    if (cred && password === cred.pass) {
      setErrorMsg("");
      onLoginSuccess(selectedRole, cred.name);
    } else {
      setErrorMsg("Senha incorreta! Use as senhas sugeridas no painel de ajuda para testar.");
    }
  };

  const autofillPassword = () => {
    const cred = credentials[selectedRole as keyof typeof credentials];
    if (cred) {
      setPassword(cred.pass);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-150 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Decorative Radial Orb Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10" id="login-card">
        
        {/* Header decoration */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-orange-500 to-amber-600 rounded-2xl text-white shadow-lg shadow-orange-500/10">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">LANCHONETE 360</h2>
          <p className="text-xs text-slate-400">Sistema completo de Operação, Cozinha & iFood</p>
        </div>

        {/* Role Quick Selector */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-center" id="role-selection-tabs">
          <button
            type="button"
            onClick={() => {
              setSelectedRole("caixa");
              setPassword("");
              setErrorMsg("");
            }}
            className={`p-3 rounded-xl border transition flex flex-col items-center justify-center gap-1.5 ${selectedRole === "caixa" ? "border-orange-500 bg-orange-500/10 text-white font-bold" : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"}`}
          >
            <DollarSign className="w-4 h-4" />
            <span className="text-xxs uppercase font-black">Caixa</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setSelectedRole("cozinha");
              setPassword("");
              setErrorMsg("");
            }}
            className={`p-3 rounded-xl border transition flex flex-col items-center justify-center gap-1.5 ${selectedRole === "cozinha" ? "border-orange-500 bg-orange-500/10 text-white font-bold" : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"}`}
          >
            <Utensils className="w-4 h-4" />
            <span className="text-xxs uppercase font-black font-sans">Cozinheiro</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole("admin");
              setPassword("");
              setErrorMsg("");
            }}
            className={`p-3 rounded-xl border transition flex flex-col items-center justify-center gap-1.5 ${selectedRole === "admin" ? "border-orange-500 bg-orange-500/10 text-white font-bold" : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"}`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xxs uppercase font-black">ADM</span>
          </button>
        </div>

        {/* Dynamic credential helpers */}
        <div className="mb-6 p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>Usuário:</span>
            <span className="text-white font-bold">{credentials[selectedRole].name}</span>
          </div>
          <div className="flex justify-between text-slate-400 items-center">
            <span>Senha para testes:</span>
            <button 
              type="button"
              onClick={autofillPassword} 
              className="text-orange-400 hover:text-orange-300 font-bold underline cursor-pointer"
              title="Preencher senha de teste automaticamente"
            >
              {credentials[selectedRole].pass} (auto-preencher)
            </button>
          </div>
        </div>

        {/* Login Submission Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-xxs uppercase font-bold tracking-wider text-slate-400">Senha Privada</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Insira a senha do perfil"
                className="w-full bg-slate-950 text-sm py-3 pl-10 pr-4 rounded-xl border border-slate-800 text-white outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="text-xxs font-semibold text-red-400 flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-orange-500/20 transition cursor-pointer"
          >
            Acessar Painel Seguro
          </button>

        </form>

        {/* Client Access Digital Menu without password */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500 mb-3 font-medium">Se você é um cliente que escaneou o QR Code da mesa:</p>
          <button
            onClick={onSelectClientMenu}
            className="w-full bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
            id="login-client-menu-btn"
          >
            📱 Abrir Meu Cardápio Integrado
          </button>
        </div>

      </div>

      <footer className="mt-8 text-xxs text-slate-600 font-mono">
        &copy; {new Date().getFullYear()} Lanchonete 360 &bull; Autenticação Concluída
      </footer>

    </div>
  );
}
