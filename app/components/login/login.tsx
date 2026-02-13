"use client";
import React, { useState } from "react";
import { Card, Button, Input, Label } from "../../ui-helpers";
import { Loader2, ShieldCheck, Bolt, Eye, EyeOff, LogIn, Lock, Landmark } from "lucide-react";

export default function Login({ onLoginSuccess }: { onLoginSuccess: (role: any, name: string, status: string, walletData?: any) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    // 1. HARD-CODED ADMIN LOGIC
    if (email === "admin@ghazanfarbank.com" && password === "admin123") {
      const role = "BANK_ADMIN";
      const fullName = "Admin User";
      const status = "ACTIVE";

      localStorage.removeItem("gb_wallet");
      localStorage.removeItem("gb_public_key");
      localStorage.removeItem("gb_secret_key");
      localStorage.setItem("gb_auth", "true");
      localStorage.setItem("gb_role", role);
      localStorage.setItem("gb_companyName", fullName);
      localStorage.setItem("gb_kyc_status", status);

      onLoginSuccess(role, fullName, status);
      setLoading(false);
      return;
    }

    // 2. LIVE BENEFICIARY LOGIC
    try {
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.user;
        const role = user.user_type;
        const kycStatus = user.status;
        const fullName = `${user.first_name} ${user.last_name}`;

        localStorage.setItem("gb_auth", "true");
        localStorage.setItem("gb_user_id", user.user_id);
        localStorage.setItem("gb_companyName", fullName);
        localStorage.setItem("gb_kyc_status", kycStatus);

        let walletData = undefined;
        if (role === 'BENEFICIARY' && kycStatus === 'ACTIVE') {
          walletData = {
            publicKey: user.wallet_address,
            secretKey: user.secret_key
          };
          localStorage.setItem("gb_public_key", user.wallet_address);
          localStorage.setItem("gb_secret_key", user.secret_key);
        }

        if (role === 'BENEFICIARY' && kycStatus === 'KYC_PENDING') {
          localStorage.setItem("gb_role", "KYC_REQUIRED");
          onLoginSuccess("KYC_REQUIRED", fullName, kycStatus);
        } else {
          localStorage.setItem("gb_role", role);
          onLoginSuccess(role, fullName, kycStatus, walletData);
        }
      } else {
        setError(data.non_field_errors?.[0] || data.detail || "Authentication Failed");
      }
    } catch (err) {
      setError("Network error: Institutional node unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#020617] font-sans text-slate-200 flex items-center justify-center p-4 overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(at_0%_0%,_hsla(220,40%,10%,1)_0,_transparent_50%),_radial-gradient(at_50%_0%,_hsla(210,50%,20%,1)_0,_transparent_50%),_radial-gradient(at_100%_0%,_hsla(215,45%,15%,1)_0,_transparent_50%)] opacity-80"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-600/10 rounded-full blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Institutional Content */}
        <div className="hidden lg:flex flex-col space-y-8 px-12">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
              <img src="/logo.png" className="w-10 h-10 object-contain" alt="GB Logo" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white uppercase">Ghazanfar Bank</h1>
            
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-6xl font-black leading-[1.1] tracking-tighter text-white uppercase">
              Secure <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                Treasury Access
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md font-medium">
              Empowering global transactions with unmatched security and blockchain settlement speeds. Access your wallet now.
            </p>
          </div>

         
        </div>

        {/* Right Side: Login Card */}
        <div className="flex justify-center">
          <div className="w-full max-w-md p-[1px] bg-gradient-to-b from-white/20 to-transparent rounded-[2.5rem]">
            <div className="bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[2.45rem] border border-white/5 relative overflow-hidden shadow-2xl">
              
              <header className="mb-10 text-center lg:text-left">
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Sign In Portal</h2>
    
              </header>

              <form onSubmit={handleLogin} className="space-y-7">
                {/* Email Field */}
                <div className="space-y-2 group">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">Email ID </label>
                  <div className="relative border-b border-white/10 group-focus-within:border-blue-500 transition-all duration-500">
                    <input 
                      className="w-full bg-transparent py-3 text-lg font-light text-white placeholder-slate-700 outline-none focus:ring-0" 
                      placeholder="Enter your registered email" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2 group">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">Password</label>
                  </div>
                  <div className="relative border-b border-white/10 group-focus-within:border-blue-500 transition-all duration-500">
                    <input 
                      className="w-full bg-transparent py-3 text-lg font-light text-white placeholder-slate-700 outline-none focus:ring-0" 
                      placeholder="••••••••" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 bottom-3 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Status/Error Display */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                    disabled={loading}
                    // h-[56px] sets the exact height. w-full makes it span the container.
                    className="w-full h-[56px] bg-blue-600 hover:bg-blue-500 text-white font-bold text-[16px] uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center space-x-3 border border-blue-400/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                    {loading ? (
                        <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin w-5 h-5" />
                        <span className="text-[14px]">Authorizing...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                        <span>Login</span>
                        <LogIn size={18} className="opacity-80" />
                        </div>
                    )}
                    </Button>
              </form>

              <div className="mt-10 pt-6 border-t border-white/5 text-center">
                
              </div>
            </div>
          </div>
        </div>
      </main>

      
    </div>
  );
}