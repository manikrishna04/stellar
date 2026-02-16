
// "use client";
// import React, { useState, useEffect } from "react";
// import { 
//   Card, CardContent, CardDescription, CardHeader, CardTitle 
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ExternalLink, User, Mail, Phone, Calendar, ArrowLeft, CheckCircle2, Copy, Briefcase } from "lucide-react";
// import { cn } from "@/lib/utils";

// /** * Centralized Status Theme Configuration
//  * Maps backend status strings to institutional branding colors.
//  */
// const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; icon?: boolean }> = {
//   // Fully Verified & Functional
//   ACTIVE: { 
//     bg: "bg-emerald-500/10", 
//     text: "text-emerald-500", 
//     border: "border-emerald-500/20",
//     icon: true 
//   },
//   // Document submitted, waiting for Bank Admin
//   DOCUMENTS_UPLOADED: { 
//     bg: "bg-purple-500/10", 
//     text: "text-purple-400", 
//     border: "border-purple-500/20" 
//   },
//   // User created but no KYC started
//   KYC_PENDING: { 
//     bg: "bg-amber-500/10", 
//     text: "text-amber-500", 
//     border: "border-amber-500/20" 
//   },
//   // Compliance Block
//   LOCKED: { 
//     bg: "bg-red-500/10", 
//     text: "text-red-500", 
//     border: "border-red-500/20" 
//   }
// };

// export default function ManagedEntities() {
//   const [accounts, setAccounts] = useState([]);
//   const [selectedUser, setSelectedUser] = useState<any>(null);

//   useEffect(() => {
//     fetch("http://127.0.0.1:8000/api/users/")
//       .then(res => res.json())
//       .then(data => setAccounts(data));
//   }, []);

//   // --- DETAILED PROFILE VIEW ---
//   if (selectedUser) {
//     const style = STATUS_STYLES[selectedUser.status] || { bg: "bg-slate-800", text: "text-slate-400", border: "border-slate-700" };
    
//     return (
//       <div className="animate-in fade-in slide-in-from-right-4 duration-500">
//         <Button 
//           variant="ghost" 
//           onClick={() => setSelectedUser(null)}
//           className="mb-6 text-slate-400 "
//         >
//           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Entities
//         </Button>

//         <Card className="bg-slate-900/50 border-slate-800 text-white max-w-4xl shadow-2xl overflow-hidden mx-auto">
//           <CardHeader className="border-b border-slate-800 pb-6">
//             <div className="flex justify-between items-start">
//               <div>
//                 <CardTitle className="text-3xl font-black uppercase tracking-tighter">
//                   {selectedUser.first_name} {selectedUser.last_name}
//                 </CardTitle>
//                 <CardDescription className="text-slate-500 font-mono text-xs mt-1">
//                   ID: {selectedUser.user_id}
//                 </CardDescription>
//               </div>
              
//               {/* Institutional Badge Design */}
//               <div className={cn(
//                 "flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
//                 style.bg, style.text, style.border
//               )}>
//                 {style.icon && (
//                   <div className="w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
//                     <CheckCircle2 className="w-2.5 h-2.5 text-slate-950" strokeWidth={4} />
//                   </div>
//                 )}
//                 {selectedUser.status.replace('_', ' ')}
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
//             <div className="space-y-6">
//               <DetailItem icon={<Mail />} label="Email Address" value={selectedUser.email} />
//               <DetailItem icon={<Phone />} label="Phone Number" value={selectedUser.phone_number} />
//             </div>
//             <div className="space-y-6">
//               <DetailItem icon={<Calendar />} label="Date of Birth" value={selectedUser.dob} />
//               <DetailItem icon={<User />} label="User type" value={selectedUser.user_type} />
//             </div>
//             <div className="pt-6 border-t border-slate-800">
//                 <div className="flex gap-4">
//                     {/* Icon Container */}
//                     <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-500 
//                     group-hover:border-blue-500/50 group-hover:text-blue-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] 
//                     transition-all duration-300 shadow-inner h-fit flex-shrink-0">
//                     <Briefcase size={16} />
//                     </div>

//                     {/* Content Container */}
//                     <div className="flex-1 min-w-0">
//                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-2">
//                         Public Wallet Address
//                     </p>
                    
//                     <div className="flex items-center gap-3">
//                         {/* The address field now takes full width without scroll */}
//                         <p className="text-[13px] font-mono font-bold text-emerald-500 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10 shadow-inner whitespace-nowrap flex-1">
//                         {selectedUser.wallet_address || "G... (Not Generated)"}
//                         </p>
                        
//                         {selectedUser.wallet_address && (
//                         <button 
//                             onClick={() => {
//                             navigator.clipboard.writeText(selectedUser.wallet_address);
//                             // Implementation of a silent copy or toast is recommended here
//                             }} 
//                             className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-500 hover:text-blue-400 hover:border-blue-500/50 transition-all shadow-lg active:scale-90 flex-shrink-0"
//                             title="Copy Address"
//                         >
//                             <Copy className="w-4 h-4" />
//                         </button>
//                         )}
//                     </div>
//                     </div>
//                 </div>
//                 </div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   // --- STANDARD TABLE VIEW ---
//   return (
//     <Card className="bg-transparent border-slate-800 overflow-hidden shadow-lg">
//       <table className="w-full text-left">
//         <thead className="bg-slate-950/50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-800">
//           <tr>
//             <th className="p-6">Entity / User ID</th>
//             <th className="p-6">Type</th>
//             <th className="p-6">Status</th>
//             <th className="p-6 text-right">Action</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-slate-800/50">
//           {accounts.map((acc: any) => {
//             const style = STATUS_STYLES[acc.status] || { bg: "bg-slate-800", text: "text-slate-400", border: "border-slate-700" };
            
//             return (
//               <tr key={acc.user_id} className="hover:bg-slate-900/30 transition-colors">
//                 <td className="p-6">
//                   <div className="text-sm font-bold text-white uppercase tracking-tight">
//                     {acc.first_name} {acc.last_name}
//                   </div>
//                   <div className="text-[10px] text-slate-600 font-mono mt-0.5">{acc.user_id}</div>
//                 </td>
//                 <td className="p-6 text-[10px] font-black uppercase">
//                   <span className="bg-slate-800/50 px-3 py-1 rounded text-slate-400 border border-slate-700 tracking-tighter">
//                     {acc.user_type}
//                   </span>
//                 </td>
//                 <td className="p-6">
//                   {/* Dynamic Status Pill */}
//                   <span className={cn(
//                     "px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest",
//                     style.bg, style.text, style.border
//                   )}>
//                     {acc.status.replace('_', ' ')}
//                   </span>
//                 </td>
//                 <td className="p-6 text-right">
//                   <Button 
//                     onClick={() => setSelectedUser(acc)}
//                     className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-4 gap-2 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-800 transition-all hover:border-blue-500/50 shadow-inner"
//                   >
//                     <ExternalLink className="h-3 w-3" /> View Profile
//                   </Button>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </Card>
//   );
// }

// function DetailItem({ icon, label, value }: { icon: any, label: string, value: string }) {
//   return (
//     <div className="flex gap-4 group">
//       <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-500 group-hover:text-blue-500 transition-colors shadow-inner">
//         {React.cloneElement(icon, { size: 16 })}
//       </div>
//       <div>
//         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
//         <p className="text-sm font-bold text-white mt-0.5 truncate max-w-[200px]">{value || "N/A"}</p>
//       </div>
//     </div>
//   );
// }
"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ExternalLink, User, Mail, Phone, Calendar, 
  ArrowLeft, CheckCircle2, Copy, Briefcase, Search, Shield 
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; icon?: boolean }> = {
  ACTIVE: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", icon: true },
  DOCUMENTS_UPLOADED: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  KYC_PENDING: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  LOCKED: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" }
};

export default function ManagedEntities() {
  const [accounts, setAccounts] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/users/")
      .then(res => res.json())
      .then(data => setAccounts(data));
  }, []);

  const filteredAccounts = accounts.filter((acc: any) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      `${acc.first_name} ${acc.last_name}`.toLowerCase().includes(searchStr) ||
      acc.user_id.toString().includes(searchStr) ||
      (acc.wallet_address && acc.wallet_address.toLowerCase().includes(searchStr))
    );
  });

  // --- DETAILED PROFILE VIEW (FULL WIDTH) ---
  if (selectedUser) {
    const style = STATUS_STYLES[selectedUser.status] || { bg: "bg-slate-800", text: "text-slate-400", border: "border-slate-700" };
    
    return (
      <div className="animate-in fade-in zoom-in-95 duration-300 h-full">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
          <Button variant="ghost" onClick={() => setSelectedUser(null)} className="h-8 text-[10px] font-black uppercase text-slate-500  gap-2">
            <ArrowLeft className="w-3 h-3" /> Back to Registry
          </Button>
          {/* <div className="flex gap-2">
            <Button className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black uppercase tracking-widest px-4 rounded-lg">Update Permissions</Button>
          </div> */}
        </div>

        <Card className="bg-slate-950/40 border-slate-800 text-white shadow-2xl rounded-2xl overflow-hidden border-t-blue-500/50">
          <CardHeader className="p-6 bg-slate-900/20 border-b border-slate-800/50">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black uppercase tracking-tighter">
                  {selectedUser.first_name} {selectedUser.last_name}
                </CardTitle>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-600 font-mono">UID: {selectedUser.user_id}</span>
                    <span className="h-3 w-px bg-slate-800" />
                    <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{selectedUser.user_type}</span>
                </div>
              </div>
              <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest", style.bg, style.text, style.border)}>
                {style.icon && <CheckCircle2 className="w-3 h-3" strokeWidth={4} />}
                {selectedUser.status.replace('_', ' ')}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <DetailItem icon={<Mail />} label="Email Address" value={selectedUser.email} />
              <DetailItem icon={<Phone />} label="Mobile Number" value={selectedUser.phone_number} />
              <DetailItem icon={<Calendar />} label="Date Registered" value={selectedUser.dob} />
              <DetailItem icon={<User />} label="USer Type" value="Beneficiary" />
            </div>
            
            <div className="pt-6 border-t border-slate-800 group">
                <div className="flex gap-4">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-500 group-hover:text-blue-500 group-hover:border-blue-500/50 transition-all shadow-inner h-fit">
                        <Briefcase size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">Wallet Address</p>
                        <div className="flex items-center gap-2">
                            <p className="text-[13px] font-mono font-bold text-emerald-500 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10 shadow-inner flex-1 truncate">
                                {selectedUser.wallet_address || "NOT GENERATED YET"}
                            </p>
                            {selectedUser.wallet_address && (
                                <button onClick={() => navigator.clipboard.writeText(selectedUser.wallet_address)} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-500 hover:text-white transition-all active:scale-95 shadow-lg flex-shrink-0">
                                    <Copy className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- COMPACT REGISTRY VIEW ---
  return (
    <div className="space-y-4 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/50 pb-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" /> Managed Entities
          </h1>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Institutional User Directory</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
          <Input 
            placeholder="SEARCH BY UID/NAME..." 
            className="h-9 pl-9 bg-slate-900/50 border-slate-800 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-slate-700 focus:border-blue-500/50 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-slate-950/20 border-slate-800 overflow-hidden shadow-2xl rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/80 text-slate-500 text-[9px] uppercase font-black tracking-widest border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4">Classification</th>
                <th className="px-6 py-4">Vault Status</th>
                <th className="px-6 py-4 text-right">Ledger Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {filteredAccounts.map((acc: any) => {
                const style = STATUS_STYLES[acc.status] || { bg: "bg-slate-800", text: "text-slate-400", border: "border-slate-700" };
                return (
                  <tr 
                    key={acc.user_id} 
                    onClick={() => setSelectedUser(acc)}
                    className="hover:bg-blue-600/5 transition-all group/row cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-black text-white uppercase tracking-tight group-hover/row:text-blue-400 transition-colors">
                        {acc.first_name} {acc.last_name}
                      </div>
                      <div className="text-[9px] text-slate-600 font-mono uppercase tracking-tighter">UID: {acc.user_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-900/80 px-2 py-0.5 rounded text-[9px] font-black text-slate-500 border border-slate-800 uppercase tracking-tighter">
                        {acc.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-3 py-1 rounded-full text-[8px] font-black uppercase border tracking-widest", style.bg, style.text, style.border)}>
                        {acc.status.replace('_', ' ')}
                      </span>
                    </td>
                     <td className="p-6 text-right">
                        <Button 
                            onClick={() => setSelectedUser(acc)}
                            className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-4 gap-2 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-800 transition-all hover:border-blue-500/50 shadow-inner"
                        >
                            <ExternalLink className="h-3 w-3" /> View Profile
                        </Button>
                        </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="text-slate-600">{React.cloneElement(icon, { size: 12 })}</div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{label}</p>
      </div>
      <p className="text-[13px] font-bold text-white uppercase tracking-tight truncate">{value || "---"}</p>
    </div>
  );
}