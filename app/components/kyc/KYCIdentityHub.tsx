"use client";
import React, { useState } from "react";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Upload, ChevronRight, Loader2, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = "dbhkzpzzk";
const CLOUDINARY_UPLOAD_PRESET = "Cloudinary";

export default function KYCIdentityHub({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [primaryType, setPrimaryType] = useState("");
  const [secondaryType, setSecondaryType] = useState("");
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [secondaryFile, setSecondaryFile] = useState<File | null>(null);

  // Helper to upload files to Cloudinary
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!response.ok) throw new Error("Cloudinary upload failed");
    const data = await response.json();
    return data.secure_url;
  };

  const handleUpload = async () => {
    if (!primaryType || !secondaryType || !primaryFile || !secondaryFile) {
      alert("Please select document names and upload files for both proofs.");
      return;
    }

    setLoading(true);
    const userId = localStorage.getItem("gb_user_id");

    try {
      // 1. Concurrent Cloudinary Uploads
      const [primaryUrl, secondaryUrl] = await Promise.all([
        uploadToCloudinary(primaryFile),
        uploadToCloudinary(secondaryFile)
      ]);

      const documents = [
        { type: primaryType, url: primaryUrl },
        { type: secondaryType, url: secondaryUrl }
      ];

      // 2. Update Database via Django API
      const response = await fetch(`http://127.0.0.1:8000/api/upload-kyc/${userId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(documents),
      });

      if (response.ok) {
        // 3. SUCCESS: Set the specific status that triggers the Dashboard Lock
        localStorage.setItem("gb_kyc_status", "DOCUMENTS_UPLOADED");
        
        // 4. Call parent callback to trigger the immediate Dashboard view re-render
        onComplete(); 

        // 5. Fallback: Force a hard refresh to the root if the parent fails to re-render
        setTimeout(() => {
          window.location.href = "/"; 
        }, 1000);
      } else {
        const data = await response.json();
        alert(data.message || "Database update failed");
      }
    } catch (err) {
      alert("Verification failed. Check your network or Cloudinary settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
        
        {/* Sidebar: Compliance Information */}
        <div className="md:col-span-4 bg-slate-900/40 p-8 flex flex-col justify-between border-r border-slate-800">
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                <img src="/logo.png" className="w-7" alt="GB" />
              </div>
              <div className="leading-none">
                <h1 className="text-lg font-black text-white tracking-tighter uppercase">Ghazanfar Bank</h1>
                <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Compliance Node</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]" />
                  Verification Required
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                  Your account is currently in KYC Pending status. Please provide the required identification documents to unlock corporate payment services.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                  Review Process
                </h3>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">
                  After you upload your documents, our team will check them to make sure everything is correct. As soon as they are approved, your account will be activated automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-8 bg-slate-950 p-8">
          <Card className="bg-transparent border-none shadow-none space-y-8">
            <header className="space-y-1">
              <p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.3em]">
                KYC Verification
              </p>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">
                Verify Your Identity
              </h2>
              <CardDescription className="text-slate-400 text-xs mt-2 leading-relaxed">
                Please upload your ID documents to finish setting up your profile. 
                This helps us protect your funds and unlock all payment features.
              </CardDescription>
            </header>

            <CardContent className="p-0 space-y-6">
              {/* Primary Document */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <LabelItem label="Primary Identity Proof Name" required />
                  <Select onValueChange={setPrimaryType}>
                    <SelectTrigger className="h-11 bg-slate-900 border-slate-800 rounded text-slate-300 text-xs">
                      <SelectValue placeholder="Select ID Name" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                      <SelectItem value="Tazkira">Tazkira (National ID)</SelectItem>
                      <SelectItem value="Passport">Passport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                   <input type="file" className="hidden" id="primary-file" onChange={(e) => setPrimaryFile(e.target.files?.[0] || null)} />
                   <label htmlFor="primary-file" className="flex items-center justify-center h-11 border border-dashed border-slate-800 rounded bg-slate-900/50 cursor-pointer hover:border-blue-500/50 transition-colors">
                     {primaryFile ? <span className="text-[10px] text-emerald-500 flex items-center gap-2 font-bold"><FileCheck size={14}/> {primaryFile.name.substring(0, 15)}...</span> : <span className="text-[10px] text-slate-500 flex items-center gap-2"><Upload size={14}/> Upload ID Scan</span>}
                   </label>
                </div>
              </div>

              {/* Secondary Document */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <LabelItem label="Secondary Verification Name" required />
                  <Select onValueChange={setSecondaryType}>
                    <SelectTrigger className="h-11 bg-slate-900 border-slate-800 rounded text-slate-300 text-xs">
                      <SelectValue placeholder="Select Document Name" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                      <SelectItem value="Utility_Bill">Utility Bill</SelectItem>
                      <SelectItem value="Village_Letter">Village Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                   <input type="file" className="hidden" id="secondary-file" onChange={(e) => setSecondaryFile(e.target.files?.[0] || null)} />
                   <label htmlFor="secondary-file" className="flex items-center justify-center h-11 border border-dashed border-slate-800 rounded bg-slate-900/50 cursor-pointer hover:border-blue-500/50 transition-colors">
                     {secondaryFile ? <span className="text-[10px] text-emerald-500 flex items-center gap-2 font-bold"><FileCheck size={14}/> {secondaryFile.name.substring(0, 15)}...</span> : <span className="text-[10px] text-slate-500 flex items-center gap-2"><Upload size={14}/> Upload Proof Scan</span>}
                   </label>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] rounded text-xs transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Finalize & Submit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LabelItem({ label, required = false }: { label: string, required?: boolean }) {
  return (
    <div className="flex items-center gap-1 px-1">
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </span>
      {required && (
        <span className="text-[10px] font-bold text-red-500 leading-none">*</span>
      )}
    </div>
  );
}