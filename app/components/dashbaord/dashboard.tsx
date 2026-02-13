"use client";

import { useState, useEffect } from "react";
import { 
  Copy, RefreshCw, Send, ArrowRightLeft, ShieldPlus, History, 
  Loader2, Trash2, ArrowDown, Plus, TrendingUp, 
  ExternalLink, Activity, X, ShieldCheck, Download, Building2, Briefcase, Search, User,
  AlertTriangle,Contact,
  CheckCircle2,
} from "lucide-react";
import { Asset } from "@stellar/stellar-sdk";
import { server } from "../../lib/stellar";
import { sendPayment, sendCrossAssetPayment, changeTrustline } from "../../lib/payments";
import { swapAssets } from "../../lib/swap"; 
import { searchAssets, AssetRecord } from "../../lib/assets";
import { getBalances, getTransactions } from "../../lib/balances";
import { Card, Button, Input, Label } from "../../ui-helpers";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {  deleteContact, getContacts, saveContact } from "@/app/lib/contacts";
interface DashboardProps {
  onAudit: (hash: string) => void;
  userName: string;
  role: 'BANK_ADMIN' | 'CUSTOMER' | null;
}

export default function WalletDashboard({ onAudit, userName, role }: DashboardProps) {
  /* --- STATE MANAGEMENT --- */
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("send");
  const [paymentMode, setPaymentMode] = useState<'DIRECT' | 'FX'>('DIRECT');
  const [balances, setBalances] = useState<any[]>([]);
  const [txs, setTxs] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>(["Ghazanfar Treasury Link: SECURE"]);
  const [wallet, setWallet] = useState<any>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  /* --- FORM STATES --- */
  const [sendForm, setSendForm] = useState({ to: "", amount: "", sourceIndex: 0, destCode: "USDC", destIssuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" });
  const [swapForm, setSwapForm] = useState({ sendAssetIndex: 0, destAssetIndex: 0, amount: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AssetRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [manualAsset, setManualAsset] = useState({ code: "", issuer: "" });
  const [fetchingTx, setFetchingTx] = useState(false);
  const [confirmData, setConfirmData] = useState<any>(null); // Pre-payment buffer
  const [receipt, setReceipt] = useState<any>(null);
  const [isAuthorizing, setIsAuthorizing] = useState<string | null>(null); // Tracks which asset code is loading
  const [assetConfirm, setAssetConfirm] = useState<any>(null); // For the pre-flight modal
  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 5)]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showContactAdd, setShowContactAdd] = useState(false);
  const [newContactForm, setNewContactForm] = useState({ name: "", address: "" });
  const [isRemoving, setIsRemoving] = useState<string | null>(null); // Tracks which asset is being deleted
  const [consoleTab, setConsoleTab] = useState<'DIRECTORY' | 'ADD'>('DIRECTORY');
  const [contactSearch, setContactSearch] = useState("");

  // Filtered contact list based on search query
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) || 
    c.address.toLowerCase().includes(contactSearch.toLowerCase())
);
    /* --- FIXED SYNC LOGIC --- */
    useEffect(() => {
      // 1. Check for Admin Wallet Object
      const savedWallet = localStorage.getItem("gb_wallet");
      // 2. Check for Beneficiary Individual Keys
      const pub = localStorage.getItem("gb_public_key");
      const sec = localStorage.getItem("gb_secret_key");

      if (savedWallet && savedWallet !== "wa") {
        const w = JSON.parse(savedWallet);
        setWallet(w);
        syncLedger(w.publicKey);
      } else if (pub && sec) {
        // Logic for Beneficiary Auto-Connect
        const w = { publicKey: pub, secretKey: sec };
        setWallet(w);
        syncLedger(pub);
      }
    }, []);

    // Ensure re-sync if wallet state changes
    useEffect(() => {
      if (wallet?.publicKey) {
        syncLedger(wallet.publicKey);
      }
    }, [wallet]);

    const syncLedger = async (pubKey: string) => {
      try {
        const [b, t] = await Promise.all([getBalances(pubKey), getTransactions(pubKey)]);
        setBalances(b);
        setTxs(t);
      } catch (e) { addLog("Sync interrupted."); }
    };

    useEffect(() => {
      setContacts(getContacts());
    }, []);

    const handleAddContact = () => {
      if (!newContactForm.name || newContactForm.address.length < 56) {
        alert("Invalid contact details.");
        return;
      }
      const updated = saveContact(newContactForm.name, newContactForm.address);
      setContacts(updated);
      setNewContactForm({ name: "", address: "" });
      setShowContactAdd(false);
      addLog(`Contact ${newContactForm.name} saved.`);
    };
    /* --- 2. UPDATE CORE ACTIONS --- */
  // Inside app/components/dashbaord/dashboard.tsx
    const prepareTransfer = () => {
      // Ensure the destination isn't empty or truncated
      if (!sendForm.to || sendForm.to.trim().length < 56) {
        alert("Please enter a complete destination address.");
        return;
      }
      
      if (!sendForm.amount || parseFloat(sendForm.amount) <= 0) {
        alert("Please enter a valid settlement amount.");
        return;
      }

      const source = balances[sendForm.sourceIndex];
      const sCode = source.asset.split(':')[0];
      
      setConfirmData({
        to: sendForm.to.trim(), // Use trim() to avoid whitespace errors
        debitAmount: sendForm.amount,
        debitAsset: sCode,
        networkFee: "0.0000100", 
        mode: paymentMode
      });
    };

  const handleTransfer = async () => {
    if (!wallet || !confirmData) return;
    setLoading(true);
    setConfirmData(null); // Close confirmation modal
    try {
      const source = balances[sendForm.sourceIndex];
      const sCode = source.asset.split(':')[0];
      const sIssuer = source.asset.split(':')[1];
      
      let res: any;
      if (paymentMode === 'DIRECT') {
        res = await sendPayment(wallet.secretKey, sendForm.to, sendForm.amount, sCode, sIssuer, "B2B Settlement");
      } else {
        res = await sendCrossAssetPayment(wallet.secretKey, sendForm.to, sCode, sIssuer, sendForm.destCode, sendForm.destIssuer, sendForm.amount, "FX Settlement");
      }

      // Success logic: Set the receipt
      setReceipt({
        hash: res.hash,
        fee: res.fee || "100",
        amount: sendForm.amount,
        asset: paymentMode === 'DIRECT' ? sCode : sendForm.destCode,
      });

      await syncLedger(wallet.publicKey);
    } catch (e) { 
      console.error("Ledger rejection:", e);
    }
    setLoading(false);
  };

  const handleSwap = async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      const s = balances[swapForm.sendAssetIndex];
      const t = balances[swapForm.destAssetIndex];
      const res: any = await swapAssets(wallet.secretKey, s.asset.split(':')[0], s.asset.split(':')[1], t.asset.split(':')[0], t.asset.split(':')[1], swapForm.amount);
      
      // Set receipt for swaps
      setReceipt({
        hash: res.hash,
        fee: "100",
        amount: swapForm.amount,
        asset: t.asset.split(':')[0],
        type: 'TREASURY_REBALANCE'
      });

      addLog("Swap path optimized and executed.");
      await syncLedger(wallet.publicKey);
    } catch (e) { 
      addLog("Swap path not found."); 
    }
    setLoading(false);
  };

  const handleSearchAssets = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) return;
    setIsSearching(true);
    try {
      const results = await searchAssets(q);
      setSearchResults(results);
    } catch (e) { addLog("Search failed."); }
    setIsSearching(false);
  };

  // const handleAddAsset = async (code: string, issuer: string) => {
  //   if (!wallet) return;
  //   setLoading(true);
  //   try {
  //     await changeTrustline(wallet.secretKey, code, issuer);
  //     addLog(`Authorized asset: ${code}`);
  //     setSearchResults([]);
  //     setSearchQuery("");
  //     await syncLedger(wallet.publicKey);
  //   } catch (e) { addLog("Authorization failed."); }
  //   setLoading(false);
  // };
  const prepareAssetAddition = (code: string, issuer: string) => {
  setAssetConfirm({ code, issuer });
};

const handleExecuteAddAsset = async () => {
  if (!wallet || !assetConfirm) return;
  
  const { code, issuer } = assetConfirm;
  setIsAuthorizing(code); // Start button loading state
  setAssetConfirm(null); // Close confirmation modal
  
  try {
    await changeTrustline(wallet.secretKey, code, issuer);
    
    // Trigger the success receipt popup
    setReceipt({
      hash: "Trustline Secured", // You can capture the actual hash from the result if needed
      fee: "100",
      amount: "Authorized",
      asset: code,
      type: "TRUSTLINE_ESTABLISHED"
    });

    addLog(`Asset ${code} Authorized.`);
    await syncLedger(wallet.publicKey);
  } catch (e) {
    addLog("Authorization Failed.");
  } finally {
    setIsAuthorizing(null); // Stop button loading state
  }
};

  const handleRemoveAsset = async (code: string, issuer: string, balance: string) => {
  // 1. Stellar Ledger Rule: Cannot remove a trustline if you still hold funds
  if (parseFloat(balance) > 0) {
    addLog(`Error: Clear ${code} balance first.`);
    // Using standard alert for immediate ledger-rule feedback
    alert(`Institutional Protection: You cannot remove ${code} until the balance is 0.00.`);
    return;
  }

  setIsRemoving(code); // Start specific loading state
  addLog(`Ledger: Removing authorization for ${code}...`);
  
  try {
    // 2. Setting trust limit to "0" dissolves the trustline on Stellar
    await changeTrustline(wallet.secretKey, code, issuer, "0");
    
    // 3. Trigger the full-screen success receipt
    setReceipt({
      hash: "Ledger State Dissolved",
      fee: "100",
      amount: "Removed",
      asset: code,
      type: "TRUSTLINE_REMOVED"
    });

    addLog(`Success: ${code} removed from vault.`);
    await syncLedger(wallet.publicKey);
  } catch (e) {
    addLog("Rejection: Trustline removal failed.");
  } finally {
    setIsRemoving(null); // Stop loading state
  }
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

  return (
    <div className="space-y-5 animate-in fade-in duration-700 max-w-[1600px] mx-auto p-2">
     
      {/* PRE-PAYMENT REVIEW MODAL */}
      {confirmData && (
        <div className="fixed inset-0 h-screen w-screen z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-3xl" onClick={() => setConfirmData(null)} />
          <Card className="max-w-md w-full border-white/10 bg-slate-900 shadow-2xl relative z-[10000] rounded-[2rem] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg"><AlertTriangle className="text-blue-400 w-5 h-5"/></div>
              <h2 className="text-xl font-bold text-white tracking-tight">Review Settlement</h2>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="p-5 bg-black/40 rounded-2xl border border-white/5 space-y-3 font-mono text-xs shadow-inner">
                <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500">DEBIT AMOUNT</span><span className="text-white font-bold">{confirmData.debitAmount} {confirmData.debitAsset}</span></div>
                <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500">LEDGER FEE</span><span className="text-amber-500">{confirmData.networkFee} XLM</span></div>
                <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500 font-black">TOTAL IMPACT</span><span className="text-blue-400 font-black">{confirmData.debitAmount} {confirmData.debitAsset} + Fee</span></div>
                <div className="flex flex-col gap-1 pt-1"><span className="text-slate-500 text-[10px]">BENEFICIARY</span><span className="text-slate-400 break-all text-[10px] leading-tight">{confirmData.to}</span></div>
              </div>
              {/* <p className="text-[9px] text-slate-500 italic text-center px-4">Ledger transactions are final. Verified by Ghazanfar Institutional Node.</p> */}
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setConfirmData(null)} variant="secondary" className="flex-1 h-12 uppercase text-[10px] font-black">Cancel</Button>
              <Button onClick={handleTransfer} className="flex-1 h-12 bg-blue-600 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-900/20">Confirm Transfer</Button>
            </div>
          </Card>
        </div>
      )}

      {/* SUCCESS RECEIPT MODAL */}
      {receipt && (
        <div className="fixed inset-0 h-screen w-screen z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-3xl" onClick={() => setReceipt(null)} />
          <Card className="max-w-sm w-full text-center border-white/10 bg-slate-900 shadow-2xl relative z-[10000] rounded-[2.5rem] p-8 overflow-hidden">
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-emerald-500/10 blur-[80px] rounded-full" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-inner"><ShieldCheck className="text-emerald-500 w-7 h-7" /></div>
              <h2 className="text-lg font-black uppercase tracking-tighter text-white leading-none">Transaction Success</h2>
              <p className="text-slate-400 text-[9px] uppercase font-bold tracking-[0.2em] mt-2">Ledger State Finalized</p>
              
              <div className="my-6 p-4 bg-black/40 backdrop-blur-md rounded-2xl text-left space-y-3 font-mono text-[10px] border border-white/5">
                <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500 font-bold uppercase">Settlement</span><span className="text-white font-bold">{receipt.amount} {receipt.asset}</span></div>
                <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500 font-bold uppercase">Network Fee</span><span className="text-amber-500">{(parseInt(receipt.fee) / 10000000).toFixed(7)} XLM</span></div>
                <div className="pt-1 flex flex-col gap-1"><span className="text-slate-500 font-bold uppercase text-[8px]">Audit Hash</span><div className="text-blue-400 break-all leading-tight text-[9px] cursor-pointer hover:text-blue-300" onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${receipt.hash}`, '_blank')}>{receipt.hash}</div></div>
              </div>
              <Button onClick={() => setReceipt(null)} className="w-full h-12 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-all">Done</Button>
            </div>
          </Card>
        </div>
      )}
    {/* 1. ASSET GRID */}
<section className="space-y-4">
  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 ml-1">
    <Briefcase className="w-3 h-3 text-blue-500"/> Assets
  </h2>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 perspective-1000">
    {balances.map((b, i) => {
      const assetCode = b.asset.split(':')[0].toLowerCase();
      // Logic for fallback icons if API doesn't have the specific token
      const iconUrl = `https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${assetCode}.svg`;

      function setLiquidityModal(arg0: { show: boolean; code: any; issuer: any; }) {
        throw new Error("Function not implemented.");
      }

      // function setLiquidityModal(arg0: { show: boolean; code: any; issuer: any; }) {
      //   throw new Error("Function not implemented.");
      // }

      return (
        <div key={i} className="group h-[200px] w-full cursor-pointer">
          <div className="relative w-full h-full transition-all duration-700 preserve-3d group-hover:rotate-y-180">
            
            {/* FRONT SIDE: USER-FRIENDLY DASHBOARD CARD */}
            <div className="absolute inset-0 backface-hidden p-6 rounded-[2rem] border border-slate-800 bg-slate-900/80 shadow-2xl flex flex-col justify-between overflow-hidden">
              {/* Dynamic Crypto Icon from API */}
              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-center p-2.5 shadow-inner">
                  <img 
                    src={iconUrl} 
                    alt={assetCode.toUpperCase()} 
                    className="w-full h-full object-contain"
                    onError={(e: any) => { 
                      e.target.src = `https://ui-avatars.com/api/?name=${assetCode.toUpperCase()}&background=0D8ABC&color=fff&bold=true&size=128`; 
                    }} 
                  />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded-full group/badge">
                  {/* The leading checkmark icon */}
                  <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-2.5 h-2.5 text-slate-950" strokeWidth={4} />
                  </div>
                  
                  {/* Badge Text */}
                  <span className="text-[6px] font-black text-emerald-500 uppercase tracking-[0.1em]">
                    {b.asset === 'XLM' ? 'System' : 'Verified'}
                  </span>
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-tight">
                  {b.asset.split(':')[0]} Balance
                </p>
                <div className="text-2xl font-black tracking-tighter text-white flex items-baseline gap-2">
                  {parseFloat(b.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  <span className="text-xs text-slate-500 font-mono">{b.asset.split(':')[0]}</span>
                </div>
              </div>

              {/* Status Indicator matching reference design */}
              {/* <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${parseFloat(b.spendable) > 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                {parseFloat(b.spendable) > 0 ? 'On-Chain' : 'Liquidity Locked'}
              </div> */}

              {/* Animated Background Glow */}
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full group-hover:bg-blue-500/10 transition-all" />
            </div>

            {/* BACK SIDE: INSTITUTIONAL AUDIT VIEW */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 p-6 rounded-[2rem] border border-blue-500/20 bg-[#020617] shadow-[0_0_50px_rgba(30,58,138,0.3)] flex flex-col justify-between z-10 [transform:rotateY(180deg)_translateZ(1px)]">
              <div className="flex justify-between items-center relative z-20">
                <span className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3"/> Audit Proof
                </span>
                
                {b.asset !== 'XLM' && (
                <button 
                  type="button"
                  disabled={isRemoving === b.asset.split(':')[0]}
                  onClick={(e) => { 
                    e.preventDefault();
                    e.stopPropagation(); 
                    handleRemoveAsset(b.asset.split(':')[0], b.asset.split(':')[1], b.balance); 
                  }} 
                  className="text-slate-500 hover:text-red-500 transition-colors p-2 -m-2 relative z-[30] pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRemoving === b.asset.split(':')[0] ? (
                    /* SPINNING LOADER */
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  ) : (
                    /* TRASH ICON */
                    <Trash2 className="w-4 h-4 pointer-events-none"/>
                  )}
                </button>
              )}
              </div>

              <div className="space-y-3 font-mono text-[10px]">
                <div className="flex justify-between border-b border-slate-800/50 pb-2">
                  <span className="text-slate-500 uppercase font-bold">Spendable</span>
                  <span className="text-emerald-500 font-bold">{parseFloat(b.spendable).toFixed(4)}</span>
                </div>
                {b.asset === 'XLM' ? (
                  <>
                    <div className="flex justify-between border-b border-slate-800/50 pb-2">
                      <span className="text-slate-500 uppercase font-bold">Reserved</span>
                      <span className="text-amber-500 font-bold">{parseFloat(b.reserved).toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/50 pb-2">
                      <span className="text-slate-500 uppercase font-bold">Subentries</span>
                      <span className="text-blue-400 font-bold">{b.subentries}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-[8px] text-slate-600 leading-relaxed italic py-2">
                    Verified stellar asset
                  </div>
                )}
              </div>

              {/* <Button 
                variant="ghost" 
                onClick={(e:any) => { e.stopPropagation(); setLiquidityModal({show: true, code: b.asset.split(':')[0], issuer: b.asset.split(':')[1]}); }}
                className="w-full h-10 border-slate-800 text-[9px] uppercase font-black tracking-widest hover:bg-blue-600/10 hover:text-blue-400"
              >
                Deep Ledger Audit
              </Button> */}
            </div>

          </div>
        </div>
      );
    })}
  </div>
</section>
      


      {/* 2. ENGINES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-8 border-b border-slate-800 pb-1">
             {[
               {id:'send', icon:Send, label:'Payments'}, 
               {id:'swap', icon:ArrowRightLeft, label:'Swap'},
               {id:'manage', icon:ShieldPlus, label:'Manage Assets'}
             ].map(t => (
               <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`flex items-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.15em] border-b-2 transition-all ${activeTab===t.id?'border-blue-500 text-blue-400':'border-transparent text-slate-500 hover:text-slate-300'}`}><t.icon className="w-3.5 h-3.5"/> {t.label}</button>
             ))}
          </div>

          <Card className="min-h-[250px] shadow-2xl">
             {activeTab === 'send' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="space-y-6">
                  {/* QUICK SELECT CONTACTS */}
               
                  <div className="flex items-center justify-between gap-4 mb-4">
                    {/* 1. LEFT SIDE: ADD & FAVORITES (SCROLLABLE) */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar flex-1">
                      <button 
                        onClick={() => { setConsoleTab('ADD'); setShowContactAdd(true); }}
                        className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                      >
                        <Plus size={16} />
                      </button>
                      
                      {contacts.slice(0, 8).map(c => (
                        <button
                          key={c.id}
                          onClick={() => setSendForm({ ...sendForm, to: c.address })}
                          className={`flex-shrink-0 px-5 py-2.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${
                            sendForm.to === c.address 
                              ? 'border-blue-500 bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                              : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-600'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}

                      {/* Empty State */}
                      {contacts.length === 0 && (
                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic ml-1">
                          No Saved Partners
                        </span>
                      )}
                    </div>

                    {/* 2. RIGHT SIDE: FIXED SEARCH TRIGGER */}
                    <button 
                      onClick={() => { setConsoleTab('DIRECTORY'); setShowContactAdd(true); }}
                      className="flex-shrink-0 flex items-center gap-2 px-4 h-10 rounded-full bg-slate-900 border border-slate-800 text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-lg group"
                    >
                      <Contact size={14} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">contacts</span>
                    </button>
                  </div>

                  <div>
                    <Label className="flex justify-between">
                      Recipient Wallet Address
                  
                    </Label>
                    <Input 
                      value={sendForm.to} 
                      onChange={(e:any)=>setSendForm({...sendForm, to:e.target.value})} 
                      placeholder="Recipient G..." 
                    />
                  </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div><Label>Debit Source</Label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white text-xs font-bold appearance-none outline-none focus:border-blue-500" value={sendForm.sourceIndex} onChange={(e:any)=>setSendForm({...sendForm, sourceIndex: parseInt(e.target.value)})}>{balances.map((b,i)=>(<option key={i} value={i}>{b.asset.split(':')[0]} (Avail: {parseFloat(b.balance).toFixed(2)})</option>))}</select>
                      </div>
                      <div><Label>Sending Amount</Label><Input type="number" value={sendForm.amount} onChange={(e:any)=>setSendForm({...sendForm, amount: e.target.value})} placeholder="0.00" /></div>
                    </div>
                  </div>
                  <Button 
                  onClick={prepareTransfer} 
                  disabled={loading || !sendForm.amount} 
                  className="w-full h-14 bg-blue-600 font-black uppercase text-xs tracking-widest"
                >
                  {loading ? <Loader2 className="animate-spin w-4 h-4"/> : "Transfer Funds"}
                </Button>
               </div>
             )}

             {activeTab === 'manage' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* --- PRE-AUTHORIZATION MODAL --- */}
                {assetConfirm && (
                  <div className="fixed inset-0 h-screen w-screen z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-3xl" onClick={() => setAssetConfirm(null)} />
                    <Card className="max-w-md w-full border-white/10 bg-slate-900 shadow-2xl relative z-[10000] rounded-[2rem] p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-lg"><ShieldPlus className="text-blue-400 w-5 h-5"/></div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Authorize Asset</h2>
                      </div>
                      <div className="space-y-4 mb-8">
                        <div className="p-5 bg-black/40 rounded-2xl border border-white/5 space-y-3 font-mono text-xs shadow-inner">
                          <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-slate-500">ASSET CODE</span>
                            <span className="text-white font-black">{assetConfirm.code}</span>
                          </div>
                          <div className="flex flex-col gap-1 pt-1">
                            <span className="text-slate-500 uppercase text-[10px]">ISSUER NODE</span>
                            <span className="text-slate-400 break-all text-[10px] leading-tight">{assetConfirm.issuer}</span>
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-500 italic text-center px-4">Creating a trustline reserves 0.5 XLM on the ledger. This can be recovered by removing the asset later.</p>
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={() => setAssetConfirm(null)} variant="secondary" className="flex-1 h-12 uppercase text-[10px] font-black">Cancel</Button>
                        <Button onClick={handleExecuteAddAsset} className="flex-1 h-12 bg-blue-600 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-900/20">Confirm</Button>
                      </div>
                    </Card>
                  </div>
                )}

                {/* --- MAIN UI --- */}
                <div className="space-y-4">
                  <Label>Verified Asset Search</Label>
                  <div className="relative">
                    <Input 
                      placeholder="Search tokens (USDC, BTC, EUR)..." 
                      value={searchQuery} 
                      onChange={(e:any)=>handleSearchAssets(e.target.value)} 
                      className="pl-12 h-11 text-xs bg-slate-950/50"
                    />
                    
                    {isSearching && <Loader2 className="absolute right-4 top-3 w-5 h-5 animate-spin text-blue-500"/>}
                  </div>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                    {searchResults.map((a, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-900/20 text-blue-400 rounded-lg flex items-center justify-center font-bold border border-blue-500/10">
                            {a.code[0]}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm tracking-tight">{a.code}</p>
                            <p className="text-[9px] text-slate-500 font-mono truncate w-32 md:w-48 italic">
                              ID: {a.issuer.substring(0,12)}...
                            </p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => prepareAssetAddition(a.code, a.issuer)} 
                          disabled={isAuthorizing === a.code}
                          variant="secondary" 
                          className="h-9 px-6 text-[10px] uppercase font-black tracking-widest border border-slate-800"
                        >
                          {isAuthorizing === a.code ? <Loader2 size={14} className="animate-spin" /> : "Add Asset"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-6 border-t border-slate-800/50">
                  <Label>Manual Asset Registry</Label>
                  <div className="flex gap-3 mt-1">
                    <Input 
                      placeholder="Code" 
                      value={manualAsset.code} 
                      onChange={(e:any)=>setManualAsset({...manualAsset, code: e.target.value.toUpperCase()})} 
                      className="w-24 h-11 text-xs bg-slate-950/50"
                    />
                    <Input 
                      placeholder="Issuer Public Key" 
                      value={manualAsset.issuer} 
                      onChange={(e:any)=>setManualAsset({...manualAsset, issuer: e.target.value})} 
                      className="flex-1 h-11 text-xs bg-slate-950/50"
                    />
                    <Button 
                      onClick={() => prepareAssetAddition(manualAsset.code, manualAsset.issuer)} 
                      disabled={!manualAsset.code || !manualAsset.issuer || isAuthorizing === manualAsset.code} 
                      className="h-11 px-6 shadow-lg bg-blue-600"
                    >
                      {isAuthorizing === manualAsset.code ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18}/>}
                    </Button>
                  </div>
                </div>
              </div>
            )}

             {activeTab === 'swap' && (
               <div className="space-y-6 py-4 max-w-lg mx-auto animate-in zoom-in-95">
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                    <Label>Withdraw (Give)</Label>
                    <div className="flex gap-4">
                     <Select 
                      value={swapForm.sendAssetIndex.toString()} 
                      onValueChange={(val) => setSwapForm({...swapForm, sendAssetIndex: parseInt(val)})}
                    >
                      <SelectTrigger className="w-1/2 h-12 bg-slate-900 border-slate-800 rounded-xl px-4 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500/50 transition-all">
                        <SelectValue placeholder="Asset" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        {balances.map((b, i) => (
                          <SelectItem key={i} value={i.toString()} className="text-xs focus:bg-blue-600 focus:text-white cursor-pointer">
                            {b.asset.split(':')[0]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                      <Input className="flex-1" placeholder="Amount" value={swapForm.amount} onChange={(e:any)=>setSwapForm({...swapForm, amount:e.target.value})} />
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

        {/* 3. MONITORING & ACTIVITY */}
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
                {/* <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Verified Ghazanfar Bank Node</p> */}
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
      
      {showContactAdd && (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowContactAdd(false)} />
        
        <Card className="max-w-4xl w-full h-[500px] border-slate-800 bg-slate-950 p-0 overflow-hidden relative z-10 rounded-[2rem] flex flex-row shadow-2xl">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="w-64 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="text-white w-5 h-5" />
                </div>
                <h2 className="text-sm font-black text-white uppercase tracking-tighter">Contacts</h2>
              </div>

              <nav className="space-y-2">
                <button 
                  onClick={() => setConsoleTab('DIRECTORY')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${consoleTab === 'DIRECTORY' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}
                >
                  <Search size={14} /> Search Contacts
                </button>
                <button 
                  onClick={() => setConsoleTab('ADD')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${consoleTab === 'ADD' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}
                >
                  <Plus size={14} /> Register New
                </button>
              </nav>
            </div>

            <Button variant="ghost" onClick={() => setShowContactAdd(false)} className="text-[9px] uppercase font-bold text-slate-500 hover:text-white">
              Back to Dashboard
            </Button>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col p-8">
            {consoleTab === 'DIRECTORY' ? (
              <div className="h-full flex flex-col">
                <div className="relative mb-6">
                  
                  <Input 
                    placeholder="Filter by name or G... address" 
                    className="pl-12 h-12 bg-slate-900 border-slate-800"
                    value={contactSearch}
                    onChange={(e:any) => setContactSearch(e.target.value)}
                  />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                  {filteredContacts.length > 0 ? filteredContacts.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => { setSendForm({...sendForm, to: c.address}); setShowContactAdd(false); }}
                      className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center group cursor-pointer hover:border-blue-500/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500 font-black text-xs">
                          {c.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase leading-none">{c.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-1 italic">{c.address.substring(0, 20)}...</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setContacts(deleteContact(c.id)); }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600">
                      <Search size={40} className="mb-4 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No matching partners found</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto w-full pt-10 animate-in slide-in-from-right-4">
                <h3 className="text-lg font-bold text-white uppercase tracking-tighter mb-8">Register Settlement Partner</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Full Entity Name</Label>
                    <Input value={newContactForm.name} onChange={(e:any) => setNewContactForm({...newContactForm, name: e.target.value})} placeholder="e.g. Asia Pacific Treasury" />
                  </div>
                  <div className="space-y-2">
                    <Label>Verified Public Key (G...)</Label>
                    <Input value={newContactForm.address} onChange={(e:any) => setNewContactForm({...newContactForm, address: e.target.value})} placeholder="G..." />
                  </div>
                  <Button onClick={handleAddContact} className="w-full h-14 bg-blue-600 font-black uppercase tracking-widest">Add to Registry</Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    )}
    </div>
  );
}
