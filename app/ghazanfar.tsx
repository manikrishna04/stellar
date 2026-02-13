"use client";

import { useState, useEffect } from "react";
import { 
  Copy, RefreshCw, Wallet, Send, ArrowRightLeft, ShieldPlus, History, 
  Key, LogOut, CheckCircle, AlertCircle, Search, Loader2, Trash2, 
  Settings, ArrowDown, Plus, PenTool, TrendingUp, Landmark, ExternalLink, Info, Activity, X, ShieldCheck, Download, Eye, EyeOff, Building2, Briefcase
} from "lucide-react";
import { Asset } from "@stellar/stellar-sdk";
import { server } from "./lib/stellar";
import { createWallet, restoreWallet } from "./lib/phraseWallet";
import { getBalances, getTransactions } from "./lib/balances";
import { sendPayment, changeTrustline, sendCrossAssetPayment } from "./lib/payments";
import { swapAssets } from "./lib/swap"; 
import { searchAssets, AssetRecord } from "./lib/assets";
import { createLiquidityPool } from "./lib/liquidity";

/* ---------------------- AUTH CONFIG ---------------------- */
const HARDCODED_USERS = [
  {
    email: "moneyverse@gmail.com",
    password: "mvpay123",
    company: "Moneyverse Pvt Ltd"
  },
  {
    email: "moneyverse2@gmail.com",
    password: "mvpay123",
    company: "Fintech Pvt Ltd"
  }
];

// --- UI Helpers ---
const Card = ({ children, className = "" }: any) => (<div className={`bg-slate-900 border border-slate-800 rounded-xl p-6 ${className}`}>{children}</div>);
const Button = ({ onClick, disabled, variant = "primary", children, className = "" }: any) => {
  const styles: any = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-800",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200",
    danger: "bg-red-900/20 hover:bg-red-900/40 text-red-400",
    ramp: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20",
    ghost: "text-slate-500 hover:text-white"
  };
  return <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${styles[variant]} ${className}`}>{children}</button>;
};
const Input = (props: any) => (<input {...props} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600" />);
const Label = ({ children }: { children: React.ReactNode }) => (<label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">{children}</label>);

export default function WalletDashboard() {
  /* ---------------------- STATE MANAGEMENT ---------------------- */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "", company: "" });

  const [wallet, setWallet] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("send");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });
  const [balances, setBalances] = useState<any[]>([]);
  const [txs, setTxs] = useState<any[]>([]);
  const [receipt, setReceipt] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>(["B2B Settlement Node ready..."]);
  const [selectedAssetInfo, setSelectedAssetInfo] = useState<any>(null);
  // Account Creation/FX States
  const [newAccountData, setNewAccountData] = useState<any>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<string | null>(null);
  const [swapForm, setSwapForm] = useState({ sendAssetIndex: 0, destAssetIndex: 0, amount: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AssetRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [manualAssetForm, setManualAssetForm] = useState({ code: "", issuer: "" });
  const [phraseInput, setPhraseInput] = useState("");
  const [paymentMode, setPaymentMode] = useState<'DIRECT' | 'FX'>('DIRECT');
  const [sendForm, setSendForm] = useState({ vendorName: "", to: "", amount: "", sourceIndex: 0, destCode: "USDC", destIssuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" });
  const [liquidityModal, setLiquidityModal] = useState<{show: boolean, code: string, issuer: string}>({ show: false, code: "", issuer: "" });
  const [liqAmounts, setLiqAmounts] = useState({ xlm: "1000", asset: "1000" });
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [fetchingTx, setFetchingTx] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  // const feeInXlm = (parseInt(tx.fee_charged) / 10000000).toFixed(7);
  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 7)]);

  /* ---------------------- AUTH LOGIC ---------------------- */
 const handleLogin = () => {
  const match = HARDCODED_USERS.find(
    u => u.email === loginForm.email && u.password === loginForm.password 
  );
  if (!match) {
    setStatus({ type: "error", msg: "Invalid enterprise credentials" });
    return;
  }
  
  // Save to state
  setCompanyName(match.company);
  setIsAuthenticated(true);
  
  // Save to localStorage
  localStorage.setItem("gb_isAuthenticated", "true");
  localStorage.setItem("gb_companyName", match.company);
  
  setStatus({ type: "success", msg: "Login successful" });
};

  /* ---------------------- SESSION RECOVERY ---------------------- */
useEffect(() => {
  const savedAuth = localStorage.getItem("gb_isAuthenticated");
  const savedCompany = localStorage.getItem("gb_companyName");
  const savedWallet = localStorage.getItem("gb_wallet");

  if (savedAuth === "true" && savedWallet) {
    const parsedWallet = JSON.parse(savedWallet);
    setWallet(parsedWallet);
    setCompanyName(savedCompany || "");
    setIsAuthenticated(true);
    refreshData(parsedWallet.publicKey);
  }

  // CRITICAL: Turn off loading state after checking localStorage
  setIsSessionLoading(false);
}, []);

  /* ---------------------- EFFECT: FX PREVIEW ---------------------- */
  useEffect(() => {
    const fetchFXPreview = async () => {
      if (paymentMode === 'FX' && sendForm.amount && parseFloat(sendForm.amount) > 0 && balances.length > 0) {
        try {
          const source = balances[sendForm.sourceIndex];
          const sCode = source.asset.split(':')[0];
          const sIssuer = source.asset.split(':')[1];
          const sendAsset = sCode === "XLM" ? Asset.native() : new Asset(sCode, sIssuer);
          const destAsset = sendForm.destCode === "XLM" ? Asset.native() : new Asset(sendForm.destCode, sendForm.destIssuer);

          const paths = await server.strictReceivePaths(sendAsset, destAsset, sendForm.amount).call();
          if (paths.records.length > 0) setEstimatedCost(paths.records[0].source_amount);
        } catch (e) { setEstimatedCost(null); }
      } else { setEstimatedCost(null); }
    };
    fetchFXPreview();
  }, [sendForm.amount, sendForm.destCode, sendForm.sourceIndex, paymentMode, balances]);

  /* ---------------------- ENGINE ACTIONS ---------------------- */
  const refreshData = async (pubKey: string) => {
    try {
      const [b, t] = await Promise.all([getBalances(pubKey), getTransactions(pubKey)]);
      setBalances(b);
      setTxs(t);
    } catch (e) { addLog("Failed to sync ledger."); }
  };

  const handleRestore = async () => {
  setLoading(true);
  try {
    const w = restoreWallet(phraseInput);
    setWallet(w);
    
    // Save wallet to localStorage
    localStorage.setItem("gb_wallet", JSON.stringify(w));
    
    await refreshData(w.publicKey);
    addLog("Node authorized and session saved.");
  } catch { 
    setStatus({ type: "error", msg: "Invalid mnemonic phrase" }); 
  }
  setLoading(false);
};

  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      const data = await createWallet();
      setNewAccountData(data);
      addLog("New corporate wallet generated.");
    } catch { setStatus({ type: 'error', msg: "Generation error" }); }
    setLoading(false);
  };

  const handleSwap = async () => {
    setLoading(true); setStatus({ type: null, msg: '' });
    try {
      const s = balances[swapForm.sendAssetIndex];
      const t = balances[swapForm.destAssetIndex];
      const res: any = await swapAssets(wallet.secretKey, s.asset.split(':')[0], s.asset.split(':')[1], t.asset.split(':')[0], t.asset.split(':')[1], swapForm.amount);
      await refreshData(wallet.publicKey);
      setReceipt({...res, type: 'TREASURY_SWAP'});
    } catch { setStatus({ type: 'error', msg: "Swap failed: No path" }); }
    setLoading(false);
  };

  const handleTransfer = async () => {
    setLoading(true); setStatus({ type: null, msg: '' });
    try {
      const source = balances[sendForm.sourceIndex];
      const sCode = source.asset.split(':')[0];
      const sIssuer = source.asset.split(':')[1];
      let res: any;
      if (paymentMode === 'DIRECT') {
        res = await sendPayment(wallet.secretKey, sendForm.to, sendForm.amount, sCode, sIssuer, `Ref: ${sendForm.vendorName}`);
      } else {
        res = await sendCrossAssetPayment(wallet.secretKey, sendForm.to, sCode, sIssuer, sendForm.destCode, sendForm.destIssuer, sendForm.amount, `FX: ${sendForm.vendorName}`);
      }
      setReceipt({...res, vendor: sendForm.vendorName, type: paymentMode === 'DIRECT' ? 'B2B_SETTLEMENT' : 'CLEARING_SETTLEMENT'});
      await refreshData(wallet.publicKey);
    } catch { setStatus({ type: 'error', msg: "Network rejection" }); }
    setLoading(false);
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setStatus({ type: 'success', msg: 'Copied!' });
    setTimeout(() => setStatus({ type: null, msg: '' }), 2000);
  };

  const handleAddAsset = async (code: string, issuer: string) => {
    setLoading(true);
    try {
      await changeTrustline(wallet.secretKey, code, issuer);
      await refreshData(wallet.publicKey);
      setStatus({ type: 'success', msg: `Trusted ${code}` });
    } catch { setStatus({ type: 'error', msg: "Trust failed" }); }
    setLoading(false);
  };
  const handleLogout = () => {
  // Clear State
  setWallet(null);
  setIsAuthenticated(false);
  setCompanyName("");
  setBalances([]);
  setTxs([]);
  setStatus({ type: null, msg: '' });

  // Clear localStorage
  localStorage.removeItem("gb_isAuthenticated");
  localStorage.removeItem("gb_companyName");
  localStorage.removeItem("gb_wallet");
  
  addLog("Session terminated securely.");
};
  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) return;
    setIsSearching(true);
    const r = await searchAssets(q);
    setSearchResults(r);
    setIsSearching(false);
  };
  
const handleRemoveAsset = async (code: string, issuer: string, balance: string) => {
  // Check if balance is 0 (Stellar rule: cannot delete if you hold funds)
  if (parseFloat(balance) > 0) {
    addLog(`Error: Clear ${code} balance before removing.`);
    setStatus({ type: 'error', msg: "Balance must be 0 to remove." });
    return;
  }

  setLoading(true);
  addLog(`Ledger: Removing trustline for ${code}...`);
  try {
    // limit "0" deletes the trustline
    await changeTrustline(wallet.secretKey, code, issuer, "0"); 
    await refreshData(wallet.publicKey);
    addLog(`Success: ${code} asset removed.`);
    setStatus({ type: 'success', msg: `Removed ${code}` });
  } catch (e: any) {
    addLog("Rejection: Trustline removal failed.");
    setStatus({ type: 'error', msg: "Failed to remove asset." });
  }
  setLoading(false);
};
const handleViewAudit = async (hash: string) => {
  setFetchingTx(true);
  try {
    // 1. Fetch the main transaction data
    const tx = await server.transactions().transaction(hash).call();
    
    // 2. Fetch the operations within that transaction to get the amount/asset
    const ops = await server.operations().forTransaction(hash).call();
    const mainOp = ops.records[0]; // Usually the first operation contains the payment info

    setSelectedTx({
      hash: tx.hash,
      ledger: tx.ledger_attr,
      fee: tx.fee_charged,
      memo: tx.memo,
      created_at: tx.created_at,
      successful: tx.successful,
      // Mapping operation details
      amount: mainOp.amount || "0.00",
      asset: mainOp.asset_code || "XLM",
      from: mainOp.from || mainOp.source_account,
      to: mainOp.to || mainOp.funder || "System Operation",
      type: mainOp.type.replace(/_/g, ' ')
    });
  } catch (e) {
    addLog("Audit Retrieval Failed: Link to ledger broken.");
  } finally {
    setFetchingTx(false);
  }
};
// Place this before your "if (!isAuthenticated)" logic
if (isSessionLoading) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
          Securing Session...
        </p>
      </div>
    </div>
  );
}
  /* ---------------------- RENDER: LOGIN ---------------------- */
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      
      <div className="max-w-md w-full space-y-6 animate-in fade-in duration-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center ">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-15 h-15 object-contain" 
            />
          </div>
          <h1 className="text-3xl font-bold text-white mt-4 tracking-tight">Welcome to Ghazanfar Bank</h1>
          {/* <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Authorized Personnel Only</p> */}
        </div>
        <Card className="shadow-2xl">
          <div className="space-y-4">
            <div><Label>Organization Email</Label><Input value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} placeholder="Enter registered email" /></div>
            <div><Label>Access Password</Label><Input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="********" /></div>
            {/* <div><Label>Registered Company Name</Label><Input value={loginForm.company} onChange={e => setLoginForm({ ...loginForm, company: e.target.value })} placeholder="Exact Company Name" /></div> */}
            {status.type === 'error' && <p className="text-red-400 text-[10px] font-bold uppercase text-center">{status.msg}</p>}
            <Button onClick={handleLogin} className="w-full h-12">Login</Button>
          </div>
        </Card>
      </div>
    </div>
  );

  /* ---------------------- RENDER: WALLET ACCESS ---------------------- */
  if (!wallet) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {newAccountData && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-blue-500/30 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8"><div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500"><Building2 className="w-8 h-8"/></div><h2 className="text-2xl font-bold">Treasury wallet Generated</h2><p className="text-slate-400 text-sm mt-2">Download keys below. They are required for access.</p></div>
            <div className="space-y-4">
              <div className="bg-black/40 p-4 rounded-xl border border-slate-800"><Label>Public Address</Label><p className="text-[11px] font-mono text-slate-300 break-all">{newAccountData.publicKey}</p></div>
              <div className="bg-black/40 p-4 rounded-xl border border-slate-800"><Label>Secret Key</Label><p className="text-[11px] font-mono text-slate-300 break-all">{newAccountData.secretKey}</p></div>
              <div className="bg-black/40 p-4 rounded-xl border border-slate-800"><Label>Access Mnemonic</Label><p className="text-sm font-medium text-blue-400 leading-relaxed">{newAccountData.mnemonic}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <Button onClick={() => {
                const content = `wallet BACKUP\nCompany: ${companyName}\nAddress: ${newAccountData.publicKey}\nSecret Key: ${newAccountData.secretKey}\nMnemonic: ${newAccountData.mnemonic}`;
                const blob = new Blob([content], { type: "text/plain" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "wallet-backup.txt"; link.click();
              }} variant="secondary" className="h-12"><Download className="w-4 h-4"/> Backup TXT</Button>
              <Button onClick={() => { setPhraseInput(newAccountData.mnemonic); setNewAccountData(null); }} className="h-12 bg-emerald-600">I have saved keys</Button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-md w-full space-y-8 animate-in zoom-in-95 duration-500">
        <div className="text-center"><Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4"/><h1 className="text-3xl font-bold text-white tracking-tighter">Treasury Access</h1><p className="text-slate-500 text-xs font-bold uppercase">{companyName}</p></div>
        <Card className="bg-slate-900/50 backdrop-blur">
          <textarea value={phraseInput} onChange={e=>setPhraseInput(e.target.value)} placeholder="wallet passphrase..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm h-24 mb-4 text-white resize-none outline-none focus:border-blue-500" />
          <div className="space-y-3">
            <Button onClick={handleRestore} disabled={loading || !phraseInput} className="w-full h-12">Login to wallet</Button>
            <Button onClick={handleCreateAccount} variant="secondary" disabled={loading} className="w-full h-12 border border-slate-700 bg-transparent text-[10px] uppercase font-black tracking-widest">Create New Wallet</Button>
          </div>
        </Card>
      </div>
    </div>
  );

  /* ---------------------- RENDER: MAIN DASHBOARD ---------------------- */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* MODALS */}
      {liquidityModal.show && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full border-emerald-500/30">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400"><TrendingUp className="w-5 h-5"/> Seed Market</h2><X className="cursor-pointer" onClick={() => setLiquidityModal({...liquidityModal, show: false})}/></div>
            <div className="space-y-4 mb-8">
               <div className="space-y-1.5"><Label>Provision XLM</Label><Input type="number" value={liqAmounts.xlm} onChange={(e:any)=>setLiqAmounts({...liqAmounts, xlm: e.target.value})}/></div>
               <div className="space-y-1.5"><Label>Provision {liquidityModal.code}</Label><Input type="number" value={liqAmounts.asset} onChange={(e:any)=>setLiqAmounts({...liqAmounts, asset: e.target.value})}/></div>
            </div>
            <Button onClick={handleCreateMarket} disabled={loading} variant="ramp" className="w-full h-14">Confirm Seeding</Button>
          </Card>
        </div>
      )}

      {receipt && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <Card className="max-w-sm w-full text-center border-blue-500/30">
              <ShieldCheck className="text-emerald-500 w-12 h-12 mx-auto mb-4"/>
              <h2 className="text-xl font-bold uppercase tracking-tight">Transaction Successfull</h2>
              <div className="my-6 p-4 bg-black/40 rounded-2xl text-left space-y-3 font-mono text-[10px]">
                 <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500 uppercase">Vendor</span><span className="text-white">{receipt.vendor || 'Corporate Entity'}</span></div>
                 <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500 uppercase">Network Fee</span><span className="text-emerald-400">{receipt.fee} Stroops</span></div>
                 <p className="text-blue-400 break-all leading-tight">{receipt.hash}</p>
              </div>
              <Button onClick={()=>setReceipt(null)} className="w-full">Done</Button>
          </Card>
        </div>
      )}

      {/* HEADER WITH COMPANY NAME */}
      <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          
          {/* LEFT: BANK BRANDING */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-sm">
              <img 
                src="/logo.png" 
                alt="Ghazanfar Bank" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="hidden md:block">
              <h1 className="font-extrabold text-lg text-white tracking-tight leading-none uppercase">
                Ghazanfar Bank
              </h1>
              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Secure Corporate Portal
              </p>
            </div>
          </div>

          {/* RIGHT: CUSTOMER CONTEXT & SESSION MANAGEMENT */}
          {/* RIGHT: CUSTOMER CONTEXT */}
          <div className="flex items-center gap-6">
            
            {/* USER ENTITY BOX */}
            <div className="flex flex-col items-end border-r border-slate-800 pr-6">
              <div className="flex items-center gap-2">
                <div className="text-right">
      
                  <h2 className="text-sm font-extrabold text-white tracking-tight">
                    {companyName || "Corporate Client"}
                  </h2>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-blue-400" />
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Wallet Address :</span>
                
                <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400">
                    {wallet.publicKey.substring(0, 6)}...{wallet.publicKey.substring(50)}
                  </span>
                  <button 
                    onClick={() => copyToClipboard(wallet.publicKey)}
                    className="text-slate-600 hover:text-blue-400 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* LOGOUT BUTTON */}
            <Button 
              variant="danger" 
              onClick={handleLogout} 
              className="h-10 px-4 bg-red-950/10 border border-red-500/20 hover:bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        
        {/* SUB-HEADER: TRANSACTION BAR (Typical in Banking Apps) */}
        <div className="bg-slate-900/50 border-b border-slate-800 px-4 py-2">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-medium text-slate-500 uppercase tracking-widest">
            <div className="flex gap-4">
              <span>Region: <span className="text-slate-300">Global (Stellar)</span></span>
              <span>Environment: <span className="text-blue-400">TestNet</span></span>
            </div>
            <span>Last Login: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-1000">
 
        {/* PORTFOLIO GRID */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 ml-1">
              <Briefcase className="w-3 h-3 text-blue-500"/> Treasury Asset Classes
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {balances.map((b, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition-all group shadow-lg">
                    <div className="flex justify-between items-start mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold bg-blue-900/30 text-blue-400`}>
                          {b.asset[0]}
                        </div>
                        
                        {/* --- REMOVE ASSET ACTION --- */}
                        {b.asset !== 'XLM' && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Liquidity shortcut */}
                            <button onClick={()=>setLiquidityModal({show: true, code: b.asset.split(':')[0], issuer: b.asset.split(':')[1]})} className="text-emerald-500 hover:text-emerald-400">
                              <TrendingUp className="w-4 h-4"/>
                            </button>
                            
                            {/* THE REMOVE BUTTON */}
                            <button 
                              onClick={() => handleRemoveAsset(b.asset.split(':')[0], b.asset.split(':')[1], b.balance)} 
                              className="text-slate-600 hover:text-red-500"
                              title="Remove Asset"
                            >
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        )}
                    </div>
                    
                    <h3 className="text-[10px] font-black text-slate-500 uppercase mb-1">{b.asset.split(':')[0]}</h3>
                    <div className="text-xl font-bold font-mono truncate tracking-tighter">
                      {parseFloat(b.balance).toLocaleString()}
                    </div>
                    
                    {/* Detailed Audit Stats */}
                    <div className="mt-3 text-[15px] text-slate-600 flex justify-between font-mono border-t border-slate-800/50 pt-2">
                      <span>Spendable:</span>
                      <span className="text-emerald-500 font-bold">{parseFloat(b.spendable || b.balance).toFixed(7)}</span>
                    </div>
                  </div>
              ))}
            </div>
          </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-8 border-b border-slate-800 pb-1">
               {[{id:'send', icon:Send, label:'Corporate Payments'}, {id:'swap', icon:ArrowRightLeft, label:'Swap'}, {id:'assets', icon:ShieldPlus, label:'Manage Assets'}].map(t => (
                 <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`flex items-center gap-2 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab===t.id?'border-blue-500 text-blue-400':'border-transparent text-slate-500 hover:text-slate-300'}`}>
                   <t.icon className="w-4 h-4"/> {t.label}
                 </button>
               ))}
            </div>

            <Card className="min-h-[450px] shadow-2xl">
               {/* ASSET DIRECTORY */}
               {activeTab === 'assets' && (
                 <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="space-y-4">
                       <Label>Explore Public Ledger Assets</Label>
                       <div className="relative"><Input placeholder="Search verified tokens (USDC, BTC)..." value={searchQuery} onChange={e=>handleSearch(e.target.value)} className="pl-12 left-10 bg-slate-900 border-slate-800 outline-none focus:border-blue-500"/>{isSearching && <Loader2 className="absolute right-4 top-3.5 w-5 h-5 animate-spin text-blue-500"/>}</div>
                       {searchResults.length > 0 && <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">{searchResults.map((a, i)=>(<div key={i} className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-blue-900/20 text-blue-400 rounded-xl flex items-center justify-center font-bold">{a.code[0]}</div><div><p className="font-bold text-sm text-white">{a.code}</p><p className="text-[10px] text-slate-500 italic">{a.domain}</p></div></div><Button onClick={()=>handleAddAsset(a.code, a.issuer)} variant="secondary" className="text-[10px] h-8 px-4">Add Trustline</Button></div>))}</div>}
                    </div>
                    <div className="pt-6 border-t border-slate-800/50">
                       <Label>Manual Account Bridge</Label>
                       <div className="flex gap-3 mt-2"><Input placeholder="Asset Code" value={manualAssetForm.code} onChange={e=>setManualAssetForm({...manualAssetForm, code:e.target.value.toUpperCase()})} className="h-11 text-xs w-24 bg-slate-900 border-slate-800"/><Input placeholder="Issuer Public Identity" value={manualAssetForm.issuer} onChange={e=>setManualAssetForm({...manualAssetForm, issuer:e.target.value})} className="h-11 text-xs flex-1 bg-slate-900 border-slate-800"/><Button onClick={()=>handleAddAsset(manualAssetForm.code, manualAssetForm.issuer)} disabled={!manualAssetForm.code || !manualAssetForm.issuer} className="h-11 px-5 shadow-lg"><Plus className="w-4 h-4"/></Button></div>
                    </div>
                 </div>
               )}

               {/* B2B PAYMENTS */}
               {/* B2B PAYMENTS TAB */}
              {activeTab === 'send' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* Mode Toggle */}
                  <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
                    <button 
                      onClick={() => setPaymentMode('DIRECT')} 
                      className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${paymentMode === 'DIRECT' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <Send className="w-3 h-3"/> Direct Payment
                    </button>
                    <button 
                      onClick={() => setPaymentMode('FX')} 
                      className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${paymentMode === 'FX' ? 'bg-purple-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <ArrowRightLeft className="w-3 h-3"/> Cross Assets Payments
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* SECTION: RECIPIENT */}
                    <div className="space-y-2">
                      <Label>Recipient Address</Label>
                      <div className="relative">
                        <Input 
                          value={sendForm.to} 
                          onChange={e => setSendForm({ ...sendForm, to: e.target.value })} 
                          placeholder="Enter the recipient's wallet address" 
                          className={`pl-10 ${paymentMode === 'FX' ? 'border-purple-500/30' : 'border-blue-500/30'}`}
                        />

                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-slate-950/50 rounded-3xl border border-slate-800">
                      {/* SOURCE ASSET */}
                      <div className="space-y-2">
                        <Label>Asset to Debit From</Label>
                        <select 
                          className="w-full h-12 bg-slate-900 border border-slate-800 rounded-xl px-4 text-xs text-white appearance-none cursor-pointer focus:border-blue-500" 
                          value={sendForm.sourceIndex} 
                          onChange={e => setSendForm({ ...sendForm, sourceIndex: parseInt(e.target.value) })}
                        >
                          {balances.map((b, i) => (
                            <option key={i} value={i}>{b.asset.split(':')[0]} (Avail: {parseFloat(b.spendable || b.balance).toFixed(7)})</option>
                          ))}
                        </select>
                      </div>

                      {/* AMOUNT FIELD - Label changes based on mode */}
                      <div className="space-y-2">
                        <Label>
                          {paymentMode === 'DIRECT' ? 'Amount to Send' : 'Amount Recipient Receives'}
                        </Label>
                        <div className="relative">
                          <Input 
                            type="number" 
                            value={sendForm.amount} 
                            onChange={e => setSendForm({ ...sendForm, amount: e.target.value })} 
                            placeholder="0.00" 
                            className="text-lg font-bold"
                          />
                          {/* <div className="absolute right-4 top-3 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                            {paymentMode === 'DIRECT' ? balances[sendForm.sourceIndex]?.asset.split(':')[0] : sendForm.destCode}
                          </div> */}
                        </div>
                      </div>
                    </div>

                    {/* FX EXCLUSIVE SECTION */}
                    {paymentMode === 'FX' && (
                      <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                        <div className="p-6 bg-purple-900/10 border border-purple-500/20 rounded-3xl space-y-4 shadow-inner">
                          <div className="flex items-center gap-2 text-purple-400 font-black text-[10px] uppercase tracking-widest">
                            <TrendingUp className="w-3 h-3"/> DEX Conversion Route
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label>Target Asset</Label>
                              <Input 
                                value={sendForm.destCode} 
                                onChange={e => setSendForm({ ...sendForm, destCode: e.target.value.toUpperCase() })} 
                                placeholder="USDC" 
                                className="bg-slate-950 border-purple-900/50"
                              />
                            </div>
                            <div className="col-span-2 space-y-1">
                              <Label>Target Issuer ID</Label>
                              <Input 
                                value={sendForm.destIssuer} 
                                onChange={e => setSendForm({ ...sendForm, destIssuer: e.target.value })} 
                                placeholder="Issuer G..." 
                                className="bg-slate-950 border-purple-900/50 text-[10px]"
                              />
                            </div>
                          </div>

                          {estimatedCost && (
                            <div className="bg-purple-600/20 border border-purple-500/30 p-4 rounded-2xl flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
                                <span className="text-[10px] font-black text-purple-200 uppercase tracking-tighter">Live Treasury Impact:</span>
                              </div>
                              <span className="text-sm font-mono font-black text-white">
                                -{parseFloat(estimatedCost).toFixed(4)} {balances[sendForm.sourceIndex]?.asset.split(':')[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 text-center italic">The Stellar network will find the cheapest path between your assets automatically.</p>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handleTransfer} 
                    disabled={loading || !sendForm.amount || !sendForm.to} 
                    className={`w-full h-16 text-sm font-black uppercase tracking-[0.2em] shadow-2xl transition-all ${paymentMode === 'FX' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'}`}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      <>{paymentMode === 'DIRECT' ? 'Transfer' : 'Authorize Cross-Border Clearing'}</>
                    )}
                  </Button>
                </div>
              )}
          

               {/* TREASURY REBALANCE */}
               {activeTab === 'swap' && (
                 <div className="space-y-6 py-4 max-w-lg mx-auto animate-in zoom-in-95">
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                      <Label>Withdraw (Give)</Label>
                      <div className="flex gap-4">
                        <select className="w-1/2 h-12 bg-slate-900 border border-slate-800 rounded-xl px-4 text-xs text-white" value={swapForm.sendAssetIndex} onChange={e=>setSwapForm({...swapForm, sendAssetIndex: parseInt(e.target.value)})}>
                           {balances.map((b, i)=>(<option key={i} value={i}>{b.asset.split(':')[0]}</option>))}
                        </select>
                        <Input type="number" value={swapForm.amount} onChange={e=>setSwapForm({...swapForm, amount:e.target.value})} placeholder="0.00" className="w-1/2 font-mono text-xl"/>
                      </div>
                    </div>
                    <div className="flex justify-center -my-4 relative z-10"><div className="bg-slate-800 p-3 rounded-full border-4 border-slate-950 text-blue-400"><ArrowDown className="w-5 h-5"/></div></div>
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                      <Label>Deposit (Receive)</Label>
                      <select className="w-full h-12 bg-slate-900 border border-slate-800 rounded-xl px-4 text-xs text-white" value={swapForm.destAssetIndex} onChange={e=>setSwapForm({...swapForm, destAssetIndex: parseInt(e.target.value)})}>
                        {balances.map((b, i)=>(<option key={i} value={i}>{b.asset.split(':')[0]}</option>))}
                      </select>
                    </div>
                    <Button onClick={handleSwap} disabled={loading} className="w-full h-14 text-sm font-black uppercase tracking-[0.2em] shadow-2xl">execute Swap</Button>
                 </div>
               )}
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
             {/* MONITOR */}
             <section className="bg-black/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
                <div className="bg-slate-800/50 px-5 py-3 border-b border-slate-800"><div className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500 animate-pulse"/><span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Network Monitor</span></div></div>
                <div className="p-5 space-y-2.5 h-44 overflow-hidden flex flex-col-reverse custom-scrollbar shadow-inner">
                  {logs.map((log, i)=>(<p key={i} className="text-[10px] font-mono text-emerald-500 opacity-80 leading-relaxed pl-3 border-l border-emerald-900/40">{log}</p>))}
                </div>
             </section>

             {/* AUDIT TRAIL */}
           <section className="space-y-5">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-500"/> Recent Transactions
              </h3>
              <Button variant="ghost" onClick={() => refreshData(wallet.publicKey)} className="h-8 !px-2 hover:bg-slate-800">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
              </Button>
            </div>

            <div className="space-y-4 h-[350px] overflow-y-auto pr-1 custom-scrollbar">
              {txs.map((tx, i) => (
                <div 
                  key={i} 
                  className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-[11px] hover:border-slate-700 hover:bg-slate-900/80 transition-all cursor-pointer group shadow-sm" 
                  onClick={() => handleViewAudit(tx.hash)}
                >
                  <div className="flex justify-between items-start mb-2">
                    {/* TECHNICAL HASH ONLY */}
                    <span className="text-blue-400 font-mono font-bold group-hover:text-blue-300 transition-colors flex items-center gap-1">
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"/>
                      #{tx.hash.substring(0, 12)}...
                    </span>
                    <span className="text-slate-600 font-bold tabular-nums">
                      {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* MEMO - Displayed as a raw technical string, no labels like "Company" */}
                  {/* {tx.memo && (
                    <div className="p-3 bg-black/40 rounded-xl text-slate-500 italic border-l-2 border-slate-700 leading-snug font-mono text-[9px]">
                      {tx.memo}
                    </div>
                  )} */}
                </div>
              ))}

              {txs.length === 0 && (
                <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800 text-slate-700 text-[10px] font-bold uppercase">
                  No Ledger History
                </div>
              )}
            </div>
          </section>
   
          {/* TRANSACTION AUDIT SUMMARY POPUP */}
          {/* TRANSACTION AUDIT SUMMARY POPUP */}
        {selectedTx && (
          <div 
            className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300"
            onClick={() => setSelectedTx(null)}
          >
            <Card 
              className="max-w-md w-full border-blue-500/20 shadow-2xl relative flex flex-col max-h-[90vh]" 
              /* max-h-[90vh] ensures it never goes off-screen vertically */
              onClick={(e: any) => e.stopPropagation()}
            >
              {/* 1. FIXED HEADER */}
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Transaction Audit</h2>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Verified Ghazanfar Bank Node</p>
                </div>
                <button 
                  onClick={() => setSelectedTx(null)} 
                  className="text-slate-500 hover:text-white p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2. SCROLLABLE CONTENT AREA */}
              <div className="overflow-y-auto pr-2 custom-scrollbar space-y-6 flex-grow">
                {/* Settlement Type Badge */}
                <div className="flex justify-center">
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-[0.2em] border ${
                    selectedTx.type.includes('path') 
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' 
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  }`}>
                    {selectedTx.type.includes('path') ? 'FX CONVERSION / SWAP' : 'DIRECT DISBURSEMENT'}
                  </span>
                </div>

                {/* Amount Section */}
                <div className="text-center py-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1"> Amount</p>
                  <div className="text-2xl font-mono font-bold text-white">
                    {parseFloat(selectedTx.amount).toFixed(7)} <span className="text-blue-500 text-lg">{selectedTx.asset}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    {selectedTx.successful ? 
                      <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">SUCCESSFUL</span> :
                      <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-0.5 rounded-full border border-red-500/20 font-bold">REJECTED</span>
                    }
                  </div>
                </div>

                {/* Technical Breakdown */}
                <div className="space-y-3 font-mono text-[11px]">
                  <div className="flex justify-between py-2 border-b border-slate-800/50">
                    <span className="text-slate-500 uppercase">Settlement Date</span>
                    <span className="text-slate-300">{new Date(selectedTx.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800/50">
                    <span className="text-slate-500 uppercase">Network Fee</span>
                    <span className="text-amber-500 font-bold">
                      {(parseInt(selectedTx.fee) / 10000000).toFixed(7)} XLM
                    </span>
                  </div>
                  <div className="flex flex-col py-2 border-b border-slate-800/50 gap-1">
                    <span className="text-slate-500 uppercase">Sender Address</span>
                    <span className="text-slate-400 break-all leading-relaxed">{selectedTx.from}</span>
                  </div>
                  <div className="flex flex-col py-2 border-b border-slate-800/50 gap-1">
                    <span className="text-slate-500 uppercase">Receipent Address</span>
                    <span className="text-slate-400 break-all leading-relaxed">{selectedTx.to}</span>
                  </div>
                </div>

                <div className="bg-black/40 p-3 rounded-xl border border-slate-800">
                  <p className="text-[9px] text-slate-600 uppercase font-bold mb-2">Audit Hash (Ledger Proof)</p>
                  <p 
                    className="text-[10px] font-mono text-blue-500 break-all leading-tight cursor-pointer hover:text-blue-400 hover:underline transition-all"
                    /* Updated to use selectedTx.hash and properly formatted onClick */
                    onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${selectedTx.hash}`, '_blank')}
                  >
                    {selectedTx.hash}
                  </p>
                </div>
              </div>

              {/* 3. FIXED FOOTER ACTIONS */}
              <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-slate-800 flex-shrink-0">
                <Button onClick={() => window.print()} variant="primary" className="w-full h-12 gap-2">
                  <Download className="w-4 h-4" /> Download Statement
                </Button>
                {/* <Button onClick={() => setSelectedTx(null)} variant="secondary" className="w-full h-10 text-[10px] uppercase font-black tracking-widest border border-slate-800">
                  Dismiss Audit
                </Button> */}
              </div>
            </Card>
          </div>
        )}
          </div>
        </div>
      </main>
    </div>
  );
}