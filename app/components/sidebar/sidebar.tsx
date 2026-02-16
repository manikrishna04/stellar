"use client";
import { Activity, Plus, ShieldCheck, Building2, Users } from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab }: any) {
  const menuItems = [
  { 
    id: 'DASHBOARD', 
    label: 'Treasury Overview', // Focuses on the liquidity and asset management
    icon: Activity 
  },
  { 
    id: 'CREATE_USER', 
    label: 'Onboard Beneficiary', // "Beneficiary" is the standard banking term for payees/entities
    icon: Plus 
  },
  { 
    id: 'KYC_APPROVAL', 
    label: 'Compliance Review', // Shifts focus to the regulatory "Audit" phase
    icon: ShieldCheck 
  },
  { 
    id: 'VIEW_ACCOUNTS', 
    label: 'Manage Beneficiaries', // "Registry" implies a formal institutional record
    icon: Users 
  },
];

  return (
    <aside className="w-72 border-r border-slate-900 bg-slate-950/50 p-6 space-y-2 hidden lg:block">
      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-8 px-4">Management Console</p>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all ${
              activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:bg-slate-900'
            }`}
          >
            <item.icon className="w-4 h-4" /> {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}