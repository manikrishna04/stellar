// "use client";
// import React, { useState, useEffect } from "react";

// import { 
//   Card, CardContent, CardDescription, CardHeader, CardTitle 
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ExternalLink, User, Mail, Phone, Calendar, ArrowLeft } from "lucide-react";
// import { cn } from "@/lib/utils";

// export default function ManagedEntities() {
//   const [accounts, setAccounts] = useState([]);
//   const [selectedUser, setSelectedUser] = useState<any>(null);

//   useEffect(() => {
//     fetch("http://127.0.0.1:8000/api/users/")
//       .then(res => res.json())
//       .then(data => setAccounts(data));
//   }, []);

//   // Detailed View Card
//   if (selectedUser) {
//     return (
//       <div className="animate-in fade-in slide-in-from-right-4 duration-500">
//         <Button 
//           variant="ghost" 
//           onClick={() => setSelectedUser(null)}
//           className="mb-6 text-slate-400 "
//         >
//           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Entities
//         </Button>

//         <Card className="bg-slate-900/50 border-slate-800 text-white max-w-2xl">
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
//               <Badge className="bg-amber-600/20 text-amber-500 border-amber-500/20 uppercase font-black px-3 py-1">
//                 {selectedUser.status.replace('_', ' ')}
//               </Badge>
//             </div>
//           </CardHeader>
//           <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
//             <div className="space-y-6">
//               <DetailItem icon={<Mail />} label="Email Address" value={selectedUser.email} />
//               <DetailItem icon={<Phone />} label="Phone Number" value={selectedUser.phone_number} />
//             </div>
//             <div className="space-y-6">
//               <DetailItem icon={<Calendar />} label="Date of Birth" value={selectedUser.dob} />
//               <DetailItem icon={<User />} label="Entity Type" value={selectedUser.user_type} />
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   // Standard Table View
//   return (
//     <Card className="bg-transparent border-slate-800 overflow-hidden">
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
//           {accounts.map((acc: any) => (
//             <tr key={acc.user_id} className="hover:bg-slate-900/30 transition-colors">
//               <td className="p-6">
//                 <div className="text-sm font-bold text-white uppercase">{acc.first_name} {acc.last_name}</div>
//                 <div className="text-[10px] text-slate-600 font-mono mt-0.5">{acc.user_id}</div>
//               </td>
//               <td className="p-6 text-[10px] font-black uppercase">
//                 <span className="bg-slate-800 px-3 py-1 rounded text-slate-400 border border-slate-700">
//                   {acc.user_type}
//                 </span>
//               </td>
//               <td className="p-6 text-[10px] font-black uppercase text-amber-500">
//                 {acc.status.replace('_', ' ')}
//               </td>
//               <td className="p-6 text-right">
//                 <Button 
//                   onClick={() => setSelectedUser(acc)}
//                   className="bg-slate-800 hover:bg-slate-700 text-white h-9 px-4 gap-2 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-700"
//                 >
//                   <ExternalLink className="h-3 w-3" /> View Profile
//                 </Button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </Card>
//   );
// }

// function DetailItem({ icon, label, value }: { icon: any, label: string, value: string }) {
//   return (
//     <div className="flex gap-4">
//       <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-500">
//         {React.cloneElement(icon, { size: 16 })}
//       </div>
//       <div>
//         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
//         <p className="text-sm font-bold text-white mt-0.5">{value}</p>
//       </div>
//     </div>
//   );
// }
"use client";
import React, { useState, useEffect } from "react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, User, Mail, Phone, Calendar, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** * Centralized Status Theme Configuration
 * Maps backend status strings to institutional branding colors.
 */
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; icon?: boolean }> = {
  // Fully Verified & Functional
  ACTIVE: { 
    bg: "bg-emerald-500/10", 
    text: "text-emerald-500", 
    border: "border-emerald-500/20",
    icon: true 
  },
  // Document submitted, waiting for Bank Admin
  DOCUMENTS_UPLOADED: { 
    bg: "bg-purple-500/10", 
    text: "text-purple-400", 
    border: "border-purple-500/20" 
  },
  // User created but no KYC started
  KYC_PENDING: { 
    bg: "bg-amber-500/10", 
    text: "text-amber-500", 
    border: "border-amber-500/20" 
  },
  // Compliance Block
  LOCKED: { 
    bg: "bg-red-500/10", 
    text: "text-red-500", 
    border: "border-red-500/20" 
  }
};

export default function ManagedEntities() {
  const [accounts, setAccounts] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/users/")
      .then(res => res.json())
      .then(data => setAccounts(data));
  }, []);

  // --- DETAILED PROFILE VIEW ---
  if (selectedUser) {
    const style = STATUS_STYLES[selectedUser.status] || { bg: "bg-slate-800", text: "text-slate-400", border: "border-slate-700" };
    
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedUser(null)}
          className="mb-6 text-slate-400 "
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Entities
        </Button>

        <Card className="bg-slate-900/50 border-slate-800 text-white max-w-2xl shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-800 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-black uppercase tracking-tighter">
                  {selectedUser.first_name} {selectedUser.last_name}
                </CardTitle>
                <CardDescription className="text-slate-500 font-mono text-xs mt-1">
                  ID: {selectedUser.user_id}
                </CardDescription>
              </div>
              
              {/* Institutional Badge Design */}
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
                style.bg, style.text, style.border
              )}>
                {style.icon && (
                  <div className="w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-slate-950" strokeWidth={4} />
                  </div>
                )}
                {selectedUser.status.replace('_', ' ')}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <DetailItem icon={<Mail />} label="Email Address" value={selectedUser.email} />
              <DetailItem icon={<Phone />} label="Phone Number" value={selectedUser.phone_number} />
            </div>
            <div className="space-y-6">
              <DetailItem icon={<Calendar />} label="Date of Birth" value={selectedUser.dob} />
              <DetailItem icon={<User />} label="Entity Type" value={selectedUser.user_type} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- STANDARD TABLE VIEW ---
  return (
    <Card className="bg-transparent border-slate-800 overflow-hidden shadow-lg">
      <table className="w-full text-left">
        <thead className="bg-slate-950/50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-800">
          <tr>
            <th className="p-6">Entity / User ID</th>
            <th className="p-6">Type</th>
            <th className="p-6">Status</th>
            <th className="p-6 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {accounts.map((acc: any) => {
            const style = STATUS_STYLES[acc.status] || { bg: "bg-slate-800", text: "text-slate-400", border: "border-slate-700" };
            
            return (
              <tr key={acc.user_id} className="hover:bg-slate-900/30 transition-colors">
                <td className="p-6">
                  <div className="text-sm font-bold text-white uppercase tracking-tight">
                    {acc.first_name} {acc.last_name}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono mt-0.5">{acc.user_id}</div>
                </td>
                <td className="p-6 text-[10px] font-black uppercase">
                  <span className="bg-slate-800/50 px-3 py-1 rounded text-slate-400 border border-slate-700 tracking-tighter">
                    {acc.user_type}
                  </span>
                </td>
                <td className="p-6">
                  {/* Dynamic Status Pill */}
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest",
                    style.bg, style.text, style.border
                  )}>
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
    </Card>
  );
}

function DetailItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex gap-4 group">
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-500 group-hover:text-blue-500 transition-colors shadow-inner">
        {React.cloneElement(icon, { size: 16 })}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        <p className="text-sm font-bold text-white mt-0.5 truncate max-w-[200px]">{value || "N/A"}</p>
      </div>
    </div>
  );
}