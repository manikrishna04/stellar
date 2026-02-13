"use client";
import React, { useState, useEffect } from "react";

import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, User, Mail, Phone, Calendar, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ManagedEntities() {
  const [accounts, setAccounts] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/users/")
      .then(res => res.json())
      .then(data => setAccounts(data));
  }, []);

  // Detailed View Card
  if (selectedUser) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedUser(null)}
          className="mb-6 text-slate-400 "
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Entities
        </Button>

        <Card className="bg-slate-900/50 border-slate-800 text-white max-w-2xl">
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
              <Badge className="bg-amber-600/20 text-amber-500 border-amber-500/20 uppercase font-black px-3 py-1">
                {selectedUser.status.replace('_', ' ')}
              </Badge>
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

  // Standard Table View
  return (
    <Card className="bg-transparent border-slate-800 overflow-hidden">
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
          {accounts.map((acc: any) => (
            <tr key={acc.user_id} className="hover:bg-slate-900/30 transition-colors">
              <td className="p-6">
                <div className="text-sm font-bold text-white uppercase">{acc.first_name} {acc.last_name}</div>
                <div className="text-[10px] text-slate-600 font-mono mt-0.5">{acc.user_id}</div>
              </td>
              <td className="p-6 text-[10px] font-black uppercase">
                <span className="bg-slate-800 px-3 py-1 rounded text-slate-400 border border-slate-700">
                  {acc.user_type}
                </span>
              </td>
              <td className="p-6 text-[10px] font-black uppercase text-amber-500">
                {acc.status.replace('_', ' ')}
              </td>
              <td className="p-6 text-right">
                <Button 
                  onClick={() => setSelectedUser(acc)}
                  className="bg-slate-800 hover:bg-slate-700 text-white h-9 px-4 gap-2 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-700"
                >
                  <ExternalLink className="h-3 w-3" /> View Profile
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function DetailItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex gap-4">
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-500">
        {React.cloneElement(icon, { size: 16 })}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        <p className="text-sm font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}