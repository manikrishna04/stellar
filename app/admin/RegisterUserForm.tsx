"use client";

import * as React from "react";
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Mail, Phone, Loader2, ArrowRight, ShieldCheck 
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createWallet } from "@/app/lib/phraseWallet";

export default function BankAccountCreation({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = React.useState(false);
  const [date, setDate] = React.useState<Date>();
  const [gender, setGender] = React.useState("MALE");
  const [formData, setFormData] = React.useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  // app/admin/RegisterUserForm.tsx

// app/admin/RegisterUserForm.tsx

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Basic validation to prevent 400 Bad Request
  if (!date) {
    alert("Please select a Date of Birth");
    return;
  }

  setLoading(true);

  // Per your requirement: phone_number is used for both 'phone_number' and 'password'
  const registrationPayload = {
    first_name: formData.first_name,
    last_name: formData.last_name,
    gender: gender,
    dob: format(date, "yyyy-MM-dd"), // Matches Django DateField format
    email: formData.email,
    phone_number: formData.phone_number,
    password: formData.phone_number, // Passed separately as requested

  };

  try {
    const response = await fetch("http://127.0.0.1:8000/api/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registrationPayload),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Data stored successfully:", data);
      onComplete();
    } else {
      /**
       * If it's still a 400 error, this will show exactly 
       * which field (email, phone, etc.) failed validation.
       */
      console.error("Serializer Errors:", data);
      alert(`Error: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    // console.error("Network Error: Ensure Django is running and CORS is enabled.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto py-4 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-start justify-between border-b border-slate-800/50 pb-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Create Account</h2>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Institutional Beneficiary Enrollment Node
          </p>
        </div>
        <div className="bg-blue-600/10 text-blue-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-blue-500/20">
           Stage 01
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="grid items-center gap-1.5">
            <Label htmlFor="first_name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">First Name</Label>
            <Input 
              id="first_name" 
              required
              placeholder="Rahul" 
              className="h-11 bg-slate-900/50 border-slate-800 rounded-xl focus-visible:ring-blue-500" 
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
            />
          </div>
          <div className="grid items-center gap-1.5">
            <Label htmlFor="last_name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Last Name</Label>
            <Input 
              id="last_name" 
              required
              placeholder="Sharma" 
              className="h-11 bg-slate-900/50 border-slate-800 rounded-xl focus-visible:ring-blue-500"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="grid items-center gap-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Corporate Email</Label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <Input 
                type="email" 
                required
                placeholder="rahul@gmail.com" 
                className="h-11 pl-10 bg-slate-950 border-slate-800 rounded-xl font-mono"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
          <div className="grid items-center gap-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Verified Phone</Label>
            <div className="relative group">
              <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <Input 
                required
                placeholder="9876543210" 
                className="h-11 pl-10 bg-slate-950 border-slate-800 rounded-xl font-mono"
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="grid items-center gap-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Legal Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "h-11 justify-start text-left font-normal bg-slate-950 border-slate-800 rounded-xl",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-3 h-4 w-4 text-slate-500" />
                  {date ? format(date, "PPP") : <span className="text-xs">Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-950 border-slate-800" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="bg-slate-950 text-white"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid items-center gap-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Gender Designation</Label>
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 w-full h-11">
              {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${gender === g ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit"
            disabled={loading}
            className="h-13 w-55 px-14bg-blue-600 hover:bg-blue-500 text-white font-bold text-[16px] uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center space-x-3 border border-blue-400/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : (
              <span className="flex items-center gap-2">SUBMIT <ArrowRight className="w-4 h-4" /></span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}