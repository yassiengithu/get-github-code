import { Heart, Package, Settings, ChevronRight, LogOut, HelpCircle, Bell, CreditCard, TrendingUp, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import BottomNav from "@/components/BottomNav";
import SavedAddressCard from "@/components/SavedAddressCard";
import { toast } from "@/hooks/use-toast";
import { calculatePlatformFee } from "@/lib/commission";

const menuItems = [
  { icon: Package, label: "My Orders", desc: "Track & manage orders", path: "/orders", enabled: true },
  { icon: Heart, label: "Wishlist", desc: "Your saved items", path: "/products", enabled: true },
  { icon: CreditCard, label: "Payment Methods", desc: "Manage cards & wallets", path: "", enabled: false },
  { icon: Bell, label: "Notifications", desc: "Alerts & updates", path: "", enabled: false },
  { icon: HelpCircle, label: "Help Center", desc: "FAQ & support", path: "", enabled: false },
  { icon: Settings, label: "Settings", desc: "Account preferences", path: "", enabled: false },
];

const Profile = () => {
  const { wishlist } = useWishlist();
  const { totalItems } = useCart();
  const { orders } = useOrders();

  const grossSales = orders.reduce((sum, order) => sum + order.subtotal, 0);
  const platformFees = orders.reduce((sum, order) => sum + calculatePlatformFee(order.subtotal), 0);
  const netEarnings = grossSales - platformFees;
  const pendingPayout = orders
    .filter((order) => order.payment?.status !== "paid")
    .reduce((sum, order) => sum + order.subtotal - calculatePlatformFee(order.subtotal), 0);

  const handleDisabledTap = (label: string) => {
    toast({ title: `${label} coming soon`, description: "This feature is not available yet." });
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative pb-20">
      {/* Header */}
      <div className="px-4 pt-10 pb-8 rounded-b-3xl" style={{ background: "var(--gradient-primary)" }}>
        <h1 className="text-primary-foreground text-lg font-bold mb-5">My Profile</h1>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary-foreground/30">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xl font-bold">
              S
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-primary-foreground font-semibold text-base">Shopper</p>
            <p className="text-primary-foreground/70 text-sm">Manage your activity</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 -mt-5">
        <Card className="flex justify-around py-4 shadow-[var(--shadow-elevated)]">
          <Link to="/cart" className="flex flex-col items-center gap-1">
            <span className="text-lg font-bold text-foreground">{totalItems}</span>
            <span className="text-xs text-muted-foreground">In Cart</span>
          </Link>
          <div className="w-px bg-border" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg font-bold text-foreground">{wishlist.length}</span>
            <span className="text-xs text-muted-foreground">Wishlist</span>
          </div>
          <div className="w-px bg-border" />
          <Link to="/orders" className="flex flex-col items-center gap-1">
            <span className="text-lg font-bold text-foreground">{orders.length}</span>
            <span className="text-xs text-muted-foreground">Orders</span>
          </Link>
        </Card>
      </div>

      {/* Seller earnings mock */}
      <div className="px-4 mt-5">
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-foreground">Seller Earnings</h2>
                <p className="text-[11px] text-muted-foreground">Summary after platform fees</p>
              </div>
            </div>
            <TrendingUp className="h-4 w-4 text-success shrink-0" />
          </div>

          <div className="rounded-xl bg-secondary/60 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Net Earnings</p>
            <p className="text-xl font-extrabold text-primary tabular-nums">₱{netEarnings.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-secondary/60 px-2 py-2">
              <p className="text-[10px] text-muted-foreground font-semibold">Gross</p>
              <p className="text-xs font-bold text-foreground tabular-nums">₱{grossSales.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-secondary/60 px-2 py-2">
              <p className="text-[10px] text-muted-foreground font-semibold">Fees</p>
              <p className="text-xs font-bold text-foreground tabular-nums">₱{platformFees.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-secondary/60 px-2 py-2">
              <p className="text-[10px] text-muted-foreground font-semibold">Pending</p>
              <p className="text-xs font-bold text-foreground tabular-nums">₱{pendingPayout.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Saved address */}
      <div className="px-4 mt-5">
        <SavedAddressCard />
      </div>

      {/* Menu */}
      <div className="px-4 mt-5 space-y-1.5">
        {menuItems.map((item) =>
          item.enabled ? (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-card hover:bg-secondary transition-colors"
            >
              <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center">
                <item.icon className="h-4.5 w-4.5 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ) : (
            <button
              key={item.label}
              onClick={() => handleDisabledTap(item.label)}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-card hover:bg-secondary transition-colors opacity-60"
            >
              <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center">
                <item.icon className="h-4.5 w-4.5 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )
        )}
      </div>

      {/* Sign Out */}
      <div className="px-4 mt-6">
        <Button
          variant="outline"
          className="w-full gap-2 text-destructive border-destructive/20 hover:bg-destructive/5"
          onClick={() => toast({ title: "Signed out", description: "You have been signed out." })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
