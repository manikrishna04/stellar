"use client";

import React, { useEffect, useState } from "react";
import { Card, Button } from "@/app/ui-helpers";
import {
  ExternalLink,
  Loader2,
  ShieldCheck,
  Eye,
  ZoomIn,
  ZoomOut,
  X,
  RotateCcw,
  CheckCircle,
  XCircle
} from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { createWallet } from "../lib/phraseWallet";

export default function KYCApprovalScreen() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/");
      const data = await response.json();
      const filtered = data.filter((u: any) => u.status === "DOCUMENTS_UPLOADED");
      setPendingUsers(filtered);
    } catch (e) {
      console.error("Fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  const approveConfirmed = async (user: any) => {
    setProcessingId(user.user_id);

    try {
      const newWallet = await createWallet();

      const payload = {
        wallet_address: newWallet.publicKey,
        secret_key: newWallet.secretKey,
        passphrase: newWallet.mnemonic
      };

      const response = await fetch(
        `http://127.0.0.1:8000/api/users/${user.user_id}/approve-kyc/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) throw new Error("Approval failed");

      fetchUsers();
      setToast({ type: "success", message: "KYC approved & wallet issued successfully." });

    } catch (e) {
      setToast({ type: "error", message: "Approval failed during wallet issuance." });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-blue-500 w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <header className="flex justify-between items-end border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            Institutional KYC Queue
          </h2>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Review documentation and issue wallet.
          </p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl">
          <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">
            {pendingUsers.length} Pending Reviews
          </p>
        </div>
      </header>

      {/* Content */}
      {pendingUsers.length === 0 ? (
        <Card className="p-20 text-center border-dashed border-slate-800 bg-transparent">
          <ShieldCheck className="w-20 h-20 text-blue-500 mx-auto mb-4" />
          <p className="text-blue-500 font-bold uppercase text-[10px] tracking-widest">
            Compliance Queue Clear
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingUsers.map((user, index) => {
            const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();

            return (
              <Card key={user.user_id} className="border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-all p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-8">

                  {/* User Info */}
                  <div className="flex gap-4 min-w-[260px] items-center">
                    <div className="text-white font-black text-sm w-6 text-center">{index + 1}.</div>
                    <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-400 font-black uppercase">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                        {user.first_name} {user.last_name}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                        UID: {user.user_id}
                      </p>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.documents?.map((doc: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setPreviewDoc(doc)}
                        className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl group hover:border-blue-500/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Eye className="w-4 h-4 text-slate-600 group-hover:text-blue-400" />
                          <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">
                            {doc.type}
                          </span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-700" />
                      </button>
                    ))}
                  </div>

                  {/* Action */}
                  <div className="flex items-center">
                    <Button
                      disabled={processingId === user.user_id}
                      onClick={() => approveConfirmed(user)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[14px] px-10 h-10 rounded-xl shadow-lg shadow-emerald-900/30"
                    >
                      {processingId === user.user_id ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                      ) : (
                        "Approve"
                      )}
                    </Button>
                  </div>

                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/95 p-6">
          <div className="relative bg-slate-950 border border-blue-500 rounded-2xl w-full max-w-7xl h-[88vh] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b border-blue-500">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">
                {previewDoc.type} Preview
              </h3>

              <button
                onClick={() => setPreviewDoc(null)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 border border-blue-400 hover:border-red-500/50 text-slate-400 hover:text-red-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative h-full w-full bg-black flex items-center justify-center">
              <TransformWrapper initialScale={1} minScale={0.5} maxScale={5} centerOnInit wheel={{ step: 0.08 }}>
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <div className="absolute top-4 right-4 z-50 flex gap-2">
                      <button onClick={() => zoomIn()} className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 flex items-center justify-center text-slate-300">
                        <ZoomIn className="w-4 h-4" />
                      </button>

                      <button onClick={() => zoomOut()} className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 flex items-center justify-center text-slate-300">
                        <ZoomOut className="w-4 h-4" />
                      </button>

                      <button onClick={() => resetTransform()} className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-yellow-500/50 flex items-center justify-center text-slate-300">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>

                    <TransformComponent>
                      {(() => {
                        const isImage = /\.(jpg|jpeg|png|webp)$/i.test(previewDoc.url);
                        const isPDF = /\.pdf$/i.test(previewDoc.url);

                        if (isImage) {
                          return (
                            <img
                              src={previewDoc.url}
                              alt={previewDoc.type}
                              className="max-h-[78vh] max-w-full object-contain rounded-xl"
                            />
                          );
                        }

                        if (isPDF) {
                          return (
                            <iframe
                              src={previewDoc.url}
                              className="w-[85vw] h-[78vh] border-0 rounded-xl bg-white"
                              title="PDF Preview"
                            />
                          );
                        }

                        return (
                          <div className="text-slate-400 text-sm">
                            Preview not supported.{" "}
                            <a href={previewDoc.url} target="_blank" className="text-blue-400 underline">
                              Open externally
                            </a>
                          </div>
                        );
                      })()}
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] animate-in slide-in-from-top-4 duration-300">
          <div
            className={`px-8 py-4 rounded-xl border shadow-2xl flex items-center gap-3
              ${toast.type === "success"
                ? "bg-emerald-950 border-emerald-500/40 text-emerald-300"
                : "bg-red-950 border-red-500/40 text-red-300"
              }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm font-semibold tracking-wide">
              {toast.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
