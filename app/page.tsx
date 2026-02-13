
"use client";

import { useState, useEffect } from "react";
import { Loader2, LogOut, X, Download, Copy, ShieldAlert, KeyRound, CheckCircle2, Building2, ShieldCheck, Circle } from "lucide-react";
import { Button, Card } from "./ui-helpers";
import Login from "./components/login/login";
import Sidebar from "./components/sidebar/sidebar";
import WalletDashboard from "./components/dashbaord/dashboard"; 
import RegisterUserForm from "./admin/RegisterUserForm";
import KYCApprovalScreen from "./admin/KYCApprovalScreen";
import ManagedAccountsTable from "./admin/ManagedAccountsTable";
import KYCIdentityHub from "./components/kyc/KYCIdentityHub";
import { restoreWallet } from "./lib/phraseWallet";
import { server } from "./lib/stellar";

export default function Page() {
  /* --- APPLICATION STATE --- */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'BANK_ADMIN' | 'BENEFICIARY' | 'KYC_REQUIRED' | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [companyName, setCompanyName] = useState("");
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  
  /* --- UI CONTROL STATE --- */
  const [adminTab, setAdminTab] = useState<'DASHBOARD' | 'CREATE_USER' | 'KYC_APPROVAL' | 'VIEW_ACCOUNTS'>('DASHBOARD');
  const [phraseInput, setPhraseInput] = useState("");
  const [selectedTx, setSelectedTx] = useState<any>(null);

  /* --- SESSION RECOVERY LOGIC --- */
  // Inside Page() in app/page.tsx

useEffect(() => {
  const savedAuth = localStorage.getItem("gb_auth");
  const savedRole = localStorage.getItem("gb_role");
  const savedStatus = localStorage.getItem("gb_kyc_status");
  const savedCompany = localStorage.getItem("gb_companyName");

  if (savedAuth === "true") {
    setIsAuthenticated(true);
    setUserRole(savedRole as any);
    setKycStatus(savedStatus);
    setCompanyName(savedCompany || "");

    // --- SMART CONNECT LOGIC ---
    
    // Type A: Active Beneficiary (Auto-connect via individual keys)
    if (savedRole === 'BENEFICIARY' && savedStatus === 'ACTIVE') {
      const pub = localStorage.getItem("gb_public_key");
      const sec = localStorage.getItem("gb_secret_key");
      if (pub && sec) {
        setWallet({ publicKey: pub, secretKey: sec });
      }
    } 
    // Type B: Admin or Manually Restored Session (Connect via wallet object)
    else {
      const savedWallet = localStorage.getItem("gb_wallet");
      if (savedWallet && savedWallet !== "wa") { // Check for your previous 'wa' error
        try {
          const w = JSON.parse(savedWallet);
          setWallet(w);
        } catch (e) {
          console.error("Malformed wallet session. Authorization required.");
          localStorage.removeItem("gb_wallet");
        }
      }
    }
  }
  setIsSessionLoading(false);
}, []);

  /* --- AUTHENTICATION HANDLERS --- */
  const handleLoginSuccess = (role: any, name: string, status: string, walletData?: any) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setCompanyName(name);
    setKycStatus(status);
    localStorage.setItem("gb_kyc_status", status);

    // If active beneficiary, connect immediately using backend keys
    if (role === 'BENEFICIARY' && status === 'ACTIVE' && walletData) {
      localStorage.setItem("gb_public_key", walletData.publicKey);
      localStorage.setItem("gb_secret_key", walletData.secretKey);
      setWallet(walletData);
    }
  };

  const handlePassphraseAuth = () => {
    try {
      const w = restoreWallet(phraseInput);
      localStorage.setItem("gb_wallet", JSON.stringify(w));
      setWallet(w);
    } catch (e) {
      alert("Invalid Passphrase. Please check your recovery words.");
    }
  };

  /* --- LEDGER AUDIT LOGIC --- */
  const handleViewAudit = async (hash: string) => {
    try {
      const tx = await server.transactions().transaction(hash).call();
      const ops = await server.operations().forTransaction(hash).call();
      const mainOp = ops.records[0];
      setSelectedTx({
        hash: tx.hash, fee: tx.fee_charged, created_at: tx.created_at, successful: tx.successful,
        amount: mainOp.amount || "0.00", asset: mainOp.asset_code || "XLM",
        from: mainOp.from || mainOp.source_account, to: mainOp.to || mainOp.funder,
        type: mainOp.type
      });
    } catch (e) { console.error("Audit fail:", e); }
  };

  /* --- CONDITIONAL RENDERING --- */

  // A. Loading State
  if (isSessionLoading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
    </div>
  );

  // B. Unauthenticated State
  if (!isAuthenticated) return <Login onLoginSuccess={handleLoginSuccess} />;

  /// Inside app/page.tsx - Find your KYC Pending Redirect block
  // C. STAGE 01: KYC Identity Hub (Capture ONLY Pending status)
// This ensures that once status is 'DOCUMENTS_UPLOADED', this block is skipped.
if (userRole === 'KYC_REQUIRED' && kycStatus === 'KYC_PENDING') {
  return (
    <KYCIdentityHub onComplete={() => {
      localStorage.setItem("gb_kyc_status", "DOCUMENTS_UPLOADED");
      setKycStatus("DOCUMENTS_UPLOADED");
      // The state update above will trigger a re-render and skip this IF block
    }} />
  );
}

  // D. Authorization Lock: Passphrase for Admin OR Restricted Review
  if (!wallet) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
     {kycStatus === 'DOCUMENTS_UPLOADED' && (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 overflow-hidden">
        {/* Minimalist Backdrop Blur - Background Dashboard is visible */}
        <div className="absolute inset-0 bg-[#020617]/40 backdrop-blur-sm animate-in fade-in duration-1000" />
        
        <Card className="max-w-md w-full border-white/5 bg-slate-1000/95 p-10 text-center shadow-[0_0_80px_rgba(0,0,0,0.5)] relative z-10 rounded-[2.5rem] animate-in zoom-in-95">
          
          {/* --- UPDATED 4-STEP LIFECYCLE --- */}
          <div className="flex items-center justify-center gap-0 mb-10 px-2">
            {/* Step 1: Account Created by Bank */}
            <StatusStep icon={Building2} label="Account" status="CREATED" color="text-emerald-500" active />
            <div className="flex-1 h-[1px] bg-emerald-500/40 min-w-[20px] mb-4" />
            
            {/* Step 2: Documents Uploaded by User */}
            <StatusStep icon={CheckCircle2} label="Documents" status="UPLOADED" color="text-emerald-500" active />
            <div className="flex-1 h-[1px] bg-purple-500/40 min-w-[20px] mb-4" />
            
            {/* Step 3: Verification by Bank (CURRENT STATE) */}
            <StatusStep icon={ShieldCheck} label=" Kyc Verification" status="PENDING" color="text-purple-500" glow />
            <div className="flex-1 h-[1px] bg-slate-800 min-w-[20px] mb-4" />
            
            {/* Step 4: Active */}
            <StatusStep icon={Circle} label="Activation" status="Pending" color="text-slate-600" />
          </div>

          <div className="w-16 h-16 bg-purple-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20 shadow-inner">
            <ShieldCheck className="text-purple-500 w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Review in Progress</h2>
          <p className="text-slate-400 text-[11px] leading-relaxed mb-8 px-4 ">
            Your documents are currently being verified by the Ghazanfar Bank Compliance Team. Access will be granted automatically once they approved.
          </p>
          
          <div className="py-3 px-6 bg-slate-950 border border-slate-800 rounded-2xl inline-block mb-6">
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Est. Activation: 24-48 Hours
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              onClick={() => window.location.reload()} 
              className="w-full h-12 border border-slate-800 text-slate-500 uppercase text-[10px] font-black hover:bg-slate-800 transition-all"
            >
              Check Status
            </Button>

            <Button 
              variant="ghost"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full h-12 border border-slate-800 text-slate-500 uppercase text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all"
            >
              Back to Login
            </Button>
          </div>
        </Card>
      </div>
    )}

      {/* VAULT AUTH: Only shown if wallet is null (Admins or Inactive Users) */}
      <div className="max-w-md w-full space-y-8 animate-in zoom-in-95 duration-500">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">
            {userRole === 'BANK_ADMIN' ? 'Verify Stellar Wallet' : 'Wallet Identity Access'}
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase mt-2 tracking-widest">
            {userRole === 'BANK_ADMIN' ? 'PassPhrase Required' : 'PassPhrase Required'}
          </p>
        </div>
        <Card>
          <textarea 
            value={phraseInput}
            onChange={(e) => setPhraseInput(e.target.value)}
            placeholder="Enter your wallet passPhrase..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm h-32 mb-4 text-white outline-none focus:border-blue-500 font-mono resize-none"
          />
          <div className="space-y-3">
            <Button onClick={handlePassphraseAuth} className="w-full h-14 bg-blue-600 uppercase font-black tracking-widest shadow-lg shadow-blue-900/20">
              Verify {userRole === 'BANK_ADMIN' ? 'Admin' : 'User'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
function StatusStep({ icon: Icon, label, status, color, active = false, glow = false }: any) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <div className={`p-1.5 rounded-full bg-slate-900 border ${active ? 'border-emerald-500/50' : 'border-slate-800'} ${glow ? 'ring-2 ring-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.4)] border-purple-500' : ''}`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <div className="text-center leading-tight">
        <p className="text-[8px] font-black text-white uppercase tracking-tighter">{label}</p>
        <p className={`text-[6px] font-bold uppercase tracking-widest ${color}`}>{status}</p>
      </div>
    </div>
  );
}
  // E. Final Authorized Layout (Dashboard)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col relative overflow-hidden">
    
      {/* INSTITUTIONAL HEADER */}
      <header className="h-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-lg p-1.5 shadow-sm"><img src="/logo.png" className="w-full h-full object-contain" /></div>
          <div>
            <h1 className="font-black text-white uppercase tracking-tighter text-lg leading-none tracking-tight">Ghazanfar Bank</h1>
            <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span> 
              {userRole === 'BANK_ADMIN' ? 'Bank Portal' : 'Beneficiary Portal'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end border-r border-slate-800 pr-6">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white tracking-tight leading-none uppercase">{companyName || "Corporate Client"}</h2>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Wallet ID:</span>
              <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                <p className="text-[10px] font-mono text-blue-400 font-bold">
                  {wallet?.publicKey ? `${wallet.publicKey.substring(0, 8)}...${wallet.publicKey.substring(50)}` : "ADMIN_NODE"}
                </p>
                <button onClick={() => wallet && navigator.clipboard.writeText(wallet.publicKey)} className="text-slate-600 hover:text-blue-400"><Copy className="w-3 h-3" /></button>
              </div>
            </div>
          </div>
          <Button variant="danger" onClick={() => { localStorage.clear(); window.location.reload(); }} className="h-10 px-4 bg-red-950/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-red-900/20">Log Out</Button>
        </div>
      </header>

      {/* DASHBOARD BODY */}
      <div className="flex flex-1 overflow-hidden">
        {userRole === 'BANK_ADMIN' && <Sidebar activeTab={adminTab} setActiveTab={setAdminTab} />}
        <main className={`flex-1 overflow-y-auto p-8 banking-scrollbar ${userRole === 'BENEFICIARY' ? 'max-w-7xl mx-auto w-full' : ''}`}>
          {userRole === 'BANK_ADMIN' && adminTab !== 'DASHBOARD' ? (
              <div className="max-w-5xl mx-auto animate-in fade-in">
                {adminTab === 'CREATE_USER' && <RegisterUserForm onComplete={() => setAdminTab('KYC_APPROVAL')} />}
                {adminTab === 'KYC_APPROVAL' && <KYCApprovalScreen onApprove={() => setAdminTab('VIEW_ACCOUNTS')} />}
                {adminTab === 'VIEW_ACCOUNTS' && <ManagedAccountsTable />}
              </div>
          ) : (
            <WalletDashboard onAudit={handleViewAudit} userName={companyName} role={userRole} />
          )}
        </main>
      </div>

      {/* SHARED AUDIT MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[70] p-4" onClick={() => setSelectedTx(null)}>
          <Card className="max-w-md w-full border-blue-500/20 relative flex flex-col max-h-[90vh] p-0 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center"><h2 className="text-lg font-bold text-white tracking-tighter">Transaction Audit Summary</h2><X className="w-5 h-5 text-slate-500 cursor-pointer hover:text-white" onClick={() => setSelectedTx(null)} /></div>
            <div className="flex-1 overflow-y-auto p-6 banking-scrollbar space-y-6 text-center">
              <div className="py-4 bg-slate-950/50 rounded-2xl border border-slate-800"><p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Settlement Proof</p><div className="text-3xl font-mono font-bold text-white">{parseFloat(selectedTx.amount).toFixed(7)} <span className="text-blue-500 text-lg">{selectedTx.asset}</span></div></div>
              <div className="space-y-4 font-mono text-[10px] text-left">
                <div className="flex justify-between border-b border-slate-800/50 pb-2"><span className="text-slate-500 uppercase font-bold">Network Fee</span><span className="text-amber-500">{(parseInt(selectedTx.fee) / 10000000).toFixed(7)} XLM</span></div>
                <div className="flex flex-col border-b border-slate-800/50 pb-2 gap-1"><span className="text-slate-500 uppercase font-bold">From Node</span><span className="text-slate-400 break-all leading-relaxed">{selectedTx.from}</span></div>
                <div className="flex flex-col border-b border-slate-800/50 pb-2 gap-1"><span className="text-slate-500 uppercase font-bold">To Node</span><span className="text-slate-400 break-all leading-relaxed">{selectedTx.to}</span></div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 bg-slate-950/50"><Button onClick={() => window.print()} className="w-full h-12 gap-2 uppercase font-black text-[10px] tracking-widest bg-blue-600"><Download className="w-4 h-4"/> Download Certified Statement</Button></div>
          </Card>
        </div>
      )}
    </div>
  );
}