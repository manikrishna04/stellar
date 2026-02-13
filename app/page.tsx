
// // "use client";

// // import { useState } from "react";
// // import { 
// //   Copy, RefreshCw, Wallet, Send, ArrowRightLeft, 
// //   ShieldPlus, History, Key, LogOut, CheckCircle, AlertCircle,
// //   Search, Loader2, Trash2, Settings, ArrowDown, Plus, PenTool, TrendingUp
// // } from "lucide-react";
// // import { createWallet, restoreWallet } from "./lib/phraseWallet";
// // import { getBalances, getTransactions } from "./lib/balances";
// // import { sendPayment, changeTrustline } from "./lib/payments";
// // import { swapAssets } from "./lib/swap"; 
// // import { searchAssets, AssetRecord } from "./lib/assets";

// // // --- UI Helpers ---
// // const Card = ({ children, className = "" }: any) => (
// //   <div className={`bg-slate-900 border border-slate-800 rounded-xl p-6 ${className}`}>{children}</div>
// // );

// // const Button = ({ onClick, disabled, variant = "primary", children, className = "" }: any) => {
// //   const base = "px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2";
// //   const styles = {
// //     primary: "bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-700",
// //     secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-50",
// //     danger: "bg-red-900/20 hover:bg-red-900/40 text-red-400 disabled:opacity-50",
// //     ghost: "text-slate-400 hover:text-white hover:bg-slate-800/50"
// //   };
// //   return <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant as keyof typeof styles]} ${className}`}>{children}</button>;
// // };

// // const Input = (props: any) => (
// //   <input {...props} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600" />
// // );

// // const Label = ({ children }: { children: React.ReactNode }) => (
// //   <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">{children}</label>
// // );

// // export default function WalletDashboard() {
// //   // --- STATE ---
// //   const [wallet, setWallet] = useState<any>(null);
// //   const [activeTab, setActiveTab] = useState("assets");
// //   const [loading, setLoading] = useState(false);
// //   const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });

// //   // Data
// //   const [balances, setBalances] = useState<any[]>([]);
// //   const [txs, setTxs] = useState<any[]>([]);

// //   // Asset Search
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [searchResults, setSearchResults] = useState<AssetRecord[]>([]);
// //   const [isSearching, setIsSearching] = useState(false);
// //   const [manualAssetForm, setManualAssetForm] = useState({ code: "", issuer: "" });

// //   // Forms
// //   const [phraseInput, setPhraseInput] = useState("");
// //   const [sendForm, setSendForm] = useState({ to: "", amount: "", selectedAssetIndex: 0 });
// //   const [swapForm, setSwapForm] = useState({ sendAsset: "XLM", sendIssuer: "", destAsset: "", destIssuer: "", amount: "" });

// //   // --- ACTIONS ---

// //   const handleCreate = async () => {
// //     setLoading(true);
// //     try {
// //       const w = await createWallet();
// //       setWallet(w);
// //       await refreshData(w.publicKey);
// //       setStatus({ type: 'success', msg: 'Wallet created!' });
// //     } catch (e: any) { setStatus({ type: 'error', msg: e.message }); }
// //     setLoading(false);
// //   };

// //   const handleRestore = async () => {
// //     setLoading(true);
// //     try {
// //       const w = restoreWallet(phraseInput);
// //       setWallet(w);
// //       await refreshData(w.publicKey);
// //       setPhraseInput("");
// //       setStatus({ type: 'success', msg: 'Wallet restored.' });
// //     } catch (e: any) { setStatus({ type: 'error', msg: 'Invalid phrase.' }); }
// //     setLoading(false);
// //   };

// //   const refreshData = async (pubKey: string) => {
// //     try {
// //       const [b, t] = await Promise.all([getBalances(pubKey), getTransactions(pubKey)]);
// //       setBalances(b);
// //       setTxs(t);
// //     } catch (e) { console.error(e); }
// //   };

// //   const copyToClipboard = (text: string) => {
// //     navigator.clipboard.writeText(text);
// //     setStatus({ type: 'success', msg: 'Copied!' });
// //     setTimeout(() => setStatus({ type: null, msg: '' }), 2000);
// //   };

// //   const handleLogout = () => {
// //     setWallet(null);
// //     setBalances([]);
// //     setTxs([]);
// //     setStatus({ type: null, msg: '' });
// //   };

// //   // --- ASSET ACTIONS ---

// //   const handleSearch = async (query: string) => {
// //     setSearchQuery(query);
// //     if (query.length < 2) { setSearchResults([]); return; }
// //     setIsSearching(true);
// //     const results = await searchAssets(query);
// //     setSearchResults(results);
// //     setIsSearching(false);
// //   };

// //   const handleAddAsset = async (code: string, issuer: string) => {
// //     setLoading(true);
// //     try {
// //       await changeTrustline(wallet.secretKey, code, issuer);
// //       await refreshData(wallet.publicKey);
// //       setStatus({ type: 'success', msg: `Added ${code}` });
// //       setSearchQuery(""); setSearchResults([]);
// //       setManualAssetForm({ code: "", issuer: "" });
// //     } catch (e: any) { setStatus({ type: 'error', msg: "Failed. Need 0.5 XLM reserve." }); }
// //     setLoading(false);
// //   };

// //   const handleRemoveAsset = async (code: string, issuer: string, balance: string) => {
// //     if (parseFloat(balance) > 0) {
// //       setStatus({ type: 'error', msg: "Balance must be 0 to remove." });
// //       return;
// //     }
// //     setLoading(true);
// //     try {
// //       await changeTrustline(wallet.secretKey, code, issuer, "0");
// //       await refreshData(wallet.publicKey);
// //       setStatus({ type: 'success', msg: `Removed ${code}` });
// //     } catch (e: any) { setStatus({ type: 'error', msg: "Failed to remove." }); }
// //     setLoading(false);
// //   };

// //   // --- TX ACTIONS ---

// //   const handleSend = async () => {
// //     setLoading(true);
// //     try {
// //       const selectedBalance = balances[sendForm.selectedAssetIndex];
// //       const code = selectedBalance.asset.split(':')[0] === 'native' ? 'XLM' : selectedBalance.asset.split(':')[0];
// //       const issuer = selectedBalance.asset.split(':')[1]; 
// //       await sendPayment(wallet.secretKey, sendForm.to, sendForm.amount, code, issuer);
// //       await refreshData(wallet.publicKey);
// //       setStatus({ type: 'success', msg: `Sent ${sendForm.amount} ${code}!` });
// //       setSendForm({ ...sendForm, amount: "" });
// //     } catch (e: any) { setStatus({ type: 'error', msg: e.message || "Payment failed" }); }
// //     setLoading(false);
// //   };

// //   const handleSwap = async () => {
// //     setLoading(true);
// //     try {
// //       await swapAssets(wallet.secretKey, swapForm.sendAsset, swapForm.sendIssuer, swapForm.destAsset, swapForm.destIssuer, swapForm.amount);
// //       await refreshData(wallet.publicKey);
// //       setStatus({ type: 'success', msg: `Swapped ${swapForm.amount} ${swapForm.sendAsset}` });
// //     } catch (e: any) { setStatus({ type: 'error', msg: "Swap failed." }); }
// //     setLoading(false);
// //   };

// //   // --- RENDER LOGIN ---
// //   if (!wallet) {
// //     return (
// //       <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4">
// //         <div className="max-w-md w-full space-y-8">
// //           <div className="text-center">
// //             <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20"><Wallet className="w-8 h-8 text-white" /></div>
// //             <h1 className="text-3xl font-bold text-white mb-2">Stellar Ops</h1>
// //             <p className="text-slate-500">Dev Wallet & Testing Dashboard</p>
// //           </div>
// //           <Card className="space-y-6 bg-slate-900/50 backdrop-blur">
// //             <div className="space-y-4">
// //               <Button onClick={handleCreate} disabled={loading} className="w-full py-3">{loading ? "Generating..." : "Create New Wallet"}</Button>
// //               <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-800" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500">Or restore</span></div></div>
// //               <textarea value={phraseInput} onChange={(e) => setPhraseInput(e.target.value)} placeholder="Enter seed phrase..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm h-20 resize-none" />
// //               <Button onClick={handleRestore} disabled={!phraseInput || loading} variant="secondary" className="w-full">Restore Wallet</Button>
// //             </div>
// //           </Card>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // --- RENDER DASHBOARD ---
// //   return (
// //     <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      
// //       <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
// //         <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
// //           <div className="flex items-center gap-2"><div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><span className="font-bold text-white">S</span></div><span className="font-bold text-white hidden sm:block">Stellar Ops</span></div>
// //           <div className="flex items-center gap-3">
// //              <div className="hidden md:flex flex-col items-end mr-2"><span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Public Key</span><span className="text-xs font-mono text-slate-300">{wallet.publicKey.substring(0,6)}...{wallet.publicKey.substring(50)}</span></div>
// //              <Button variant="secondary" onClick={() => copyToClipboard(wallet.publicKey)} className="!px-3 h-9"><Copy className="w-4 h-4"/></Button>
// //              <Button variant="danger" onClick={handleLogout} className="!px-3 h-9"><LogOut className="w-4 h-4"/></Button>
// //           </div>
// //         </div>
// //       </header>

// //       <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
// //         {status.msg && <div className={`p-4 rounded-lg flex items-center gap-3 ${status.type==='error'?'bg-red-900/20 text-red-200 border border-red-900/50':'bg-emerald-900/20 text-emerald-200 border border-emerald-900/50'}`}>{status.type==='error'?<AlertCircle className="w-5 h-5"/>:<CheckCircle className="w-5 h-5"/>}{status.msg}</div>}

// //         {/* --- SECTION 1: ASSET CARDS (THE POPUP AREA) --- */}
// //         <section>
// //           <div className="flex items-center justify-between mb-4">
// //             <h2 className="text-lg font-bold text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-500"/> Your Assets</h2>
// //             <Button variant="ghost" onClick={() => refreshData(wallet.publicKey)} className="text-xs h-8 !px-3"><RefreshCw className={`w-3 h-3 ${loading?'animate-spin':''}`} /> Refresh</Button>
// //           </div>
          
// //           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
// //             {/* XLM Card (Always First) */}
// //             {balances.filter(b => b.asset.split(':')[0] === 'native').map((b, i) => (
// //                <div key={`native-${i}`} className="bg-gradient-to-br from-blue-900/50 to-slate-900 border border-blue-500/30 p-4 rounded-xl shadow-lg relative overflow-hidden group">
// //                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Wallet className="w-16 h-16"/></div>
// //                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Stellar Native</p>
// //                  <h3 className="text-2xl font-bold text-white">XLM</h3>
// //                  <p className="text-sm text-slate-300 font-mono mt-2">{parseFloat(b.balance).toFixed(2)}</p>
// //                </div>
// //             ))}

// //             {/* Other Assets Cards */}
// //             {/* Other Assets Cards */}
// //             {balances.filter(b => b.asset.split(':')[0] !== 'native').map((b, i) => (
// //               <div key={`asset-${i}`} className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow relative group hover:border-slate-700 transition-colors">
// //                 <div className="flex justify-between items-start">
// //                   <div className="w-8 h-8 bg-purple-900/20 text-purple-400 rounded-full flex items-center justify-center font-bold text-xs">
// //                       {b.asset.split(':')[0][0]}
// //                   </div>
// //                   <button 
// //                     onClick={() => handleRemoveAsset(b.asset.split(':')[0], b.asset.split(':')[1], b.balance)}
// //                     className="text-slate-600 hover:text-red-500 transition-colors"
// //                     title="Remove Asset"
// //                   >
// //                     <Trash2 className="w-4 h-4" />
// //                   </button>
// //                 </div>
// //                 <div className="mt-3">
// //                   <h3 className="text-lg font-bold text-white truncate">{b.asset.split(':')[0]}</h3>
// //                   <p className="text-sm text-slate-400 font-mono">{parseFloat(b.balance).toFixed(2)}</p>
// //                 </div>
// //                 <div className="mt-2 pt-2 border-t border-slate-800/50">
// //                     {/* FIX: Use optional chaining (?.) to prevent crash if issuer is missing */}
// //                     <p className="text-[9px] text-slate-600 font-mono truncate">
// //                       Issuer: {b.asset.split(':')[1]?.substring(0, 4) ?? 'N/A'}...
// //                     </p>
// //                 </div>
// //               </div>
// //             ))}
// //             {/* Empty State / Add Placeholder */}
// //             {balances.length === 0 && (
// //               <div className="col-span-full py-8 text-center border border-slate-800 border-dashed rounded-xl text-slate-500">
// //                 No assets found. Use "Manage Assets" to add some.
// //               </div>
// //             )}
// //           </div>
// //         </section>

// //         {/* --- SECTION 2: TABS & CONTENT --- */}
// //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
// //           <div className="lg:col-span-2 space-y-6">
// //             <div className="flex gap-2 border-b border-slate-800 overflow-x-auto pb-1">
// //               {[{ id: 'assets', icon: ShieldPlus, label: 'Manage Assets' }, { id: 'send', icon: Send, label: 'Send' }, { id: 'swap', icon: ArrowRightLeft, label: 'Swap' }, { id: 'settings', icon: Settings, label: 'Session' }].map((tab) => (
// //                 <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-t-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-slate-900 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}>
// //                   <tab.icon className="w-4 h-4" /> {tab.label}
// //                 </button>
// //               ))}
// //             </div>

// //             <Card className="min-h-[400px]">
              
// //               {/* TAB 1: MANAGE ASSETS */}
// //               {activeTab === 'assets' && (
// //                 <div className="space-y-8">
// //                   <div className="space-y-4">
// //                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Search Public Assets</h3>
// //                      <div className="relative">
// //                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
// //                        <Input placeholder="Search (e.g. USDC)..." value={searchQuery} onChange={(e: any) => handleSearch(e.target.value)} className="pl-12" />
// //                        {isSearching && <Loader2 className="absolute right-4 top-3.5 w-5 h-5 text-blue-500 animate-spin" />}
// //                      </div>
// //                      {searchResults.length > 0 && (
// //                        <div className="grid gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
// //                          {searchResults.map((asset, i) => (
// //                            <div key={`${asset.code}-${i}`} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
// //                              <div className="flex items-center gap-3">
// //                                 <div className="w-8 h-8 bg-purple-900/20 text-purple-400 rounded-full flex items-center justify-center font-bold text-xs">{asset.code[0]}</div>
// //                                 <div><p className="font-bold text-sm text-white">{asset.code}</p><p className="text-[10px] text-slate-500">{asset.domain}</p></div>
// //                              </div>
// //                              <Button onClick={() => handleAddAsset(asset.code, asset.issuer)} disabled={loading} variant="secondary" className="text-xs h-7 px-3">Add</Button>
// //                            </div>
// //                          ))}
// //                        </div>
// //                      )}
// //                   </div>
// //                   <div className="w-full border-t border-slate-800" />
// //                   <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
// //                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><PenTool className="w-4 h-4" /> Add Custom Asset</h3>
// //                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //                        <Input placeholder="Code (e.g. BTC)" value={manualAssetForm.code} onChange={(e:any) => setManualAssetForm({...manualAssetForm, code: e.target.value.toUpperCase()})} />
// //                        <div className="md:col-span-2"><Input placeholder="Issuer Address (G...)" value={manualAssetForm.issuer} onChange={(e:any) => setManualAssetForm({...manualAssetForm, issuer: e.target.value})} /></div>
// //                     </div>
// //                     <Button onClick={() => handleAddAsset(manualAssetForm.code, manualAssetForm.issuer)} disabled={loading || !manualAssetForm.code || !manualAssetForm.issuer} className="w-full"><Plus className="w-4 h-4" /> Add Custom Asset</Button>
// //                   </div>
// //                 </div>
// //               )}

// //               {/* TAB 2: SEND (SMART) */}
// //               {activeTab === 'send' && (
// //                 <div className="space-y-6 py-4">
// //                   <div className="space-y-4">
// //                     <div><Label>Destination Address</Label><Input value={sendForm.to} onChange={(e: any) => setSendForm({ ...sendForm, to: e.target.value })} placeholder="G..." /></div>
// //                     <div className="grid grid-cols-2 gap-4">
// //                       <div><Label>Amount</Label><Input type="number" value={sendForm.amount} onChange={(e: any) => setSendForm({ ...sendForm, amount: e.target.value })} placeholder="0.00" /></div>
// //                       <div>
// //                         <Label>Select Asset</Label>
// //                         <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 cursor-pointer appearance-none" value={sendForm.selectedAssetIndex} onChange={(e: any) => setSendForm({ ...sendForm, selectedAssetIndex: parseInt(e.target.value) })}>
// //                           {balances.map((b, i) => (<option key={i} value={i}>{b.asset.split(':')[0] === 'native' ? 'XLM' : b.asset.split(':')[0]} ({parseFloat(b.balance).toFixed(2)})</option>))}
// //                         </select>
// //                       </div>
// //                     </div>
// //                   </div>
// //                   <Button onClick={handleSend} disabled={loading} className="w-full mt-4 py-3">Sign & Send Payment</Button>
// //                 </div>
// //               )}

// //               {/* TAB 3: SWAP */}
// //               {activeTab === 'swap' && (
// //                 <div className="space-y-6 py-4 max-w-lg mx-auto">
// //                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
// //                      <Label>You Sell</Label>
// //                      <div className="flex gap-4"><div className="w-1/3"><Input value={swapForm.sendAsset} onChange={(e:any)=>setSwapForm({...swapForm, sendAsset:e.target.value})} placeholder="XLM"/></div><div className="w-2/3"><Input type="number" value={swapForm.amount} onChange={(e:any)=>setSwapForm({...swapForm, amount:e.target.value})} placeholder="0.00"/></div></div>
// //                      {swapForm.sendAsset !== 'XLM' && <Input value={swapForm.sendIssuer} onChange={(e:any)=>setSwapForm({...swapForm, sendIssuer:e.target.value})} placeholder="Issuer (Optional if XLM)" className="text-xs h-9"/>}
// //                    </div>
// //                    <div className="flex justify-center -my-3 relative z-10"><div className="bg-slate-800 p-2 rounded-full border border-slate-700 text-slate-400"><ArrowDown className="w-5 h-5"/></div></div>
// //                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
// //                      <Label>You Buy</Label>
// //                      <div className="flex gap-4"><div className="w-full"><Input value={swapForm.destAsset} onChange={(e:any)=>setSwapForm({...swapForm, destAsset:e.target.value})} placeholder="USDC"/></div></div>
// //                      {swapForm.destAsset !== 'XLM' && <Input value={swapForm.destIssuer} onChange={(e:any)=>setSwapForm({...swapForm, destIssuer:e.target.value})} placeholder="Issuer Address" className="text-xs h-9"/>}
// //                    </div>
// //                    <Button onClick={handleSwap} disabled={loading} className="w-full py-3">Swap Assets</Button>
// //                 </div>
// //               )}

// //               {/* TAB 4: SESSION */}
// //               {activeTab === 'settings' && (
// //                 <div className="space-y-6 py-4">
// //                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between"><div><h4 className="font-bold text-white">Session</h4><p className="text-xs text-slate-500">Connected as {wallet.publicKey.substring(0,8)}...</p></div><Button variant="danger" onClick={handleLogout}>Log Out</Button></div>
// //                    {wallet.mnemonic && (<div className="bg-yellow-900/10 border border-yellow-900/30 p-4 rounded-xl space-y-2"><div className="flex items-center gap-2 text-yellow-500 font-bold text-sm"><Key className="w-4 h-4"/> Secret Phrase</div><code className="block bg-black/30 p-3 rounded text-yellow-100/80 text-[10px] font-mono break-all select-all">{wallet.mnemonic}</code></div>)}
// //                 </div>
// //               )}
// //             </Card>
// //           </div>

// //           {/* RIGHT: HISTORY */}
// //           <div className="lg:col-span-1">
// //              <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-white flex items-center gap-2"><History className="w-4 h-4 text-blue-500" /> Activity</h3><Button variant="ghost" onClick={() => refreshData(wallet.publicKey)} className="text-xs h-7 !px-2"><RefreshCw className="w-3 h-3" /></Button></div>
// //              <div className="space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
// //                {txs.length === 0 ? <div className="text-sm text-slate-600 text-center py-8 border border-slate-800 border-dashed rounded-lg">No recent transactions</div> : 
// //                  txs.map((tx, i) => (
// //                    <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs hover:border-slate-700 transition-colors group cursor-pointer" onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${tx.hash}`, '_blank')}>
// //                      <div className="flex justify-between items-start mb-1"><span className="text-blue-400 font-mono">{tx.hash.substring(0, 8)}...</span><span className="text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</span></div>
// //                      {tx.memo && <div className="text-slate-400 italic truncate bg-black/20 p-1 rounded mt-1">"{tx.memo}"</div>}
// //                    </div>
// //                  ))
// //                }
// //              </div>
// //           </div>
// //         </div>
// //       </main>
// //     </div>
// //   );
// // }
// // "use client";

// // import { useState, useEffect } from "react";
// // import { 
// //   Copy, RefreshCw, Wallet, Send, ArrowRightLeft, ShieldPlus, History, 
// //   Key, LogOut, CheckCircle, AlertCircle, Search, Loader2, Trash2, 
// //   Settings, ArrowDown, Plus, PenTool, TrendingUp, Landmark, ExternalLink, Info, Activity
// // } from "lucide-react";
// // import { createWallet, restoreWallet } from "./lib/phraseWallet";
// // import { getBalances, getTransactions } from "./lib/balances";
// // import { sendPayment, changeTrustline, sendCrossAssetPayment } from "./lib/payments";
// // import { swapAssets } from "./lib/swap"; 
// // import { searchAssets, AssetRecord } from "./lib/assets";
// // import { getDepositUrl } from "./lib/anchor";
// // import { createLiquidityPool } from "./lib/liquidity";

// // const Card = ({ children, className = "" }: any) => (<div className={`bg-slate-900 border border-slate-800 rounded-xl p-6 ${className}`}>{children}</div>);
// // const Button = ({ onClick, disabled, variant = "primary", children, className = "" }: any) => {
// //   const styles: any = {
// //     primary: "bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-800",
// //     secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200",
// //     danger: "bg-red-900/20 hover:bg-red-900/40 text-red-400",
// //     ramp: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
// //   };
// //   return <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${styles[variant]} ${className}`}>{children}</button>;
// // };
// // const Input = (props: any) => (<input {...props} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600" />);
// // const Label = ({ children }: { children: React.ReactNode }) => (<label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">{children}</label>);

// // export default function WalletDashboard() {
// //   const [wallet, setWallet] = useState<any>(null);
// //   const [activeTab, setActiveTab] = useState("assets");
// //   const [loading, setLoading] = useState(false);
// //   const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });
// //   const [balances, setBalances] = useState<any[]>([]);
// //   const [txs, setTxs] = useState<any[]>([]);
// //   const [receipt, setReceipt] = useState<any>(null);
// //   const [logs, setLogs] = useState<string[]>(["System initialized..."]);
  
// //   // Forms
// //   const [swapForm, setSwapForm] = useState({ sendAsset: "XLM", sendIssuer: "", destAsset: "", destIssuer: "", amount: "" });
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [searchResults, setSearchResults] = useState<AssetRecord[]>([]);
// //   const [isSearching, setIsSearching] = useState(false);
// //   const [manualAssetForm, setManualAssetForm] = useState({ code: "", issuer: "" });
// //   const [phraseInput, setPhraseInput] = useState("");

// //   const [paymentMode, setPaymentMode] = useState<'P2P' | 'CROSS'>('P2P');
// //   const [sendForm, setSendForm] = useState({ 
// //     to: "", amount: "", sourceIndex: 0, 
// //     destCode: "USDC", destIssuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" 
// //   });

// //   const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 8)]);

// //   // --- ERROR DECODER ---
// //   const decodeError = (e: any) => {
// //     const code = e?.response?.data?.extras?.result_codes?.operations?.[0] || e?.response?.data?.extras?.result_codes?.transaction;
// //     if (code === "op_no_path") return "Insufficient Liquidity: No path found in DEX.";
// //     if (code === "op_no_trust") return "Trust Error: Recipient doesn't trust this asset.";
// //     if (code === "op_underfunded") return "Balance Error: Insufficient funds for transaction + fees.";
// //     if (code === "tx_bad_auth") return "Auth Error: Invalid signature.";
// //     return `Stellar Error: ${code || "Unknown Rejection"}`;
// //   };

// //   // --- ACTIONS ---

// //   const handleSwap = async () => {
// //     setLoading(true);
// //     addLog(`Engine: Pathfinding ${swapForm.amount} ${swapForm.sendAsset} -> ${swapForm.destAsset}...`);
// //     try {
// //       const res: any = await swapAssets(wallet.secretKey, swapForm.sendAsset, swapForm.sendIssuer, swapForm.destAsset, swapForm.destIssuer, swapForm.amount);
// //       await refreshData(wallet.publicKey);
// //       setReceipt({...res, type: 'DEX_SWAP'});
// //       addLog(`Swap Success: ${res.hash.substring(0,8)}`);
// //     } catch (e: any) { 
// //       const msg = decodeError(e);
// //       addLog(msg);
// //       setStatus({ type: 'error', msg }); 
// //     }
// //     setLoading(false);
// //   };

// //   const handleCreateMarket = async (code: string, issuer: string) => {
// //     setLoading(true);
// //     addLog(`DEX: Initializing Liquidity Pool for ${code}/XLM...`);
// //     try {
// //       await createLiquidityPool(wallet.secretKey, code, issuer, "100", "100");
// //       await refreshData(wallet.publicKey);
// //       addLog(`Market Created! Path enabled for ${code}.`);
// //       setStatus({ type: 'success', msg: `Market initialized for ${code}` });
// //     } catch (e) {
// //       addLog("Market Error: Ensure you have 100 XLM and 100 of the asset.");
// //       setStatus({ type: 'error', msg: "Liquidity provision failed." });
// //     }
// //     setLoading(false);
// //   };

// //   const handleTransfer = async () => {
// //     setLoading(true); setStatus({ type: null, msg: '' });
// //     try {
// //       const source = balances[sendForm.sourceIndex];
// //       const sCode = source.asset.split(':')[0] === 'XLM' ? 'XLM' : source.asset.split(':')[0];
// //       const sIssuer = source.asset.split(':')[1];

// //       let res: any;
// //       if (paymentMode === 'P2P') {
// //         addLog(`P2P Engine: Moving ${sendForm.amount} ${sCode} to recipient...`);
// //         res = await sendPayment(wallet.secretKey, sendForm.to, sendForm.amount, sCode, sIssuer);
// //       } else {
// //         addLog(`FX Engine: Finding best route ${sCode} -> ${sendForm.destCode}...`);
// //         res = await sendCrossAssetPayment(wallet.secretKey, sendForm.to, sCode, sIssuer, sendForm.destCode, sendForm.destIssuer, sendForm.amount);
// //       }
// //       setReceipt({...res, type: paymentMode === 'P2P' ? 'P2P_TRANSFER' : 'CROSS_CURRENCY_FX'});
// //       addLog(`Payment Settled. Fee: ${res.fee} Stroops.`);
// //       await refreshData(wallet.publicKey);
// //     } catch (e: any) { 
// //         const msg = decodeError(e);
// //         addLog(msg);
// //         setStatus({ type: 'error', msg }); 
// //     }
// //     setLoading(false);
// //   };

// //   const refreshData = async (pubKey: string) => {
// //     addLog("Updating balances from Horizon...");
// //     const [b, t] = await Promise.all([getBalances(pubKey), getTransactions(pubKey)]);
// //     setBalances(b); setTxs(t);
// //   };

// //   const handleRestore = async () => {
// //     setLoading(true);
// //     try {
// //       const w = restoreWallet(phraseInput);
// //       setWallet(w); await refreshData(w.publicKey);
// //       addLog("Session Securely Restored.");
// //     } catch (e: any) { setStatus({ type: 'error', msg: "Restore Failed" }); }
// //     setLoading(false);
// //   };

// //   const handleAddAsset = async (code: string, issuer: string) => {
// //     setLoading(true); addLog(`Transaction: ChangeTrust ${code}...`);
// //     try {
// //       await changeTrustline(wallet.secretKey, code, issuer);
// //       await refreshData(wallet.publicKey);
// //       addLog(`Asset ${code} trusted.`);
// //       setStatus({ type: 'success', msg: `Added ${code}` });
// //     } catch (e) { setStatus({ type: 'error', msg: "Trustline Failed" }); }
// //     setLoading(false);
// //   };

// //   const handleSearch = async (q: string) => {
// //     setSearchQuery(q);
// //     if (q.length < 2) return;
// //     setIsSearching(true);
// //     const r = await searchAssets(q);
// //     setSearchResults(r);
// //     setIsSearching(false);
// //   };

// //   if (!wallet) return (
// //     <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
// //       <div className="max-w-md w-full space-y-8">
// //         <div className="text-center"><div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg"><Wallet className="text-white w-8 h-8"/></div><h1 className="text-3xl font-bold text-white mt-4">Stellar Ops</h1></div>
// //         <Card className="bg-slate-900/50 backdrop-blur"><textarea value={phraseInput} onChange={e=>setPhraseInput(e.target.value)} placeholder="Recovery Phrase..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm h-24 mb-4 text-white resize-none" /><Button onClick={handleRestore} className="w-full">Open Dashboard</Button></Card>
// //       </div>
// //     </div>
// //   );

// //   return (
// //     <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
// //       {/* FEE RECEIPT MODAL */}
// //       {receipt && (
// //         <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
// //           <div className="bg-slate-900 border border-blue-500/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
// //             <div className="text-center mb-6">
// //               <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="text-emerald-500 w-8 h-8"/></div>
// //               <h2 className="text-xl font-bold">Transaction Confirmed</h2>
// //               <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">{receipt.type}</p>
// //             </div>
// //             <div className="space-y-3 bg-black/40 p-4 rounded-2xl mb-6 font-mono text-[11px]">
// //                <div className="flex justify-between"><span className="text-slate-500">Processing Fee</span><span className="text-emerald-400">{receipt.fee} Stroops</span></div>
// //                <div className="flex justify-between"><span className="text-slate-500">Stellar Ledger</span><span className="text-white">{receipt.ledger}</span></div>
// //                <div className="pt-2 border-t border-slate-800"><p className="text-slate-500 mb-1 uppercase text-[9px] font-bold">Audit Hash</p><p className="text-blue-400 break-all">{receipt.hash}</p></div>
// //             </div>
// //             <Button onClick={()=>setReceipt(null)} className="w-full">Close Receipt</Button>
// //           </div>
// //         </div>
// //       )}

// //       <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
// //         <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
// //           <div className="flex items-center gap-2 font-bold"><div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">S</div>Stellar Ops</div>
// //           <div className="flex items-center gap-3">
// //              <div className="hidden md:block text-right"><p className="text-[10px] text-slate-500 font-bold uppercase">Public Key</p><p className="text-xs font-mono text-slate-300">{wallet.publicKey.substring(0,8)}...</p></div>
// //              <Button variant="danger" onClick={()=>setWallet(null)} className="h-9 !px-3"><LogOut className="w-4 h-4"/></Button>
// //           </div>
// //         </div>
// //       </header>

// //       <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
// //         {/* TOP ASSET CARDS */}
// //         <section className="space-y-4">
// //           <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500"/> Global Balances</h2>
// //           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
// //              {balances.map((b, i) => (
// //                 <div key={i} className={`p-5 rounded-2xl border transition-all ${b.asset==='XLM'?'bg-gradient-to-br from-blue-600/30 to-slate-900 border-blue-500/50 shadow-xl shadow-blue-900/10':'bg-slate-900 border-slate-800'}`}>
// //                    <div className="flex justify-between items-start mb-3">
// //                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${b.asset==='XLM'?'bg-blue-600 text-white':'bg-blue-900/30 text-blue-400'}`}>{b.asset === 'XLM' ? 'L' : b.asset.split(':')[0][0]}</div>
// //                       {b.asset !== 'XLM' && (
// //                         <div className="flex gap-2">
// //                            <button onClick={()=>handleCreateMarket(b.asset.split(':')[0], b.asset.split(':')[1])} className="text-emerald-500 hover:text-emerald-400" title="Initialize DEX Market"><TrendingUp className="w-4 h-4"/></button>
// //                            <button onClick={()=>handleRemoveAsset(b.asset.split(':')[0], b.asset.split(':')[1], b.balance)} className="text-slate-700 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
// //                         </div>
// //                       )}
// //                    </div>
// //                    <h3 className="text-xs font-bold text-slate-500 uppercase">{b.asset.split(':')[0]}</h3>
// //                    <div className="text-2xl font-bold font-mono truncate">{parseFloat(b.balance).toLocaleString()}</div>
// //                    <p className="text-[9px] text-slate-600 font-mono mt-2 truncate">{b.asset==='XLM'?'System Native':`Issuer: ${b.asset.split(':')[1]?.substring(0,8)}...`}</p>
// //                 </div>
// //              ))}
// //           </div>
// //         </section>

// //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
// //           <div className="lg:col-span-2 space-y-6">
// //             <div className="flex gap-4 border-b border-slate-800 pb-1 overflow-x-auto">
// //                {[
// //                  {id:'assets', icon:ShieldPlus, label:'Assets'},
// //                  {id:'send', icon:Send, label:'Payments'}, 
// //                  {id:'swap', icon:ArrowRightLeft, label:'Swap Engine'}
// //                ].map(t => (
// //                  <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`flex items-center gap-2 py-2 px-1 text-sm font-bold border-b-2 transition-all ${activeTab===t.id?'border-blue-500 text-blue-400':'border-transparent text-slate-500 hover:text-slate-300'}`}>
// //                    <t.icon className="w-4 h-4"/> {t.label}
// //                  </button>
// //                ))}
// //             </div>

// //             <Card className="min-h-[450px]">
// //                {activeTab === 'assets' && (
// //                  <div className="space-y-6">
// //                     <div className="relative"><Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-600"/><Input placeholder="Search global assets..." value={searchQuery} onChange={e=>handleSearch(e.target.value)} className="pl-12"/>{isSearching && <Loader2 className="absolute right-4 top-3.5 w-5 h-5 animate-spin text-blue-500"/>}</div>
// //                     {searchResults.length > 0 && <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">{searchResults.map((a, i)=>(<div key={i} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-blue-900/20 text-blue-400 rounded-lg flex items-center justify-center font-bold text-xs">{a.code[0]}</div><div><p className="font-bold text-xs text-white">{a.code}</p><p className="text-[9px] text-slate-500">{a.domain}</p></div></div><Button onClick={()=>handleAddAsset(a.code, a.issuer)} variant="secondary" className="text-xs h-7">Add Trustline</Button></div>))}</div>}
// //                     <div className="pt-4 border-t border-slate-800"><Label>Custom Token Bridge</Label><div className="flex gap-2 mt-1"><Input placeholder="Code" value={manualAssetForm.code} onChange={e=>setManualAssetForm({...manualAssetForm, code:e.target.value.toUpperCase()})} className="h-10 text-xs w-24"/><Input placeholder="Issuer G..." value={manualAssetForm.issuer} onChange={e=>setManualAssetForm({...manualAssetForm, issuer:e.target.value})} className="h-10 text-xs flex-1"/><Button onClick={()=>handleAddAsset(manualAssetForm.code, manualAssetForm.issuer)} className="h-10 text-xs px-4"><Plus className="w-4 h-4"/></Button></div></div>
// //                  </div>
// //                )}

// //                {activeTab === 'send' && (
// //                  <div className="space-y-6">
// //                     <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
// //                        <button onClick={()=>setPaymentMode('P2P')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${paymentMode==='P2P'?'bg-blue-600 text-white shadow-lg':'text-slate-500'}`}>P2P Transfer</button>
// //                        <button onClick={()=>setPaymentMode('CROSS')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${paymentMode==='CROSS'?'bg-purple-600 text-white shadow-lg':'text-slate-500'}`}>FX Cross-Currency</button>
// //                     </div>
// //                     <div className="space-y-4">
// //                        <div><Label>Recipient Address</Label><Input value={sendForm.to} onChange={e=>setSendForm({...sendForm, to: e.target.value})} placeholder="G..."/></div>
// //                        <div className="grid grid-cols-2 gap-4">
// //                           <div><Label>Pay With</Label><select className="w-full h-12 bg-slate-950 border border-slate-800 rounded-lg px-4 text-xs text-white" value={sendForm.sourceIndex} onChange={e=>setSendForm({...sendForm, sourceIndex: parseInt(e.target.value)})}>
// //                              {balances.map((b, i)=>(<option key={i} value={i}>{b.asset.split(':')[0]} ({parseFloat(b.balance).toFixed(2)})</option>))}
// //                           </select></div>
// //                           <div><Label>{paymentMode==='P2P'?'Amount':'Recipient Gets'}</Label><Input type="number" value={sendForm.amount} onChange={e=>setSendForm({...sendForm, amount:e.target.value})} placeholder="0.00"/></div>
// //                        </div>
// //                        {paymentMode === 'CROSS' && (
// //                          <div className="grid grid-cols-3 gap-3 p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl">
// //                             <div><Label>Target Code</Label><Input value={sendForm.destCode} onChange={e=>setSendForm({...sendForm, destCode: e.target.value.toUpperCase()})} placeholder="USD"/></div>
// //                             <div className="col-span-2"><Label>Target Issuer</Label><Input value={sendForm.destIssuer} onChange={e=>setSendForm({...sendForm, destIssuer: e.target.value})} placeholder="G..."/></div>
// //                          </div>
// //                        )}
// //                     </div>
// //                     <Button onClick={handleTransfer} disabled={loading} className={`w-full h-12 text-lg ${paymentMode==='CROSS'?'bg-purple-600 hover:bg-purple-500':''}`}>{loading ? <Loader2 className="animate-spin w-5 h-5"/> : `Execute ${paymentMode} Engine`}</Button>
// //                  </div>
// //                )}

// //               {activeTab === 'swap' && (
// //                 <div className="space-y-6 py-4 max-w-lg mx-auto">
// //                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
// //                      <Label>You Give</Label>
// //                      <div className="flex gap-4"><div className="w-1/3"><Input value={swapForm.sendAsset} onChange={e=>setSwapForm({...swapForm, sendAsset:e.target.value})} placeholder="XLM"/></div><div className="w-2/3"><Input type="number" value={swapForm.amount} onChange={e=>setSwapForm({...swapForm, amount:e.target.value})} placeholder="0.00"/></div></div>
// //                      {swapForm.sendAsset !== 'XLM' && <Input value={swapForm.sendIssuer} onChange={e=>setSwapForm({...swapForm, sendIssuer:e.target.value})} placeholder="Issuer G..." className="text-xs h-9"/>}
// //                    </div>
// //                    <div className="flex justify-center -my-3 relative z-10"><div className="bg-slate-800 p-2 rounded-full border border-slate-700 text-slate-400 shadow-lg"><ArrowDown className="w-5 h-5"/></div></div>
// //                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
// //                      <Label>You Receive</Label>
// //                      <div className="flex gap-4"><div className="w-full"><Input value={swapForm.destAsset} onChange={e=>setSwapForm({...swapForm, destAsset:e.target.value})} placeholder="USDC"/></div></div>
// //                      {swapForm.destAsset !== 'XLM' && <Input value={swapForm.destIssuer} onChange={e=>setSwapForm({...swapForm, destIssuer:e.target.value})} placeholder="Issuer G..." className="text-xs h-9"/>}
// //                    </div>
// //                    <Button onClick={handleSwap} disabled={loading} className="w-full py-3 h-12 text-lg shadow-lg">
// //                       {loading ? <Loader2 className="animate-spin w-5 h-5"/> : "Execute DEX Swap"}
// //                    </Button>
// //                 </div>
// //               )}
// //             </Card>
// //           </div>

// //           <div className="lg:col-span-1 space-y-6">
// //              <section className="bg-black/40 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
// //                 <div className="bg-slate-800/50 px-4 py-2 flex items-center justify-between border-b border-slate-800"><div className="flex items-center gap-2"><Activity className="w-3 h-3 text-emerald-500"/><span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Background Engine</span></div><div className="flex gap-1"><div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"/><div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse delay-75"/></div></div>
// //                 <div className="p-4 space-y-2 h-36 overflow-hidden flex flex-col-reverse">{logs.map((log, i)=>(<p key={i} className="text-[10px] font-mono text-emerald-500/80 leading-relaxed border-l border-emerald-900/50 pl-2">{log}</p>))}</div>
// //              </section>
// //              <section className="space-y-4">
// //                 <div className="flex justify-between items-center px-1"><h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2"><History className="w-4 h-4"/> Event Logs</h3><Button variant="ghost" onClick={()=>refreshData(wallet.publicKey)} className="h-7 !px-2"><RefreshCw className={`w-3 h-3 ${loading?'animate-spin':''}`}/></Button></div>
// //                 <div className="space-y-3 h-[380px] overflow-y-auto pr-1 custom-scrollbar">
// //                    {txs.map((tx, i)=>(<div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-[11px] hover:border-slate-700 transition-all cursor-pointer group" onClick={()=>window.open(`https://stellar.expert/explorer/testnet/tx/${tx.hash}`)}><div className="flex justify-between items-start mb-2"><span className="text-blue-400 font-mono group-hover:underline">#{tx.hash.substring(0,8)}</span><span className="text-slate-600 font-bold">{new Date(tx.created_at).toLocaleTimeString()}</span></div>{tx.memo && <div className="p-2 bg-slate-950 rounded text-slate-500 italic border-l-2 border-slate-700">"{tx.memo}"</div>}</div>))}
// //                 </div>
// //              </section>
// //           </div>
// //         </div>
// //       </main>
// //     </div>
// //   );
// // }

// // "use client";

// // import { useState, useEffect } from "react";
// // import { 
// //   Copy, RefreshCw, Wallet, Send, ArrowRightLeft, ShieldPlus, History, 
// //   Key, LogOut, CheckCircle, AlertCircle, Search, Loader2, Trash2, 
// //   Settings, ArrowDown, Plus, PenTool, TrendingUp, Landmark, ExternalLink, Info, Activity, X, ShieldCheck
// // } from "lucide-react";
// // import { Asset } from "@stellar/stellar-sdk";
// // import { server } from "./lib/stellar";
// // import { createWallet, restoreWallet } from "./lib/phraseWallet";
// // import { getBalances, getTransactions } from "./lib/balances";
// // import { sendPayment, changeTrustline, sendCrossAssetPayment } from "./lib/payments";
// // import { swapAssets } from "./lib/swap"; 
// // import { searchAssets, AssetRecord } from "./lib/assets";
// // import { getDepositUrl } from "./lib/anchor";
// // import { createLiquidityPool } from "./lib/liquidity";

// // const Card = ({ children, className = "" }: any) => (<div className={`bg-slate-900 border border-slate-800 rounded-xl p-6 ${className}`}>{children}</div>);
// // const Button = ({ onClick, disabled, variant = "primary", children, className = "" }: any) => {
// //   const styles: any = {
// //     primary: "bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-800",
// //     secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200",
// //     danger: "bg-red-900/20 hover:bg-red-900/40 text-red-400",
// //     ramp: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
// //   };
// //   return <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${styles[variant]} ${className}`}>{children}</button>;
// // };
// // const Input = (props: any) => (<input {...props} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600" />);
// // const Label = ({ children }: { children: React.ReactNode }) => (<label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">{children}</label>);

// // export default function WalletDashboard() {
// //   const [wallet, setWallet] = useState<any>(null);
// //   const [activeTab, setActiveTab] = useState("assets");
// //   const [loading, setLoading] = useState(false);
// //   const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });
// //   const [balances, setBalances] = useState<any[]>([]);
// //   const [txs, setTxs] = useState<any[]>([]);
// //   const [receipt, setReceipt] = useState<any>(null);
// //   const [logs, setLogs] = useState<string[]>(["Core systems online..."]);
  
// //   // States
// //   const [estimatedCost, setEstimatedCost] = useState<string | null>(null);
// //   const [swapForm, setSwapForm] = useState({ sendAsset: "XLM", sendIssuer: "", destAsset: "", destIssuer: "", amount: "" });
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [searchResults, setSearchResults] = useState<AssetRecord[]>([]);
// //   const [isSearching, setIsSearching] = useState(false);
// //   const [manualAssetForm, setManualAssetForm] = useState({ code: "", issuer: "" });
// //   const [phraseInput, setPhraseInput] = useState("");
// //   const [paymentMode, setPaymentMode] = useState<'P2P' | 'CROSS'>('P2P');
// //   const [sendForm, setSendForm] = useState({ to: "", amount: "", sourceIndex: 0, destCode: "USDC", destIssuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" });
// //   const [liquidityModal, setLiquidityModal] = useState<{show: boolean, code: string, issuer: string}>({ show: false, code: "", issuer: "" });
// //   const [liqAmounts, setLiqAmounts] = useState({ xlm: "1000", asset: "1000" });

// //   const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 7)]);

// //   // --- EFFECT: Real-time FX Cost Preview ---
// //   useEffect(() => {
// //     const fetchFXPreview = async () => {
// //       if (paymentMode === 'CROSS' && sendForm.amount && parseFloat(sendForm.amount) > 0) {
// //         try {
// //           const source = balances[sendForm.sourceIndex];
// //           const sCode = source.asset.split(':')[0] === 'XLM' ? 'XLM' : source.asset.split(':')[0];
// //           const sIssuer = source.asset.split(':')[1];
// //           const sendAsset = sCode === "XLM" ? Asset.native() : new Asset(sCode, sIssuer);
// //           const destAsset = sendForm.destCode === "XLM" ? Asset.native() : new Asset(sendForm.destCode, sendForm.destIssuer);

// //           const paths = await server.strictReceivePaths(sendAsset, destAsset, sendForm.amount).call();
// //           if (paths.records.length > 0) {
// //             setEstimatedCost(paths.records[0].source_amount);
// //           } else { setEstimatedCost(null); }
// //         } catch (e) { setEstimatedCost(null); }
// //       } else { setEstimatedCost(null); }
// //     };
// //     fetchFXPreview();
// //   }, [sendForm.amount, sendForm.destCode, sendForm.sourceIndex, paymentMode, balances]);

// //   const decodeStellarError = (e: any) => {
// //     const code = e?.response?.data?.extras?.result_codes?.operations?.[0] || e?.response?.data?.extras?.result_codes?.transaction;
// //     if (code === "op_too_few_offers" || code === "op_no_path") return "Liquidity Error: No trade path found. Initialize market first.";
// //     if (code === "op_no_trust") return "Trust Error: Recipient hasn't added this asset.";
// //     if (code === "op_underfunded") return "Balance Error: Insufficient funds.";
// //     return `Rejection: ${code || "Network Timeout"}`;
// //   };

// //   // --- ACTIONS ---

// //   const handleSwap = async () => {
// //     setLoading(true); setStatus({ type: null, msg: '' });
// //     addLog(`DEX Swap: Converting ${swapForm.amount} ${swapForm.sendAsset}...`);
// //     try {
// //       const res: any = await swapAssets(wallet.secretKey, swapForm.sendAsset, swapForm.sendIssuer, swapForm.destAsset, swapForm.destIssuer, swapForm.amount);
// //       await refreshData(wallet.publicKey);
// //       setReceipt({...res, type: 'LIQUIDITY_SWAP'});
// //     } catch (e: any) { 
// //       const msg = decodeStellarError(e);
// //       addLog(msg); setStatus({ type: 'error', msg }); 
// //     }
// //     setLoading(false);
// //   };

// //   const handleCreateMarket = async () => {
// //     setLoading(true);
// //     const { code, issuer } = liquidityModal;
// //     addLog(`AMM: Seeding liquidity into ${code}/XLM pool...`);
// //     try {
// //       await createLiquidityPool(wallet.secretKey, code, issuer, liqAmounts.xlm, liqAmounts.asset);
// //       await refreshData(wallet.publicKey);
// //       addLog(`Market Ready: ${code} path enabled.`);
// //       setStatus({ type: 'success', msg: `Market initialized for ${code}` });
// //       setLiquidityModal({show: false, code: "", issuer: ""});
// //     } catch (e) {
// //       addLog(`AMM Error: Underfunded balance.`);
// //       setStatus({ type: 'error', msg: "Liquidity failed." });
// //     }
// //     setLoading(false);
// //   };

// // const handleTransfer = async () => {
// //   setLoading(true);
// //   setStatus({ type: null, msg: "" });

// //   // 1. Setup Abort Controller for a 45-second hardware timeout
// //   const controller = new AbortController();
// //   const timeoutId = setTimeout(() => controller.abort(), 45000);

// //   addLog("Engine: Finalizing settlement route...");

// //   try {
// //     const source = balances[sendForm.sourceIndex];
// //     const sCode = source.asset.split(":")[0] === "XLM" ? "XLM" : source.asset.split(":")[0];
// //     const sIssuer = source.asset.split(":")[1];

// //     let res: any;

// //     if (paymentMode === "P2P") {
// //       // Pass the controller signal if your sendPayment function supports it, 
// //       // or rely on the global server timeout we set in stellar.ts
// //       res = await sendPayment(
// //         wallet.secretKey,
// //         sendForm.to,
// //         sendForm.amount,
// //         sCode,
// //         sIssuer
// //       );
// //     } else {
// //       const dIssuer = sendForm.destCode === "XLM" ? undefined : sendForm.destIssuer;

// //       // FX Engine often hangs during pathfinding if liquidity is low
// //       addLog(`DEX: Searching for bridge ${sCode} -> ${sendForm.destCode}...`);

// //       res = await sendCrossAssetPayment(
// //         wallet.secretKey,
// //         sendForm.to,
// //         sCode,
// //         sIssuer,
// //         sendForm.destCode,
// //         dIssuer,
// //         sendForm.amount
// //       );
// //     }

// //     setReceipt({
// //       ...res,
// //       type: paymentMode === "P2P" ? "P2P_DIRECT" : "FX_STRICT_RECEIVE",
// //     });
// //     addLog(`Success. Ledger: ${res.ledger}`);
// //     await refreshData(wallet.publicKey);
    
// //   } catch (e: any) {
// //     // 2. Handle the Timeout specifically
// //     if (e.name === "AbortError" || e.message?.includes("timeout")) {
// //       const timeoutMsg = "Network Timeout: The Stellar DEX path search took too long. Try a smaller amount or seed more liquidity.";
// //       addLog(timeoutMsg);
// //       setStatus({ type: "error", msg: timeoutMsg });
// //     } else {
// //       const msg = decodeStellarError(e);
// //       addLog(msg);
// //       setStatus({ type: "error", msg });
// //     }
// //   } finally {
// //     // 3. Clean up the timer to prevent memory leaks
// //     clearTimeout(timeoutId);
// //     setLoading(false);
// //   }
// // };

// //   const refreshData = async (pubKey: string) => {
// //     addLog("Polling Ledger...");
// //     const [b, t] = await Promise.all([getBalances(pubKey), getTransactions(pubKey)]);
// //     setBalances(b); setTxs(t);
// //   };

// //   const handleRestore = async () => {
// //     setLoading(true);
// //     try {
// //       const w = restoreWallet(phraseInput);
// //       setWallet(w); await refreshData(w.publicKey);
// //       addLog("Authentication Successful.");
// //     } catch (e: any) { setStatus({ type: 'error', msg: "Restore Failed" }); }
// //     setLoading(false);
// //   };

// //   const handleAddAsset = async (code: string, issuer: string) => {
// //     setLoading(true); addLog(`Ledger: Opening Trustline ${code}...`);
// //     try {
// //       await changeTrustline(wallet.secretKey, code, issuer);
// //       await refreshData(wallet.publicKey);
// //       addLog(`${code} trusted.`);
// //       setStatus({ type: 'success', msg: `Added ${code}` });
// //     } catch (e) { setStatus({ type: 'error', msg: "Trustline Failed" }); }
// //     setLoading(false);
// //   };

// //   const handleSearch = async (q: string) => {
// //     setSearchQuery(q);
// //     if (q.length < 2) return;
// //     setIsSearching(true);
// //     const r = await searchAssets(q);
// //     setSearchResults(r);
// //     setIsSearching(false);
// //   };

// //   if (!wallet) return (
// //     <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
// //       <div className="max-w-md w-full space-y-8 animate-in fade-in duration-500">
// //         <div className="text-center"><div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg"><Wallet className="text-white w-8 h-8"/></div><h1 className="text-3xl font-bold text-white mt-4 tracking-tighter">Stellar Ops</h1><p className="text-slate-500 text-sm mt-2">B2B Financial Connectivity</p></div>
// //         <Card className="bg-slate-900/50 backdrop-blur border-slate-800/50 shadow-2xl">
// //           <textarea value={phraseInput} onChange={e=>setPhraseInput(e.target.value)} placeholder="Secret Mnemonic..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm h-24 mb-4 text-white resize-none focus:border-blue-500 transition-colors outline-none" />
// //           <Button onClick={handleRestore} disabled={loading} className="w-full h-12 text-base">{loading ? <Loader2 className="animate-spin" /> : "Access Dashboard"}</Button>
// //         </Card>
// //       </div>
// //     </div>
// //   );

// //   return (
// //     <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      
// //       {/* MARKET MAKER MODAL */}
// //       {liquidityModal.show && (
// //         <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
// //           <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
// //             <div className="flex justify-between items-center mb-6">
// //               <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400"><TrendingUp className="w-5 h-5"/> Initialize Market</h2>
// //               <button onClick={() => setLiquidityModal({...liquidityModal, show: false})} className="text-slate-500 hover:text-white transition-colors"><X/></button>
// //             </div>
// //             <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl mb-6"><p className="text-[11px] text-emerald-200/70 leading-relaxed">Seeding this pool establishes an exchange rate. This is required for <strong>FX Payments</strong> and swaps to work.</p></div>
// //             <div className="space-y-4 mb-8">
// //                <div className="space-y-1.5"><Label>Amount to lock (XLM)</Label><Input type="number" value={liqAmounts.xlm} onChange={(e:any)=>setLiqAmounts({...liqAmounts, xlm: e.target.value})}/></div>
// //                <div className="space-y-1.5"><Label>Amount to lock ({liquidityModal.code})</Label><Input type="number" value={liqAmounts.asset} onChange={(e:any)=>setLiqAmounts({...liqAmounts, asset: e.target.value})}/></div>
// //             </div>
// //             <Button onClick={handleCreateMarket} disabled={loading} variant="ramp" className="w-full py-4 h-14 text-lg">Create Liquidity Pool</Button>
// //           </div>
// //         </div>
// //       )}

// //       {/* RECEIPT MODAL */}
// //       {receipt && (
// //         <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
// //           <div className="bg-slate-900 border border-blue-500/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
// //             <div className="text-center mb-6">
// //               <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><ShieldCheck className="text-emerald-500 w-8 h-8"/></div>
// //               <h2 className="text-xl font-bold uppercase tracking-tight">Finalized</h2>
// //               <p className="text-[10px] text-slate-500 mt-1">{receipt.type}</p>
// //             </div>
// //             <div className="space-y-3 bg-black/40 p-4 rounded-2xl mb-6 font-mono text-[10px]">
// //                <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500 uppercase font-bold tracking-tighter">Stellar Fee</span><span className="text-emerald-400">{receipt.fee} Stroops</span></div>
// //                <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500 uppercase font-bold tracking-tighter">Ledger</span><span className="text-white">{receipt.ledger}</span></div>
// //                <div className="pt-1"><p className="text-slate-500 mb-1 uppercase font-bold">Proof of Audit</p><p className="text-blue-400 break-all leading-tight tracking-tighter">{receipt.hash}</p></div>
// //             </div>
// //             <Button onClick={()=>setReceipt(null)} className="w-full">Dismiss</Button>
// //           </div>
// //         </div>
// //       )}

// //       <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
// //         <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
// //           <div className="flex items-center gap-2 font-bold text-lg"><div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">S</div>Stellar Ops</div>
// //           <div className="flex items-center gap-4">
// //              <div className="hidden sm:block text-right"><p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Account Proxy</p><p className="text-xs font-mono text-slate-400">{wallet.publicKey.substring(0,8)}...{wallet.publicKey.substring(wallet.publicKey.length-4)}</p></div>
// //              <Button variant="danger" onClick={()=>setWallet(null)} className="h-9 !px-3"><LogOut className="w-4 h-4"/></Button>
// //           </div>
// //         </div>
// //       </header>

// //       <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
// //         {status.msg && <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${status.type==='error'?'bg-red-900/20 text-red-200 border border-red-900/50':'bg-emerald-900/20 text-emerald-200 border border-emerald-900/50'}`}>{status.type==='error'?<AlertCircle className="w-5 h-5"/>:<CheckCircle className="w-5 h-5"/>}{status.msg}</div>}

// //         {/* PORTFOLIO SNAPSHOT */}
// //         <section className="space-y-4">
// //           <div className="flex items-center justify-between px-1">
// //              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2"><TrendingUp className="w-3 h-3 text-blue-500"/> Global Liquidity</h2>
// //              <Button variant="ghost" onClick={() => refreshData(wallet.publicKey)} className="h-7 text-[10px] !px-2"><RefreshCw className={`w-3 h-3 ${loading?'animate-spin':''}`}/> Refresh</Button>
// //           </div>
// //           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
// //              {balances.map((b, i) => (
// //                 <div key={i} className={`p-5 rounded-2xl border transition-all ${b.asset==='XLM'?'bg-gradient-to-br from-blue-600/30 to-slate-900 border-blue-500/50 shadow-xl shadow-blue-900/10':'bg-slate-900 border-slate-800 group hover:border-slate-600'}`}>
// //                    <div className="flex justify-between items-start mb-3">
// //                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${b.asset==='XLM'?'bg-blue-600 text-white shadow-lg':'bg-blue-900/30 text-blue-400'}`}>{b.asset === 'XLM' ? 'L' : b.asset.split(':')[0][0]}</div>
// //                       {b.asset !== 'XLM' && (
// //                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
// //                            <button onClick={()=>setLiquidityModal({show: true, code: b.asset.split(':')[0], issuer: b.asset.split(':')[1]})} className="text-emerald-500 hover:text-emerald-400" title="Market Maker"><TrendingUp className="w-4 h-4"/></button>
// //                            <button onClick={()=>changeTrustline(wallet.secretKey, b.asset.split(':')[0], b.asset.split(':')[1], '0').then(()=>refreshData(wallet.publicKey))} className="text-slate-600 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
// //                         </div>
// //                       )}
// //                    </div>
// //                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{b.asset.split(':')[0]}</h3>
// //                    <div className="text-xl font-bold font-mono truncate tracking-tighter">{parseFloat(b.balance).toLocaleString()}</div>
// //                    <p className="text-[8px] text-slate-600 font-mono mt-2 truncate">ID: {b.asset.split(':')[1]?.substring(0,8) || 'System Native'}</p>
// //                 </div>
// //              ))}
// //           </div>
// //         </section>

// //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
// //           <div className="lg:col-span-2 space-y-6">
// //             <div className="flex gap-4 border-b border-slate-800 pb-1 overflow-x-auto custom-scrollbar">
// //                {[{id:'assets', icon:ShieldPlus, label:'Manage Assets'}, {id:'send', icon:Send, label:'FX Engine'}, {id:'swap', icon:ArrowRightLeft, label:'Liquidity Swap'}].map(t => (
// //                  <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`flex items-center gap-2 py-3 px-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${activeTab===t.id?'border-blue-500 text-blue-400':'border-transparent text-slate-500 hover:text-slate-300'}`}>
// //                    <t.icon className="w-4 h-4"/> {t.label}
// //                  </button>
// //                ))}
// //             </div>

// //             <Card className="min-h-[450px] shadow-2xl border-slate-800/50">
// //                {activeTab === 'assets' && (
// //                  <div className="space-y-8 animate-in fade-in duration-300">
// //                     <div className="space-y-4">
// //                        <Label>Explore Public Directory</Label>
// //                        <div className="relative"><Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-600"/><Input placeholder="Search tokens (USDC, BTC)..." value={searchQuery} onChange={e=>handleSearch(e.target.value)} className="pl-12 bg-slate-900 border-slate-800 focus:border-blue-500 outline-none transition-colors"/>{isSearching && <Loader2 className="absolute right-4 top-3.5 w-5 h-5 animate-spin text-blue-500"/>}</div>
// //                        {searchResults.length > 0 && <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">{searchResults.map((a, i)=>(<div key={i} className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-blue-900/20 text-blue-400 rounded-xl flex items-center justify-center font-bold">{a.code[0]}</div><div><p className="font-bold text-sm text-white">{a.code}</p><p className="text-[10px] text-slate-500 italic">{a.domain}</p></div></div><Button onClick={()=>handleAddAsset(a.code, a.issuer)} variant="secondary" className="text-[10px] h-8 px-4">Establish Trust</Button></div>))}</div>}
// //                     </div>
// //                     <div className="pt-6 border-t border-slate-800/50">
// //                        <Label>Manual Asset Bridge</Label>
// //                        <div className="flex gap-3 mt-2"><Input placeholder="Code" value={manualAssetForm.code} onChange={e=>setManualAssetForm({...manualAssetForm, code:e.target.value.toUpperCase()})} className="h-11 text-xs w-24 bg-slate-900 border-slate-800"/><Input placeholder="Issuer Key (G...)" value={manualAssetForm.issuer} onChange={e=>setManualAssetForm({...manualAssetForm, issuer:e.target.value})} className="h-11 text-xs flex-1 bg-slate-900 border-slate-800"/><Button onClick={()=>handleAddAsset(manualAssetForm.code, manualAssetForm.issuer)} disabled={!manualAssetForm.code || !manualAssetForm.issuer} className="h-11 px-5 shadow-lg"><Plus className="w-4 h-4"/></Button></div>
// //                     </div>
// //                  </div>
// //                )}

// //                {activeTab === 'send' && (
// //                  <div className="space-y-8 animate-in fade-in duration-300">
// //                     <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
// //                        <button onClick={()=>setPaymentMode('P2P')} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${paymentMode==='P2P'?'bg-blue-600 text-white shadow-xl':'text-slate-500 hover:text-slate-300'}`}>P2P Direct</button>
// //                        <button onClick={()=>setPaymentMode('CROSS')} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${paymentMode==='CROSS'?'bg-purple-600 text-white shadow-xl':'text-slate-500 hover:text-slate-300'}`}>FX Settlement</button>
// //                     </div>

// //                     <div className="space-y-6">
// //                        <div className="space-y-2"><Label>Recipient Identity</Label><Input value={sendForm.to} onChange={e=>setSendForm({...sendForm, to: e.target.value})} placeholder="Recipient Public Key (G...)" className="bg-slate-900 border-slate-800 font-mono text-xs"/></div>
// //                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
// //                           <div className="space-y-2"><Label>Debit Source</Label><select className="w-full h-12 bg-slate-900 border border-slate-800 rounded-xl px-4 text-xs text-white appearance-none cursor-pointer focus:border-blue-500" value={sendForm.sourceIndex} onChange={e=>setSendForm({...sendForm, sourceIndex: parseInt(e.target.value)})}>
// //                              {balances.map((b, i)=>(<option key={i} value={i}>{b.asset.split(':')[0]} ({parseFloat(b.balance).toFixed(2)})</option>))}
// //                           </select></div>
// //                           <div className="space-y-2"><Label>{paymentMode==='P2P'?'Transfer Amount':'Recipient Receives'}</Label><Input type="number" value={sendForm.amount} onChange={e=>setSendForm({...sendForm, amount:e.target.value})} placeholder="0.00" className="bg-slate-900 border-slate-800 font-mono text-lg"/></div>
// //                        </div>

// //                        {paymentMode === 'CROSS' && (
// //                          <div className="space-y-4 animate-in slide-in-from-top-4">
// //                             <div className="grid grid-cols-3 gap-3 p-5 bg-purple-950/20 border border-purple-500/20 rounded-2xl shadow-inner">
// //                                <div className="space-y-1"><Label>Target Code</Label><Input value={sendForm.destCode} onChange={e=>setSendForm({...sendForm, destCode: e.target.value.toUpperCase()})} placeholder="USDC" className="bg-slate-950 h-10 text-xs border-purple-900/50"/></div>
// //                                <div className="col-span-2 space-y-1"><Label>Target Issuer</Label><Input value={sendForm.destIssuer} onChange={e=>setSendForm({...sendForm, destIssuer: e.target.value})} placeholder="Public Key" className="bg-slate-950 h-10 text-xs border-purple-900/50"/></div>
// //                             </div>
                            
// //                             {estimatedCost && (
// //                               <div className="bg-blue-600/10 border border-blue-500/30 p-3 rounded-xl flex items-center justify-between animate-pulse">
// //                                  <div className="flex items-center gap-2">
// //                                    <Info className="w-4 h-4 text-blue-400" />
// //                                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-tighter">Settlement Cost Preview:</span>
// //                                  </div>
// //                                  <span className="text-sm font-mono font-bold text-white">
// //                                    {parseFloat(estimatedCost).toFixed(4)} {balances[sendForm.sourceIndex].asset.split(':')[0]}
// //                                  </span>
// //                               </div>
// //                             )}
// //                          </div>
// //                        )}
// //                     </div>
// //                     <Button onClick={handleTransfer} disabled={loading} className={`w-full h-14 text-sm font-bold uppercase tracking-widest shadow-2xl ${paymentMode==='CROSS'?'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20':'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'}`}>
// //                        {loading ? <Loader2 className="animate-spin w-5 h-5"/> : `Execute Payment Engine`}
// //                     </Button>
// //                  </div>
// //                )}

// //                {/* TAB 3: SWAP ENGINE */}
// //               {activeTab === 'swap' && (
// //                 <div className="space-y-6 py-4 max-w-lg mx-auto animate-in zoom-in-95 duration-300">
// //                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
// //                      <Label>Exchange (You Give)</Label>
// //                      <div className="flex gap-4">
// //                         <div className="w-1/3"><Input value={swapForm.sendAsset} onChange={e=>setSwapForm({...swapForm, sendAsset:e.target.value.toUpperCase()})} placeholder="XLM" className="bg-slate-900 border-slate-700 font-bold"/></div>
// //                         <div className="w-2/3"><Input type="number" value={swapForm.amount} onChange={e=>setSwapForm({...swapForm, amount:e.target.value})} placeholder="0.00" className="bg-slate-900 border-slate-700 font-mono text-xl"/></div>
// //                      </div>
// //                      {swapForm.sendAsset !== 'XLM' && <Input value={swapForm.sendIssuer} onChange={e=>setSwapForm({...swapForm, sendIssuer:e.target.value})} placeholder="Issuer Address (G...)" className="text-[10px] h-9 bg-slate-900/50 border-slate-800 font-mono"/>}
// //                    </div>
// //                    <div className="flex justify-center -my-4 relative z-10"><div className="bg-slate-800 p-3 rounded-full border-4 border-slate-950 text-blue-400 shadow-2xl animate-bounce duration-1000"><ArrowDown className="w-5 h-5"/></div></div>
// //                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
// //                      <Label>Exchange (You Receive)</Label>
// //                      <div className="flex gap-4"><div className="w-full"><Input value={swapForm.destAsset} onChange={e=>setSwapForm({...swapForm, destAsset:e.target.value.toUpperCase()})} placeholder="USDC" className="bg-slate-900 border-slate-700 font-bold"/></div></div>
// //                      {swapForm.destAsset !== 'XLM' && <Input value={swapForm.destIssuer} onChange={e=>setSwapForm({...swapForm, destIssuer:e.target.value})} placeholder="Issuer Address (G...)" className="text-[10px] h-9 bg-slate-900/50 border-slate-800 font-mono"/>}
// //                    </div>
// //                    <Button onClick={handleSwap} disabled={loading} className="w-full py-4 h-14 text-sm font-bold uppercase tracking-widest shadow-2xl">
// //                       {loading ? <Loader2 className="animate-spin w-5 h-5"/> : "Broadcast Swap Engine"}
// //                    </Button>
// //                 </div>
// //               )}
// //             </Card>
// //           </div>

// //           <div className="lg:col-span-1 space-y-6">
// //              {/* BACKGROUND MONITOR */}
// //              <section className="bg-black/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
// //                 <div className="bg-slate-800/50 px-5 py-3 flex items-center justify-between border-b border-slate-800">
// //                    <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500 animate-pulse"/><span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Monitor</span></div>
// //                    <div className="flex gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30"/><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/></div>
// //                 </div>
// //                 <div className="p-5 space-y-2.5 h-44 overflow-hidden flex flex-col-reverse custom-scrollbar shadow-inner">
// //                   {logs.map((log, i)=>(<p key={i} className="text-[10px] font-mono text-emerald-500 leading-relaxed pl-3 border-l border-emerald-900/40 opacity-90">{log}</p>))}
// //                 </div>
// //              </section>

// //              {/* AUDIT TRAIL */}
// //              <section className="space-y-5">
// //                 <div className="flex justify-between items-center px-1"><h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2"><History className="w-4 h-4 text-blue-500"/> Audit Trail</h3><Button variant="ghost" onClick={()=>refreshData(wallet.publicKey)} className="h-8 !px-2 hover:bg-slate-800"><RefreshCw className={`w-3.5 h-3.5 ${loading?'animate-spin':''}`}/></Button></div>
// //                 <div className="space-y-4 h-[350px] overflow-y-auto pr-1 custom-scrollbar">
// //                    {txs.map((tx, i)=>(<div key={i} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-[11px] hover:border-slate-700 hover:bg-slate-900/80 transition-all cursor-pointer group shadow-sm" onClick={()=>window.open(`https://stellar.expert/explorer/testnet/tx/${tx.hash}`, '_blank')}><div className="flex justify-between items-start mb-2"><span className="text-blue-400 font-mono font-bold group-hover:text-blue-300 transition-colors">#{tx.hash.substring(0,8)}</span><span className="text-slate-600 font-bold tabular-nums">{new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>{tx.memo && <div className="p-3 bg-black/40 rounded-xl text-slate-400 text-[10px] italic border-l-2 border-slate-600 leading-snug">"{tx.memo}"</div>}</div>))}
// //                    {txs.length === 0 && <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800 text-slate-700 text-[10px] font-bold uppercase">No Ledger History</div>}
// //                 </div>
// //              </section>
// //           </div>
// //         </div>
// //       </main>
// //     </div>
// //   );
// // }
// "use client";

// import { useState, useEffect } from "react";
// import { 
//   Copy, RefreshCw, Wallet, Send, ArrowRightLeft, ShieldPlus, History, 
//   Key, LogOut, CheckCircle, AlertCircle, Search, Loader2, Trash2, 
//   Settings, ArrowDown, Plus, PenTool, TrendingUp, Landmark, ExternalLink, Info, Activity, X, ShieldCheck, Download, Eye, EyeOff, Building2, Briefcase
// } from "lucide-react";
// import { Asset } from "@stellar/stellar-sdk";
// import { server } from "./lib/stellar";
// import { createWallet, restoreWallet } from "./lib/phraseWallet";
// import { getBalances, getTransactions } from "./lib/balances";
// import { sendPayment, changeTrustline, sendCrossAssetPayment } from "./lib/payments";
// import { swapAssets } from "./lib/swap"; 
// import { searchAssets, AssetRecord } from "./lib/assets";
// import { createLiquidityPool } from "./lib/liquidity";

// /* ---------------------- AUTH CONFIG ---------------------- */
// const HARDCODED_USERS = [
//   {
//     email: "moneyverse@gmail.com",
//     password: "mvpay123",
//     company: "Moneyverse Pvt Ltd"
//   },
//   {
//     email: "moneyverse2@gmail.com",
//     password: "mvpay123",
//     company: "Fintech Pvt Ltd"
//   }
// ];

// // --- UI Helpers ---
// const Card = ({ children, className = "" }: any) => (<div className={`bg-slate-900 border border-slate-800 rounded-xl p-6 ${className}`}>{children}</div>);
// const Button = ({ onClick, disabled, variant = "primary", children, className = "" }: any) => {
//   const styles: any = {
//     primary: "bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-800",
//     secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200",
//     danger: "bg-red-900/20 hover:bg-red-900/40 text-red-400",
//     ramp: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20",
//     ghost: "text-slate-500 hover:text-white"
//   };
//   return <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${styles[variant]} ${className}`}>{children}</button>;
// };
// const Input = (props: any) => (<input {...props} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600" />);
// const Label = ({ children }: { children: React.ReactNode }) => (<label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">{children}</label>);

// export default function WalletDashboard() {
//   /* ---------------------- STATE MANAGEMENT ---------------------- */
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [companyName, setCompanyName] = useState("");
//   const [loginForm, setLoginForm] = useState({ email: "", password: "", company: "" });

//   const [wallet, setWallet] = useState<any>(null);
//   const [activeTab, setActiveTab] = useState("send");
//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });
//   const [balances, setBalances] = useState<any[]>([]);
//   const [txs, setTxs] = useState<any[]>([]);
//   const [receipt, setReceipt] = useState<any>(null);
//   const [logs, setLogs] = useState<string[]>(["B2B Settlement Node ready..."]);
//   const [selectedAssetInfo, setSelectedAssetInfo] = useState<any>(null);
//   // Account Creation/FX States
//   const [newAccountData, setNewAccountData] = useState<any>(null);
//   const [showSecret, setShowSecret] = useState(false);
//   const [estimatedCost, setEstimatedCost] = useState<string | null>(null);
//   const [swapForm, setSwapForm] = useState({ sendAssetIndex: 0, destAssetIndex: 0, amount: "" });
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState<AssetRecord[]>([]);
//   const [isSearching, setIsSearching] = useState(false);
//   const [manualAssetForm, setManualAssetForm] = useState({ code: "", issuer: "" });
//   const [phraseInput, setPhraseInput] = useState("");
//   const [paymentMode, setPaymentMode] = useState<'DIRECT' | 'FX'>('DIRECT');
//   const [sendForm, setSendForm] = useState({ vendorName: "", to: "", amount: "", sourceIndex: 0, destCode: "USDC", destIssuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" });
//   const [liquidityModal, setLiquidityModal] = useState<{show: boolean, code: string, issuer: string}>({ show: false, code: "", issuer: "" });
//   const [liqAmounts, setLiqAmounts] = useState({ xlm: "1000", asset: "1000" });
//   const [selectedTx, setSelectedTx] = useState<any>(null);
//   const [fetchingTx, setFetchingTx] = useState(false);
//   const [isSessionLoading, setIsSessionLoading] = useState(true);
//   // const feeInXlm = (parseInt(tx.fee_charged) / 10000000).toFixed(7);
//   const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 7)]);

//   /* ---------------------- AUTH LOGIC ---------------------- */
//  const handleLogin = () => {
//   const match = HARDCODED_USERS.find(
//     u => u.email === loginForm.email && u.password === loginForm.password 
//   );
//   if (!match) {
//     setStatus({ type: "error", msg: "Invalid enterprise credentials" });
//     return;
//   }
  
//   // Save to state
//   setCompanyName(match.company);
//   setIsAuthenticated(true);
  
//   // Save to localStorage
//   localStorage.setItem("gb_isAuthenticated", "true");
//   localStorage.setItem("gb_companyName", match.company);
  
//   setStatus({ type: "success", msg: "Login successful" });
// };

//   /* ---------------------- SESSION RECOVERY ---------------------- */
// useEffect(() => {
//   const savedAuth = localStorage.getItem("gb_isAuthenticated");
//   const savedCompany = localStorage.getItem("gb_companyName");
//   const savedWallet = localStorage.getItem("gb_wallet");

//   if (savedAuth === "true" && savedWallet) {
//     const parsedWallet = JSON.parse(savedWallet);
//     setWallet(parsedWallet);
//     setCompanyName(savedCompany || "");
//     setIsAuthenticated(true);
//     refreshData(parsedWallet.publicKey);
//   }

//   // CRITICAL: Turn off loading state after checking localStorage
//   setIsSessionLoading(false);
// }, []);

//   /* ---------------------- EFFECT: FX PREVIEW ---------------------- */
//   useEffect(() => {
//     const fetchFXPreview = async () => {
//       if (paymentMode === 'FX' && sendForm.amount && parseFloat(sendForm.amount) > 0 && balances.length > 0) {
//         try {
//           const source = balances[sendForm.sourceIndex];
//           const sCode = source.asset.split(':')[0];
//           const sIssuer = source.asset.split(':')[1];
//           const sendAsset = sCode === "XLM" ? Asset.native() : new Asset(sCode, sIssuer);
//           const destAsset = sendForm.destCode === "XLM" ? Asset.native() : new Asset(sendForm.destCode, sendForm.destIssuer);

//           const paths = await server.strictReceivePaths(sendAsset, destAsset, sendForm.amount).call();
//           if (paths.records.length > 0) setEstimatedCost(paths.records[0].source_amount);
//         } catch (e) { setEstimatedCost(null); }
//       } else { setEstimatedCost(null); }
//     };
//     fetchFXPreview();
//   }, [sendForm.amount, sendForm.destCode, sendForm.sourceIndex, paymentMode, balances]);

//   /* ---------------------- ENGINE ACTIONS ---------------------- */
//   const refreshData = async (pubKey: string) => {
//     try {
//       const [b, t] = await Promise.all([getBalances(pubKey), getTransactions(pubKey)]);
//       setBalances(b);
//       setTxs(t);
//     } catch (e) { addLog("Failed to sync ledger."); }
//   };

//   const handleRestore = async () => {
//   setLoading(true);
//   try {
//     const w = restoreWallet(phraseInput);
//     setWallet(w);
    
//     // Save wallet to localStorage
//     localStorage.setItem("gb_wallet", JSON.stringify(w));
    
//     await refreshData(w.publicKey);
//     addLog("Node authorized and session saved.");
//   } catch { 
//     setStatus({ type: "error", msg: "Invalid mnemonic phrase" }); 
//   }
//   setLoading(false);
// };

//   const handleCreateAccount = async () => {
//     setLoading(true);
//     try {
//       const data = await createWallet();
//       setNewAccountData(data);
//       addLog("New corporate wallet generated.");
//     } catch { setStatus({ type: 'error', msg: "Generation error" }); }
//     setLoading(false);
//   };

//   const handleSwap = async () => {
//     setLoading(true); setStatus({ type: null, msg: '' });
//     try {
//       const s = balances[swapForm.sendAssetIndex];
//       const t = balances[swapForm.destAssetIndex];
//       const res: any = await swapAssets(wallet.secretKey, s.asset.split(':')[0], s.asset.split(':')[1], t.asset.split(':')[0], t.asset.split(':')[1], swapForm.amount);
//       await refreshData(wallet.publicKey);
//       setReceipt({...res, type: 'TREASURY_SWAP'});
//     } catch { setStatus({ type: 'error', msg: "Swap failed: No path" }); }
//     setLoading(false);
//   };

//   const handleTransfer = async () => {
//     setLoading(true); setStatus({ type: null, msg: '' });
//     try {
//       const source = balances[sendForm.sourceIndex];
//       const sCode = source.asset.split(':')[0];
//       const sIssuer = source.asset.split(':')[1];
//       let res: any;
//       if (paymentMode === 'DIRECT') {
//         res = await sendPayment(wallet.secretKey, sendForm.to, sendForm.amount, sCode, sIssuer, `Ref: ${sendForm.vendorName}`);
//       } else {
//         res = await sendCrossAssetPayment(wallet.secretKey, sendForm.to, sCode, sIssuer, sendForm.destCode, sendForm.destIssuer, sendForm.amount, `FX: ${sendForm.vendorName}`);
//       }
//       setReceipt({...res, vendor: sendForm.vendorName, type: paymentMode === 'DIRECT' ? 'B2B_SETTLEMENT' : 'CLEARING_SETTLEMENT'});
//       await refreshData(wallet.publicKey);
//     } catch { setStatus({ type: 'error', msg: "Network rejection" }); }
//     setLoading(false);
//   };
//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//     setStatus({ type: 'success', msg: 'Copied!' });
//     setTimeout(() => setStatus({ type: null, msg: '' }), 2000);
//   };

//   const handleAddAsset = async (code: string, issuer: string) => {
//     setLoading(true);
//     try {
//       await changeTrustline(wallet.secretKey, code, issuer);
//       await refreshData(wallet.publicKey);
//       setStatus({ type: 'success', msg: `Trusted ${code}` });
//     } catch { setStatus({ type: 'error', msg: "Trust failed" }); }
//     setLoading(false);
//   };
//   const handleLogout = () => {
//   // Clear State
//   setWallet(null);
//   setIsAuthenticated(false);
//   setCompanyName("");
//   setBalances([]);
//   setTxs([]);
//   setStatus({ type: null, msg: '' });

//   // Clear localStorage
//   localStorage.removeItem("gb_isAuthenticated");
//   localStorage.removeItem("gb_companyName");
//   localStorage.removeItem("gb_wallet");
  
//   addLog("Session terminated securely.");
// };
//   const handleSearch = async (q: string) => {
//     setSearchQuery(q);
//     if (q.length < 2) return;
//     setIsSearching(true);
//     const r = await searchAssets(q);
//     setSearchResults(r);
//     setIsSearching(false);
//   };
  
// const handleRemoveAsset = async (code: string, issuer: string, balance: string) => {
//   // Check if balance is 0 (Stellar rule: cannot delete if you hold funds)
//   if (parseFloat(balance) > 0) {
//     addLog(`Error: Clear ${code} balance before removing.`);
//     setStatus({ type: 'error', msg: "Balance must be 0 to remove." });
//     return;
//   }

//   setLoading(true);
//   addLog(`Ledger: Removing trustline for ${code}...`);
//   try {
//     // limit "0" deletes the trustline
//     await changeTrustline(wallet.secretKey, code, issuer, "0"); 
//     await refreshData(wallet.publicKey);
//     addLog(`Success: ${code} asset removed.`);
//     setStatus({ type: 'success', msg: `Removed ${code}` });
//   } catch (e: any) {
//     addLog("Rejection: Trustline removal failed.");
//     setStatus({ type: 'error', msg: "Failed to remove asset." });
//   }
//   setLoading(false);
// };
// const handleViewAudit = async (hash: string) => {
//   setFetchingTx(true);
//   try {
//     // 1. Fetch the main transaction data
//     const tx = await server.transactions().transaction(hash).call();
    
//     // 2. Fetch the operations within that transaction to get the amount/asset
//     const ops = await server.operations().forTransaction(hash).call();
//     const mainOp = ops.records[0]; // Usually the first operation contains the payment info

//     setSelectedTx({
//       hash: tx.hash,
//       ledger: tx.ledger_attr,
//       fee: tx.fee_charged,
//       memo: tx.memo,
//       created_at: tx.created_at,
//       successful: tx.successful,
//       // Mapping operation details
//       amount: mainOp.amount || "0.00",
//       asset: mainOp.asset_code || "XLM",
//       from: mainOp.from || mainOp.source_account,
//       to: mainOp.to || mainOp.funder || "System Operation",
//       type: mainOp.type.replace(/_/g, ' ')
//     });
//   } catch (e) {
//     addLog("Audit Retrieval Failed: Link to ledger broken.");
//   } finally {
//     setFetchingTx(false);
//   }
// };
// // Place this before your "if (!isAuthenticated)" logic
// if (isSessionLoading) {
//   return (
//     <div className="min-h-screen bg-slate-950 flex items-center justify-center">
//       <div className="text-center space-y-4">
//         <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
//         <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
//           Securing Session...
//         </p>
//       </div>
//     </div>
//   );
// }
//   /* ---------------------- RENDER: LOGIN ---------------------- */
//   if (!isAuthenticated) return (
//     <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      
//       <div className="max-w-md w-full space-y-6 animate-in fade-in duration-500">
//         <div className="text-center">
//           <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center ">
//             <img 
//               src="/logo.png" 
//               alt="Logo" 
//               className="w-15 h-15 object-contain" 
//             />
//           </div>
//           <h1 className="text-3xl font-bold text-white mt-4 tracking-tight">Welcome to Ghazanfar Bank</h1>
//           {/* <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Authorized Personnel Only</p> */}
//         </div>
//         <Card className="shadow-2xl">
//           <div className="space-y-4">
//             <div><Label>Organization Email</Label><Input value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} placeholder="Enter registered email" /></div>
//             <div><Label>Access Password</Label><Input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="********" /></div>
//             {/* <div><Label>Registered Company Name</Label><Input value={loginForm.company} onChange={e => setLoginForm({ ...loginForm, company: e.target.value })} placeholder="Exact Company Name" /></div> */}
//             {status.type === 'error' && <p className="text-red-400 text-[10px] font-bold uppercase text-center">{status.msg}</p>}
//             <Button onClick={handleLogin} className="w-full h-12">Login</Button>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );

//   /* ---------------------- RENDER: WALLET ACCESS ---------------------- */
//   if (!wallet) return (
//     <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
//       {newAccountData && (
//         <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
//           <div className="max-w-xl w-full bg-slate-900 border border-blue-500/30 rounded-3xl p-8 shadow-2xl">
//             <div className="text-center mb-8"><div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500"><Building2 className="w-8 h-8"/></div><h2 className="text-2xl font-bold">Treasury wallet Generated</h2><p className="text-slate-400 text-sm mt-2">Download keys below. They are required for access.</p></div>
//             <div className="space-y-4">
//               <div className="bg-black/40 p-4 rounded-xl border border-slate-800"><Label>Public Address</Label><p className="text-[11px] font-mono text-slate-300 break-all">{newAccountData.publicKey}</p></div>
//               <div className="bg-black/40 p-4 rounded-xl border border-slate-800"><Label>Secret Key</Label><p className="text-[11px] font-mono text-slate-300 break-all">{newAccountData.secretKey}</p></div>
//               <div className="bg-black/40 p-4 rounded-xl border border-slate-800"><Label>Access Mnemonic</Label><p className="text-sm font-medium text-blue-400 leading-relaxed">{newAccountData.mnemonic}</p></div>
//             </div>
//             <div className="grid grid-cols-2 gap-4 mt-8">
//               <Button onClick={() => {
//                 const content = `wallet BACKUP\nCompany: ${companyName}\nAddress: ${newAccountData.publicKey}\nSecret Key: ${newAccountData.secretKey}\nMnemonic: ${newAccountData.mnemonic}`;
//                 const blob = new Blob([content], { type: "text/plain" });
//                 const link = document.createElement("a");
//                 link.href = URL.createObjectURL(blob);
//                 link.download = "wallet-backup.txt"; link.click();
//               }} variant="secondary" className="h-12"><Download className="w-4 h-4"/> Backup TXT</Button>
//               <Button onClick={() => { setPhraseInput(newAccountData.mnemonic); setNewAccountData(null); }} className="h-12 bg-emerald-600">I have saved keys</Button>
//             </div>
//           </div>
//         </div>
//       )}
//       <div className="max-w-md w-full space-y-8 animate-in zoom-in-95 duration-500">
//         <div className="text-center"><Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4"/><h1 className="text-3xl font-bold text-white tracking-tighter">Treasury Access</h1><p className="text-slate-500 text-xs font-bold uppercase">{companyName}</p></div>
//         <Card className="bg-slate-900/50 backdrop-blur">
//           <textarea value={phraseInput} onChange={e=>setPhraseInput(e.target.value)} placeholder="wallet passphrase..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm h-24 mb-4 text-white resize-none outline-none focus:border-blue-500" />
//           <div className="space-y-3">
//             <Button onClick={handleRestore} disabled={loading || !phraseInput} className="w-full h-12">Login to wallet</Button>
//             <Button onClick={handleCreateAccount} variant="secondary" disabled={loading} className="w-full h-12 border border-slate-700 bg-transparent text-[10px] uppercase font-black tracking-widest">Create New Wallet</Button>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );

//   /* ---------------------- RENDER: MAIN DASHBOARD ---------------------- */
//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
//       {/* MODALS */}
//       {liquidityModal.show && (
//         <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <Card className="max-w-md w-full border-emerald-500/30">
//             <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400"><TrendingUp className="w-5 h-5"/> Seed Market</h2><X className="cursor-pointer" onClick={() => setLiquidityModal({...liquidityModal, show: false})}/></div>
//             <div className="space-y-4 mb-8">
//                <div className="space-y-1.5"><Label>Provision XLM</Label><Input type="number" value={liqAmounts.xlm} onChange={(e:any)=>setLiqAmounts({...liqAmounts, xlm: e.target.value})}/></div>
//                <div className="space-y-1.5"><Label>Provision {liquidityModal.code}</Label><Input type="number" value={liqAmounts.asset} onChange={(e:any)=>setLiqAmounts({...liqAmounts, asset: e.target.value})}/></div>
//             </div>
//             <Button onClick={handleCreateMarket} disabled={loading} variant="ramp" className="w-full h-14">Confirm Seeding</Button>
//           </Card>
//         </div>
//       )}

//       {receipt && (
//         <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
//           <Card className="max-w-sm w-full text-center border-blue-500/30">
//               <ShieldCheck className="text-emerald-500 w-12 h-12 mx-auto mb-4"/>
//               <h2 className="text-xl font-bold uppercase tracking-tight">Transaction Successfull</h2>
//               <div className="my-6 p-4 bg-black/40 rounded-2xl text-left space-y-3 font-mono text-[10px]">
//                  <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500 uppercase">Vendor</span><span className="text-white">{receipt.vendor || 'Corporate Entity'}</span></div>
//                  <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500 uppercase">Network Fee</span><span className="text-emerald-400">{receipt.fee} Stroops</span></div>
//                  <p className="text-blue-400 break-all leading-tight">{receipt.hash}</p>
//               </div>
//               <Button onClick={()=>setReceipt(null)} className="w-full">Done</Button>
//           </Card>
//         </div>
//       )}

//       {/* HEADER WITH COMPANY NAME */}
//       <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-20">
//         <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          
//           {/* LEFT: BANK BRANDING */}
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-sm">
//               <img 
//                 src="/logo.png" 
//                 alt="Ghazanfar Bank" 
//                 className="w-full h-full object-contain" 
//               />
//             </div>
//             <div className="hidden md:block">
//               <h1 className="font-extrabold text-lg text-white tracking-tight leading-none uppercase">
//                 Ghazanfar Bank
//               </h1>
//               <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
//                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
//                 Secure Corporate Portal
//               </p>
//             </div>
//           </div>

//           {/* RIGHT: CUSTOMER CONTEXT & SESSION MANAGEMENT */}
//           {/* RIGHT: CUSTOMER CONTEXT */}
//           <div className="flex items-center gap-6">
            
//             {/* USER ENTITY BOX */}
//             <div className="flex flex-col items-end border-r border-slate-800 pr-6">
//               <div className="flex items-center gap-2">
//                 <div className="text-right">
      
//                   <h2 className="text-sm font-extrabold text-white tracking-tight">
//                     {companyName || "Corporate Client"}
//                   </h2>
//                 </div>
//                 <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
//                   <Building2 className="w-4 h-4 text-blue-400" />
//                 </div>
//               </div>
              
//               <div className="flex items-center gap-2 mt-2">
//                 <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Wallet Address :</span>
                
//                 <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
//                   <span className="text-[10px] font-mono text-slate-400">
//                     {wallet.publicKey.substring(0, 6)}...{wallet.publicKey.substring(50)}
//                   </span>
//                   <button 
//                     onClick={() => copyToClipboard(wallet.publicKey)}
//                     className="text-slate-600 hover:text-blue-400 transition-colors"
//                   >
//                     <Copy className="w-3 h-3" />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* LOGOUT BUTTON */}
//             <Button 
//               variant="danger" 
//               onClick={handleLogout} 
//               className="h-10 px-4 bg-red-950/10 border border-red-500/20 hover:bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest"
//             >
//               <LogOut className="w-3.5 h-3.5 mr-2" />
//               Logout
//             </Button>
//           </div>
//         </div>
        
//         {/* SUB-HEADER: TRANSACTION BAR (Typical in Banking Apps) */}
//         <div className="bg-slate-900/50 border-b border-slate-800 px-4 py-2">
//           <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-medium text-slate-500 uppercase tracking-widest">
//             <div className="flex gap-4">
//               <span>Region: <span className="text-slate-300">Global (Stellar)</span></span>
//               <span>Environment: <span className="text-blue-400">TestNet</span></span>
//             </div>
//             <span>Last Login: {new Date().toLocaleTimeString()}</span>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-1000">
 
//         {/* PORTFOLIO GRID */}
//           <section className="space-y-4">
//             <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 ml-1">
//               <Briefcase className="w-3 h-3 text-blue-500"/> Treasury Asset Classes
//             </h2>
//             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
//               {balances.map((b, i) => (
//                   <div key={i} className="p-5 rounded-2xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition-all group shadow-lg">
//                     <div className="flex justify-between items-start mb-3">
//                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold bg-blue-900/30 text-blue-400`}>
//                           {b.asset[0]}
//                         </div>
                        
//                         {/* --- REMOVE ASSET ACTION --- */}
//                         {b.asset !== 'XLM' && (
//                           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                             {/* Liquidity shortcut */}
//                             <button onClick={()=>setLiquidityModal({show: true, code: b.asset.split(':')[0], issuer: b.asset.split(':')[1]})} className="text-emerald-500 hover:text-emerald-400">
//                               <TrendingUp className="w-4 h-4"/>
//                             </button>
                            
//                             {/* THE REMOVE BUTTON */}
//                             <button 
//                               onClick={() => handleRemoveAsset(b.asset.split(':')[0], b.asset.split(':')[1], b.balance)} 
//                               className="text-slate-600 hover:text-red-500"
//                               title="Remove Asset"
//                             >
//                               <Trash2 className="w-4 h-4"/>
//                             </button>
//                           </div>
//                         )}
//                     </div>
                    
//                     <h3 className="text-[10px] font-black text-slate-500 uppercase mb-1">{b.asset.split(':')[0]}</h3>
//                     <div className="text-xl font-bold font-mono truncate tracking-tighter">
//                       {parseFloat(b.balance).toLocaleString()}
//                     </div>
                    
//                     {/* Detailed Audit Stats */}
//                     <div className="mt-3 text-[15px] text-slate-600 flex justify-between font-mono border-t border-slate-800/50 pt-2">
//                       <span>Spendable:</span>
//                       <span className="text-emerald-500 font-bold">{parseFloat(b.spendable || b.balance).toFixed(7)}</span>
//                     </div>
//                   </div>
//               ))}
//             </div>
//           </section>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2 space-y-6">
//             <div className="flex gap-8 border-b border-slate-800 pb-1">
//                {[{id:'send', icon:Send, label:'Corporate Payments'}, {id:'swap', icon:ArrowRightLeft, label:'Swap'}, {id:'assets', icon:ShieldPlus, label:'Manage Assets'}].map(t => (
//                  <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`flex items-center gap-2 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab===t.id?'border-blue-500 text-blue-400':'border-transparent text-slate-500 hover:text-slate-300'}`}>
//                    <t.icon className="w-4 h-4"/> {t.label}
//                  </button>
//                ))}
//             </div>

//             <Card className="min-h-[450px] shadow-2xl">
//                {/* ASSET DIRECTORY */}
//                {activeTab === 'assets' && (
//                  <div className="space-y-8 animate-in fade-in duration-300">
//                     <div className="space-y-4">
//                        <Label>Explore Public Ledger Assets</Label>
//                        <div className="relative"><Input placeholder="Search verified tokens (USDC, BTC)..." value={searchQuery} onChange={e=>handleSearch(e.target.value)} className="pl-12 left-10 bg-slate-900 border-slate-800 outline-none focus:border-blue-500"/>{isSearching && <Loader2 className="absolute right-4 top-3.5 w-5 h-5 animate-spin text-blue-500"/>}</div>
//                        {searchResults.length > 0 && <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">{searchResults.map((a, i)=>(<div key={i} className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-blue-900/20 text-blue-400 rounded-xl flex items-center justify-center font-bold">{a.code[0]}</div><div><p className="font-bold text-sm text-white">{a.code}</p><p className="text-[10px] text-slate-500 italic">{a.domain}</p></div></div><Button onClick={()=>handleAddAsset(a.code, a.issuer)} variant="secondary" className="text-[10px] h-8 px-4">Add Trustline</Button></div>))}</div>}
//                     </div>
//                     <div className="pt-6 border-t border-slate-800/50">
//                        <Label>Manual Account Bridge</Label>
//                        <div className="flex gap-3 mt-2"><Input placeholder="Asset Code" value={manualAssetForm.code} onChange={e=>setManualAssetForm({...manualAssetForm, code:e.target.value.toUpperCase()})} className="h-11 text-xs w-24 bg-slate-900 border-slate-800"/><Input placeholder="Issuer Public Identity" value={manualAssetForm.issuer} onChange={e=>setManualAssetForm({...manualAssetForm, issuer:e.target.value})} className="h-11 text-xs flex-1 bg-slate-900 border-slate-800"/><Button onClick={()=>handleAddAsset(manualAssetForm.code, manualAssetForm.issuer)} disabled={!manualAssetForm.code || !manualAssetForm.issuer} className="h-11 px-5 shadow-lg"><Plus className="w-4 h-4"/></Button></div>
//                     </div>
//                  </div>
//                )}

//                {/* B2B PAYMENTS */}
//                {/* B2B PAYMENTS TAB */}
//               {activeTab === 'send' && (
//                 <div className="space-y-8 animate-in fade-in duration-300">
//                   {/* Mode Toggle */}
//                   <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
//                     <button 
//                       onClick={() => setPaymentMode('DIRECT')} 
//                       className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${paymentMode === 'DIRECT' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
//                     >
//                       <Send className="w-3 h-3"/> Direct Payment
//                     </button>
//                     <button 
//                       onClick={() => setPaymentMode('FX')} 
//                       className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${paymentMode === 'FX' ? 'bg-purple-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
//                     >
//                       <ArrowRightLeft className="w-3 h-3"/> Cross Assets Payments
//                     </button>
//                   </div>

//                   <div className="space-y-6">
//                     {/* SECTION: RECIPIENT */}
//                     <div className="space-y-2">
//                       <Label>Recipient Address</Label>
//                       <div className="relative">
//                         <Input 
//                           value={sendForm.to} 
//                           onChange={e => setSendForm({ ...sendForm, to: e.target.value })} 
//                           placeholder="Enter the recipient's wallet address" 
//                           className={`pl-10 ${paymentMode === 'FX' ? 'border-purple-500/30' : 'border-blue-500/30'}`}
//                         />

//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-slate-950/50 rounded-3xl border border-slate-800">
//                       {/* SOURCE ASSET */}
//                       <div className="space-y-2">
//                         <Label>Asset to Debit From</Label>
//                         <select 
//                           className="w-full h-12 bg-slate-900 border border-slate-800 rounded-xl px-4 text-xs text-white appearance-none cursor-pointer focus:border-blue-500" 
//                           value={sendForm.sourceIndex} 
//                           onChange={e => setSendForm({ ...sendForm, sourceIndex: parseInt(e.target.value) })}
//                         >
//                           {balances.map((b, i) => (
//                             <option key={i} value={i}>{b.asset.split(':')[0]} (Avail: {parseFloat(b.spendable || b.balance).toFixed(7)})</option>
//                           ))}
//                         </select>
//                       </div>

//                       {/* AMOUNT FIELD - Label changes based on mode */}
//                       <div className="space-y-2">
//                         <Label>
//                           {paymentMode === 'DIRECT' ? 'Amount to Send' : 'Amount Recipient Receives'}
//                         </Label>
//                         <div className="relative">
//                           <Input 
//                             type="number" 
//                             value={sendForm.amount} 
//                             onChange={e => setSendForm({ ...sendForm, amount: e.target.value })} 
//                             placeholder="0.00" 
//                             className="text-lg font-bold"
//                           />
//                           {/* <div className="absolute right-4 top-3 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
//                             {paymentMode === 'DIRECT' ? balances[sendForm.sourceIndex]?.asset.split(':')[0] : sendForm.destCode}
//                           </div> */}
//                         </div>
//                       </div>
//                     </div>

//                     {/* FX EXCLUSIVE SECTION */}
//                     {paymentMode === 'FX' && (
//                       <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
//                         <div className="p-6 bg-purple-900/10 border border-purple-500/20 rounded-3xl space-y-4 shadow-inner">
//                           <div className="flex items-center gap-2 text-purple-400 font-black text-[10px] uppercase tracking-widest">
//                             <TrendingUp className="w-3 h-3"/> DEX Conversion Route
//                           </div>
                          
//                           <div className="grid grid-cols-3 gap-3">
//                             <div className="space-y-1">
//                               <Label>Target Asset</Label>
//                               <Input 
//                                 value={sendForm.destCode} 
//                                 onChange={e => setSendForm({ ...sendForm, destCode: e.target.value.toUpperCase() })} 
//                                 placeholder="USDC" 
//                                 className="bg-slate-950 border-purple-900/50"
//                               />
//                             </div>
//                             <div className="col-span-2 space-y-1">
//                               <Label>Target Issuer ID</Label>
//                               <Input 
//                                 value={sendForm.destIssuer} 
//                                 onChange={e => setSendForm({ ...sendForm, destIssuer: e.target.value })} 
//                                 placeholder="Issuer G..." 
//                                 className="bg-slate-950 border-purple-900/50 text-[10px]"
//                               />
//                             </div>
//                           </div>

//                           {estimatedCost && (
//                             <div className="bg-purple-600/20 border border-purple-500/30 p-4 rounded-2xl flex items-center justify-between">
//                               <div className="flex items-center gap-2">
//                                 <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
//                                 <span className="text-[10px] font-black text-purple-200 uppercase tracking-tighter">Live Treasury Impact:</span>
//                               </div>
//                               <span className="text-sm font-mono font-black text-white">
//                                 -{parseFloat(estimatedCost).toFixed(4)} {balances[sendForm.sourceIndex]?.asset.split(':')[0]}
//                               </span>
//                             </div>
//                           )}
//                         </div>
//                         <p className="text-[10px] text-slate-500 text-center italic">The Stellar network will find the cheapest path between your assets automatically.</p>
//                       </div>
//                     )}
//                   </div>

//                   <Button 
//                     onClick={handleTransfer} 
//                     disabled={loading || !sendForm.amount || !sendForm.to} 
//                     className={`w-full h-16 text-sm font-black uppercase tracking-[0.2em] shadow-2xl transition-all ${paymentMode === 'FX' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'}`}
//                   >
//                     {loading ? (
//                       <Loader2 className="animate-spin w-5 h-5" />
//                     ) : (
//                       <>{paymentMode === 'DIRECT' ? 'Transfer' : 'Authorize Cross-Border Clearing'}</>
//                     )}
//                   </Button>
//                 </div>
//               )}
          

//                {/* TREASURY REBALANCE */}
//                {activeTab === 'swap' && (
//                  <div className="space-y-6 py-4 max-w-lg mx-auto animate-in zoom-in-95">
//                     <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
//                       <Label>Withdraw (Give)</Label>
//                       <div className="flex gap-4">
//                         <select className="w-1/2 h-12 bg-slate-900 border border-slate-800 rounded-xl px-4 text-xs text-white" value={swapForm.sendAssetIndex} onChange={e=>setSwapForm({...swapForm, sendAssetIndex: parseInt(e.target.value)})}>
//                            {balances.map((b, i)=>(<option key={i} value={i}>{b.asset.split(':')[0]}</option>))}
//                         </select>
//                         <Input type="number" value={swapForm.amount} onChange={e=>setSwapForm({...swapForm, amount:e.target.value})} placeholder="0.00" className="w-1/2 font-mono text-xl"/>
//                       </div>
//                     </div>
//                     <div className="flex justify-center -my-4 relative z-10"><div className="bg-slate-800 p-3 rounded-full border-4 border-slate-950 text-blue-400"><ArrowDown className="w-5 h-5"/></div></div>
//                     <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
//                       <Label>Deposit (Receive)</Label>
//                       <select className="w-full h-12 bg-slate-900 border border-slate-800 rounded-xl px-4 text-xs text-white" value={swapForm.destAssetIndex} onChange={e=>setSwapForm({...swapForm, destAssetIndex: parseInt(e.target.value)})}>
//                         {balances.map((b, i)=>(<option key={i} value={i}>{b.asset.split(':')[0]}</option>))}
//                       </select>
//                     </div>
//                     <Button onClick={handleSwap} disabled={loading} className="w-full h-14 text-sm font-black uppercase tracking-[0.2em] shadow-2xl">execute Swap</Button>
//                  </div>
//                )}
//             </Card>
//           </div>

//           <div className="lg:col-span-1 space-y-6">
//              {/* MONITOR */}
//              <section className="bg-black/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
//                 <div className="bg-slate-800/50 px-5 py-3 border-b border-slate-800"><div className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500 animate-pulse"/><span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Network Monitor</span></div></div>
//                 <div className="p-5 space-y-2.5 h-44 overflow-hidden flex flex-col-reverse custom-scrollbar shadow-inner">
//                   {logs.map((log, i)=>(<p key={i} className="text-[10px] font-mono text-emerald-500 opacity-80 leading-relaxed pl-3 border-l border-emerald-900/40">{log}</p>))}
//                 </div>
//              </section>

//              {/* AUDIT TRAIL */}
//            <section className="space-y-5">
//             <div className="flex justify-between items-center px-1">
//               <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
//                 <History className="w-4 h-4 text-blue-500"/> Recent Transactions
//               </h3>
//               <Button variant="ghost" onClick={() => refreshData(wallet.publicKey)} className="h-8 !px-2 hover:bg-slate-800">
//                 <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
//               </Button>
//             </div>

//             <div className="space-y-4 h-[350px] overflow-y-auto pr-1 custom-scrollbar">
//               {txs.map((tx, i) => (
//                 <div 
//                   key={i} 
//                   className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-[11px] hover:border-slate-700 hover:bg-slate-900/80 transition-all cursor-pointer group shadow-sm" 
//                   onClick={() => handleViewAudit(tx.hash)}
//                 >
//                   <div className="flex justify-between items-start mb-2">
//                     {/* TECHNICAL HASH ONLY */}
//                     <span className="text-blue-400 font-mono font-bold group-hover:text-blue-300 transition-colors flex items-center gap-1">
//                       <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"/>
//                       #{tx.hash.substring(0, 12)}...
//                     </span>
//                     <span className="text-slate-600 font-bold tabular-nums">
//                       {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </span>
//                   </div>

//                   {/* MEMO - Displayed as a raw technical string, no labels like "Company" */}
//                   {/* {tx.memo && (
//                     <div className="p-3 bg-black/40 rounded-xl text-slate-500 italic border-l-2 border-slate-700 leading-snug font-mono text-[9px]">
//                       {tx.memo}
//                     </div>
//                   )} */}
//                 </div>
//               ))}

//               {txs.length === 0 && (
//                 <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800 text-slate-700 text-[10px] font-bold uppercase">
//                   No Ledger History
//                 </div>
//               )}
//             </div>
//           </section>
   
//           {/* TRANSACTION AUDIT SUMMARY POPUP */}
//           {/* TRANSACTION AUDIT SUMMARY POPUP */}
//         {selectedTx && (
//           <div 
//             className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300"
//             onClick={() => setSelectedTx(null)}
//           >
//             <Card 
//               className="max-w-md w-full border-blue-500/20 shadow-2xl relative flex flex-col max-h-[90vh]" 
//               /* max-h-[90vh] ensures it never goes off-screen vertically */
//               onClick={(e: any) => e.stopPropagation()}
//             >
//               {/* 1. FIXED HEADER */}
//               <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4 flex-shrink-0">
//                 <div>
//                   <h2 className="text-xl font-bold text-white tracking-tight">Transaction Audit</h2>
//                   <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Verified Ghazanfar Bank Node</p>
//                 </div>
//                 <button 
//                   onClick={() => setSelectedTx(null)} 
//                   className="text-slate-500 hover:text-white p-2 transition-colors"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               {/* 2. SCROLLABLE CONTENT AREA */}
//               <div className="overflow-y-auto pr-2 custom-scrollbar space-y-6 flex-grow">
//                 {/* Settlement Type Badge */}
//                 <div className="flex justify-center">
//                   <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-[0.2em] border ${
//                     selectedTx.type.includes('path') 
//                       ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' 
//                       : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
//                   }`}>
//                     {selectedTx.type.includes('path') ? 'FX CONVERSION / SWAP' : 'DIRECT DISBURSEMENT'}
//                   </span>
//                 </div>

//                 {/* Amount Section */}
//                 <div className="text-center py-4 bg-slate-950/50 rounded-2xl border border-slate-800">
//                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1"> Amount</p>
//                   <div className="text-2xl font-mono font-bold text-white">
//                     {parseFloat(selectedTx.amount).toFixed(7)} <span className="text-blue-500 text-lg">{selectedTx.asset}</span>
//                   </div>
//                   <div className="mt-2 flex items-center justify-center gap-2">
//                     {selectedTx.successful ? 
//                       <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">SUCCESSFUL</span> :
//                       <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-0.5 rounded-full border border-red-500/20 font-bold">REJECTED</span>
//                     }
//                   </div>
//                 </div>

//                 {/* Technical Breakdown */}
//                 <div className="space-y-3 font-mono text-[11px]">
//                   <div className="flex justify-between py-2 border-b border-slate-800/50">
//                     <span className="text-slate-500 uppercase">Settlement Date</span>
//                     <span className="text-slate-300">{new Date(selectedTx.created_at).toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between py-2 border-b border-slate-800/50">
//                     <span className="text-slate-500 uppercase">Network Fee</span>
//                     <span className="text-amber-500 font-bold">
//                       {(parseInt(selectedTx.fee) / 10000000).toFixed(7)} XLM
//                     </span>
//                   </div>
//                   <div className="flex flex-col py-2 border-b border-slate-800/50 gap-1">
//                     <span className="text-slate-500 uppercase">Sender Address</span>
//                     <span className="text-slate-400 break-all leading-relaxed">{selectedTx.from}</span>
//                   </div>
//                   <div className="flex flex-col py-2 border-b border-slate-800/50 gap-1">
//                     <span className="text-slate-500 uppercase">Receipent Address</span>
//                     <span className="text-slate-400 break-all leading-relaxed">{selectedTx.to}</span>
//                   </div>
//                 </div>

//                 <div className="bg-black/40 p-3 rounded-xl border border-slate-800">
//                   <p className="text-[9px] text-slate-600 uppercase font-bold mb-2">Audit Hash (Ledger Proof)</p>
//                   <p 
//                     className="text-[10px] font-mono text-blue-500 break-all leading-tight cursor-pointer hover:text-blue-400 hover:underline transition-all"
//                     /* Updated to use selectedTx.hash and properly formatted onClick */
//                     onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${selectedTx.hash}`, '_blank')}
//                   >
//                     {selectedTx.hash}
//                   </p>
//                 </div>
//               </div>

//               {/* 3. FIXED FOOTER ACTIONS */}
//               <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-slate-800 flex-shrink-0">
//                 <Button onClick={() => window.print()} variant="primary" className="w-full h-12 gap-2">
//                   <Download className="w-4 h-4" /> Download Statement
//                 </Button>
//                 {/* <Button onClick={() => setSelectedTx(null)} variant="secondary" className="w-full h-10 text-[10px] uppercase font-black tracking-widest border border-slate-800">
//                   Dismiss Audit
//                 </Button> */}
//               </div>
//             </Card>
//           </div>
//         )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { Loader2, LogOut, X, Download, Copy, ShieldAlert, KeyRound } from "lucide-react";
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

  // C. KYC Pending Redirect
  if (userRole === 'KYC_REQUIRED' || kycStatus === 'KYC_PENDING') {
    return (
      <KYCIdentityHub onComplete={() => {
        localStorage.setItem("gb_kyc_status", "DOCUMENTS_UPLOADED");
        setKycStatus("DOCUMENTS_UPLOADED");
        window.location.reload();
      }} />
    );
  }

  // D. Authorization Lock: Passphrase for Admin OR Restricted Review
  if (!wallet) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
      
      {/* REVIEW OVERLAY: For Submitted but Unapproved Beneficiaries */}
      {kycStatus === 'DOCUMENTS_UPLOADED' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-700">
           <Card className="max-w-md w-full border-blue-500/20 bg-slate-900/80 p-10 text-center shadow-2xl mx-4">
              <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Verification in Progress</h2>
              <p className="text-slate-400 text-[11px] font-medium leading-relaxed mb-8 px-4 italic">
                Identification scans have been submitted to Ghazanfar Bank Compliance. Treasury services remain locked until account activation.
              </p>
              <div className="py-3 px-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Est. Activation: 24-48 Hours</p>
              </div>
              <Button variant="danger" onClick={() => { localStorage.clear(); window.location.reload(); }} className="mt-8 w-full h-12 bg-red-950/20 border-red-500/20 text-red-500 uppercase text-[10px] font-black">Abandon Session</Button>
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

  // E. Final Authorized Layout (Dashboard)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
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
              <span className="text-[9px] text-white-600 font-bold uppercase tracking-tighter">Wallet ID:</span>
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