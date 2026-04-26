import { Zap, Truck, Tag } from "lucide-react";

const promos = [
  { icon: Zap, label: "Flash Sale", sub: "Up to 70%" },
  { icon: Truck, label: "Free Ship", sub: "Orders ₱299+" },
  { icon: Tag, label: "Vouchers", sub: "Claim now" },
];

const PromoBanner = () => (
  <section className="mx-4 mt-3 rounded-xl p-4 shadow-elevated" style={{ background: "var(--gradient-banner)" }}>
    <div className="grid grid-cols-3 gap-2">
      {promos.map((p) => (
        <button key={p.label} className="flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-lg bg-primary-foreground/10 px-2 group active:scale-[0.97] transition-transform">
          <div className="rounded-full bg-primary-foreground/20 p-2 group-active:scale-95 transition-transform">
            <p.icon className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xs font-semibold text-primary-foreground leading-none">{p.label}</span>
          <span className="text-[10px] text-primary-foreground/70 leading-none">{p.sub}</span>
        </button>
      ))}
    </div>
  </section>
);

export default PromoBanner;
