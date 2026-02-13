import React from "react";

export const Card = ({ children, className = "", onClick }: any) => (
  <div onClick={onClick} className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 ${className}`}>{children}</div>
);

export const Button = ({ onClick, disabled, variant = "primary", children, className = "" }: any) => {
  const styles: any = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-800",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200",
    danger: "bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-900/50",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
};

export const Input = (props: any) => (
  <input {...props} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-700 text-sm transition-all" />
);

export const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 ml-1">{children}</label>
);