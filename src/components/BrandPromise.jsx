// src/components/BrandPromise.jsx — Style Eternal
// Premium trust/quality strip — reusable across pages
import React from "react";
import { Truck, ShieldCheck, Undo2, Award } from "lucide-react";

const PROMISES = [
  { icon: Truck, label: "Free Shipping $150+" },
  { icon: ShieldCheck, label: "Authentic Guarantee" },
  { icon: Undo2, label: "30-Day Returns" },
  { icon: Award, label: "Premium Quality" },
];

export default function BrandPromise() {
  return (
    <div className="trust-bar py-5 md:py-6 bg-se-charcoal/50">
      <div className="content-wide">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0">
          {PROMISES.map((item) => {
            const PromiseIcon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center justify-center gap-2.5 py-1"
              >
                <PromiseIcon className="w-4 h-4 text-se-gold/70" strokeWidth={1.5} />
                <span className="text-[9px] md:text-[10px] font-accent tracking-[0.18em] uppercase text-se-bone/50">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
