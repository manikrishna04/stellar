"use client";
import React, { useEffect, useState } from "react";
import { Card, Button } from "@/app/ui-helpers";
import { 
  CheckCircle, FileText, ExternalLink, Loader2, 
  ShieldCheck, AlertCircle, Eye 
} from "lucide-react";
import { createWallet } from "../lib/phraseWallet";

export default function KYCApprovalScreen() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/");
      const data = await response.json();
      // Filter only users waiting for review
      const filtered = data.filter((u: any) => u.status === "DOCUMENTS_UPLOADED");
      setPendingUsers(filtered);
    } catch (e) {
      console.error("Fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (user: any) => {
    setProcessingId(user.user_id);
    try {
      // 1. Generate institutional Stellar Wallet
      const newWallet = await createWallet();

      // 2. Prepare payload for ApproveKYCView
      const payload = {
        wallet_address: newWallet.publicKey,
        secret_key: newWallet.secretKey,
        passphrase: newWallet.mnemonic
      };

      // 3. Post to backend
      const response = await fetch(`http://127.0.0.1:8000/api/users/${user.user_id}/approve-kyc/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(`KYC Approved for ${user.first_name}. Wallet issued and funded.`);
        fetchUsers(); // Refresh list
      }
    } catch (e) {
      alert("Approval failed during wallet issuance.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Institutional KYC Queue</h2>
          <p className="text-slate-500 text-xs font-medium mt-1">Review documentation and issue treasury identities.</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{pendingUsers.length} Pending Reviews</p>
        </div>
      </header>

      {pendingUsers.length === 0 ? (
        <Card className="p-20 text-center border-dashed border-slate-800 bg-transparent">
          <ShieldCheck className="w-12 h-12 text-slate-800 mx-auto mb-4" />
          <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">Compliance Queue Clear</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingUsers.map((user) => (
            <Card key={user.user_id} className="border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-all p-6">
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                {/* User Info */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                    <FileText className="text-blue-500 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">{user.first_name} {user.last_name}</h3>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">UID: {user.user_id}</p>
                  </div>
                </div>

                {/* Document Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.documents?.map((doc: any, idx: number) => (
                    <a 
                      key={idx} 
                      href={doc.url} 
                      target="_blank" 
                      className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl group hover:border-blue-500/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Eye className="w-4 h-4 text-slate-600 group-hover:text-blue-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.type || doc.name}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-700" />
                    </a>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center">
                  <Button 
                    disabled={processingId === user.user_id}
                    onClick={() => handleApproveUser(user)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-xl shadow-lg shadow-emerald-900/20"
                  >
                    {processingId === user.user_id ? <Loader2 className="animate-spin" /> : "Approve & Fund Wallet"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}