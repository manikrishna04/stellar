"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Mail,
  Phone,
  Loader2,
  ArrowRight,
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

export default function BankAccountCreation({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [date, setDate] = React.useState<Date>();
  const [gender, setGender] = React.useState("MALE");
  const [formData, setFormData] = React.useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) return alert("Please select Date of Birth");

    setLoading(true);

    const registrationPayload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      gender,
      dob: format(date, "yyyy-MM-dd"),
      email: formData.email,
      phone_number: formData.phone_number,
      password: formData.phone_number,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationPayload),
      });

      const data = await response.json();

      if (response.ok) {
        onComplete();
      } else {
        alert(`Error: ${JSON.stringify(data)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-0 pb-3 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="border-b border-slate-800/60 pb-3 mb-2">
        <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-none">
          Create Account
        </h2>
        <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mt-1">
          Institutional Beneficiary Enrollment
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              First Name
            </Label>
            <Input
              required
              placeholder="Enter first name"
              className="h-11 bg-slate-950 border-slate-800 rounded-xl
              placeholder:text-slate-600 placeholder:text-xs placeholder:tracking-wide placeholder:font-medium"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Last Name
            </Label>
            <Input
              required
              placeholder="Enter last name"
              className="h-11 bg-slate-950 border-slate-800 rounded-xl
              placeholder:text-slate-600 placeholder:text-xs placeholder:tracking-wide placeholder:font-medium"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
            />
          </div>
        </div>

        {/* Contact Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              User Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <Input
                type="email"
                required
                placeholder="Enter email address"
                className="h-11 pl-10 bg-slate-950 border-slate-800 rounded-xl
                placeholder:text-slate-600 placeholder:text-xs placeholder:tracking-wide placeholder:font-medium"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Verified Phone
            </Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <Input
                required
                placeholder="Enter phone number"
                className="h-11 pl-10 bg-slate-950 border-slate-800 rounded-xl
                placeholder:text-slate-600 placeholder:text-xs placeholder:tracking-wide placeholder:font-medium"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone_number: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Personal Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* DOB */}
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Date of Birth
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-11 w-full justify-start text-left font-normal bg-slate-950 border-slate-800 rounded-xl",
                    !date && "text-slate-600"
                  )}
                >
                  <CalendarIcon className="mr-3 h-4 w-4 text-slate-500" />
                  {date ? (
                    format(date, "PPP")
                  ) : (
                    <span className="text-xs tracking-wide">
                      Pick a date
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-slate-950 border-slate-800"
                align="start"
              >
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

          {/* Gender */}
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Gender
            </Label>
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl h-11 overflow-hidden">
              {["MALE", "FEMALE", "OTHER"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={cn(
                    "flex-1 text-[10px] font-bold uppercase tracking-widest transition-all",
                    gender === g
                      ? "bg-slate-800 text-white shadow-inner"
                      : "text-slate-500 hover:text-white"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-5 flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="h-12 px-14 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-[0.25em] rounded-xl shadow-xl shadow-blue-900/30 transition-all active:scale-[0.97] flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <>
                Submit <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}
