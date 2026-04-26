import { ChevronLeft, ChevronRight, Truck, CheckCircle, ShoppingBag, Package, BadgeCheck, AlertCircle, Wallet, Navigation, Route } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import PaymentStatusBadge from "@/components/PaymentStatusBadge";
import { useOrders, type OrderStatus } from "@/context/OrdersContext";
import { calculatePlatformFee } from "@/lib/commission";

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: typeof CheckCircle; badge: string; dot: string }
> = {
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  in_transit: {
    label: "In Transit",
    icon: Truck,
    badge: "bg-info/10 text-info",
    dot: "bg-info",
  },
  shipped: {
    label: "Shipped",
    icon: BadgeCheck,
    badge: "bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  preparing: {
    label: "Preparing",
    icon: Package,
    badge: "bg-accent/10 text-accent-foreground",
    dot: "bg-accent",
  },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const Orders = () => {
  const { orders } = useOrders();

  const unpaidOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.payment &&
          o.payment.id !== "cod" &&
          o.payment.status !== "paid" &&
          o.status !== "delivered",
      ),
    [orders],
  );
  const unpaidTotal = unpaidOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative pb-20">
      {/* Header — unified gradient style */}
      <header className="sticky top-0 z-40 px-4 py-4 flex items-center gap-3" style={{ background: "var(--gradient-primary)" }}>
        <Link to="/profile" className="text-primary-foreground p-1.5 rounded-full active:bg-primary-foreground/10 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold text-primary-foreground">My Orders</h1>
        {orders.length > 0 && (
          <span className="ml-auto text-[11px] font-semibold text-primary-foreground bg-primary-foreground/15 px-2 py-1 rounded-full">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        )}
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 pt-24 px-8 text-center">
          <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
            <ShoppingBag className="h-9 w-9 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold text-foreground">No orders yet</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            When you place an order, it'll show up here so you can track its status.
          </p>
          <Button asChild className="rounded-xl h-11 px-8 text-sm font-bold mt-2">
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-3">
          {unpaidOrders.length > 0 && (
            <Card className="p-3 border-2 border-destructive/30 bg-destructive/5">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {unpaidOrders.length} unpaid {unpaidOrders.length === 1 ? "order" : "orders"}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                    Complete payment of{" "}
                    <span className="font-bold text-destructive tabular-nums">
                      ₱{unpaidTotal.toLocaleString()}
                    </span>{" "}
                    to start processing.
                  </p>
                  {unpaidOrders.length === 1 && (
                    <Button
                      asChild
                      size="sm"
                      className="mt-2 h-8 rounded-lg text-[11px] font-bold px-3 gap-1"
                    >
                      <Link to={`/orders/${encodeURIComponent(unpaidOrders[0].id)}`}>
                        <Wallet className="h-3.5 w-3.5" />
                        Pay now
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
          {orders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;
            const previewItems = order.items.slice(0, 3);
            const remaining = order.items.length - previewItems.length;
            const firstItem = order.items[0];
            const platformFee = calculatePlatformFee(order.subtotal);

            return (
              <Link
                key={order.id}
                to={`/orders/${encodeURIComponent(order.id)}`}
                className="block rounded-2xl active:scale-[0.99] transition-transform"
              >
                <Card className="overflow-hidden p-0">
                  {/* Status strip */}
                  <div className="flex items-center justify-between gap-2 px-4 py-2 bg-secondary/40 border-b border-border">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <span className={`h-2 w-2 rounded-full ${status.dot} shrink-0`} />
                      <span className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${status.badge}`}>
                        <StatusIcon className="h-3 w-3 inline -mt-0.5 mr-1" />
                        {status.label}
                      </span>
                      {order.payment && (
                        <PaymentStatusBadge status={order.payment.status} size="sm" />
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {formatDate(order.placedAt)}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3">
                    {/* Order id + chevron */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <p className="text-xs font-mono text-muted-foreground truncate">{order.id}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>

                    {/* Item preview row */}
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {previewItems.map((item) => (
                          <div
                            key={item.id}
                            className="h-11 w-11 rounded-xl bg-secondary ring-2 ring-card flex items-center justify-center text-lg"
                          >
                            {item.img}
                          </div>
                        ))}
                        {remaining > 0 && (
                          <div className="h-11 w-11 rounded-xl bg-secondary ring-2 ring-card flex items-center justify-center text-[11px] font-bold text-muted-foreground">
                            +{remaining}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {firstItem.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>

                    {/* Courier + tracking */}
                    <div className="rounded-xl bg-secondary/50 px-3 py-2.5 space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Route className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="font-semibold text-foreground truncate">
                            {order.courier.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {order.courier.etaDays}
                        </span>
                      </div>
                      {order.trackingNumber && (
                        <div className="flex items-center justify-between gap-2 text-[11px] rounded-lg bg-primary/10 px-2.5 py-1.5">
                          <span className="text-primary font-bold flex items-center gap-1">
                            <Navigation className="h-3 w-3" /> Tracking
                          </span>
                          <span className="font-mono font-semibold text-foreground truncate">
                            {order.trackingNumber}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-semibold">Platform fee</span>
                        <span className="text-foreground font-semibold tabular-nums">
                          ₱{platformFee.toLocaleString()}
                        </span>
                      </div>
                    <div className="flex items-end justify-between">
                      <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">
                        Total
                      </span>
                      <span className="text-base font-bold text-primary leading-none">
                        ₱{order.total.toLocaleString()}
                      </span>
                    </div>
                    </div>

                    {order.payment &&
                      order.payment.id !== "cod" &&
                      order.payment.status !== "paid" &&
                      order.status !== "delivered" && (
                        (() => {
                          const ps = order.payment.status;
                          const tone =
                            ps === "failed"
                              ? "bg-destructive/10 border-destructive/20 text-destructive"
                              : ps === "under_review"
                                ? "bg-info/10 border-info/20 text-info"
                                : "bg-warning/10 border-warning/20 text-warning";
                          const message =
                            ps === "failed"
                              ? "Payment failed — retry"
                              : ps === "under_review"
                                ? "Verifying your payment"
                                : "Payment required";
                          return (
                            <div className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 ${tone}`}>
                              <div className="flex items-center gap-1.5 min-w-0">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-[11px] font-semibold truncate">
                                  {message}
                                </span>
                              </div>
                              <PaymentStatusBadge status={ps} size="sm" short />
                            </div>
                          );
                        })()
                      )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Orders;
