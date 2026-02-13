"use client";

import { useState, useEffect } from "react";
import { 
  Copy, RefreshCw, Send, ArrowRightLeft, ShieldPlus, History, 
  Loader2, Trash2, ArrowDown, Plus, TrendingUp, 
  ExternalLink, Activity, X, ShieldCheck, Download, Building2, Briefcase, Search, User,
  AlertTriangle
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
  const [isRemoving, setIsRemoving] = useState<string | null>(null); // Tracks which asset is being deleted

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
              <p className="text-[9px] text-slate-500 italic text-center px-4">Ledger transactions are final. Verified by Ghazanfar Institutional Node.</p>
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
          <Briefcase className="w-3 h-3 text-blue-500"/> Wallet Assets
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {balances.map((b, i) => (
            <div key={i} className="p-5 rounded-2xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition-all group shadow-lg">
              <div className="flex justify-between items-start mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold bg-blue-900/30 text-blue-400`}>
                  {b.asset[0]}
                </div>
                
                {b.asset !== 'XLM' && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={()=>setLiquidityModal({show: true, code: b.asset.split(':')[0], issuer: b.asset.split(':')[1]})} className="text-emerald-500 hover:text-emerald-400">
                      <TrendingUp className="w-4 h-4"/>
                    </button>
                    <button 
                      onClick={() => handleRemoveAsset(b.asset.split(':')[0], b.asset.split(':')[1], b.balance)} 
                      disabled={isRemoving === b.asset.split(':')[0]}
                      className="text-slate-600 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Remove Asset"
                    >
                      {isRemoving === b.asset.split(':')[0] ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4"/>
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              <h3 className="text-[10px] font-black text-slate-500 uppercase mb-1">{b.asset.split(':')[0]}</h3>
              <div className="text-xl font-bold font-mono truncate tracking-tighter">
                {/* FIXED: Added fraction digits to preserve decimals */}
                {parseFloat(b.balance).toLocaleString(undefined, { minimumFractionDigits: 2,  maximumFractionDigits: 5, })}
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-800/50 space-y-1 font-mono text-[10px] text-left">

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold uppercase">Spendable:</span>
                  <span className="text-emerald-500 font-bold">
                    {parseFloat(b.spendable).toFixed(5)} {b.code}
                  </span>
                </div>

                {/* Show Reserved + Subentries ONLY for XLM */}
                {b.asset === 'XLM' && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold uppercase">Reserved:</span>
                      <span className="text-amber-500 font-bold">
                        {parseFloat(b.reserved).toFixed(5)} XLM
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold uppercase">Subentries:</span>
                      <span className="text-blue-400 font-bold">
                        {b.subentries}
                      </span>
                    </div>
                  </>
                )}

              </div>
            </div>
          ))}
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

          <Card className="min-h-[450px] shadow-2xl">
             {activeTab === 'send' && (
               <div className="space-y-8 animate-in fade-in duration-300">
                  {/* <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner"> */}
                    {/* <button onClick={() => setPaymentMode('DIRECT')} className={`flex-1 py-3 text-[9px] font-black uppercase rounded-xl transition-all ${paymentMode === 'DIRECT' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}>Direct Payment</button> */}
                    {/* <button onClick={() => setPaymentMode('FX')} className={`flex-1 py-3 text-[9px] font-black uppercase rounded-xl transition-all ${paymentMode === 'FX' ? 'bg-purple-600 text-white shadow-xl' : 'text-slate-500'}`}>FX Cross-Asset</button> */}
                  {/* </div> */}
                  <div className="space-y-6">
                    <div><Label>Recipient Wallet Address</Label><Input value={sendForm.to} onChange={(e:any)=>setSendForm({...sendForm, to:e.target.value})} placeholder="Recipient G..." /></div>
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
    </div>
  );
}
