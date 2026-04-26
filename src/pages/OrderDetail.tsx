import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Truck, CheckCircle, Clock, MapPin, Phone, User, Package, Receipt, Copy, BadgeCheck, AlertCircle, Loader2, Wallet, Smartphone, CreditCard, ShieldCheck, RotateCcw, ExternalLink, Navigation, Route, MousePointerClick, ArrowLeftRight, Info, XCircle, Upload, Image as ImageIcon, X, Hash } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNav from "@/components/BottomNav";
import SourceBadge from "@/components/SourceBadge";
import { useOrders, type OrderStatus, type PaymentStatus } from "@/context/OrdersContext";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_VISUALS } from "@/lib/paymentStatus";
import PaymentStatusBadge from "@/components/PaymentStatusBadge";
import { useAdminMode } from "@/hooks/useAdminMode";
import { Switch } from "@/components/ui/switch";
import { PLATFORM_COMMISSION_LABEL, calculatePlatformFee } from "@/lib/commission";

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: typeof CheckCircle; className: string; description: string }
> = {
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    className: "bg-success/10 text-success border-success/20",
    description: "Your order has been delivered.",
  },
  in_transit: {
    label: "In Transit",
    icon: Truck,
    className: "bg-info/10 text-info border-info/20",
    description: "Your parcel is moving through the courier network.",
  },
  shipped: {
    label: "Shipped",
    icon: BadgeCheck,
    className: "bg-primary/10 text-primary border-primary/20",
    description: "Your order has been handed to the courier.",
  },
  preparing: {
    label: "Preparing",
    icon: Package,
    className: "bg-accent/10 text-accent-foreground border-accent/20",
    description: "Seller is packing your order.",
  },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const getCourierTrackingUrl = (courierId: string, trackingNumber: string) => {
  const tracking = encodeURIComponent(trackingNumber.trim());
  if (!tracking) return null;

  switch (courierId) {
    case "jnt":
      return `https://www.jtexpress.ph/index/query/gzquery.html?billcode=${tracking}`;
    case "ninja":
      return `https://www.ninjavan.co/en-ph/tracking?id=${tracking}`;
    case "flash":
      return `https://www.flashexpress.ph/tracking/?se=${tracking}`;
    default:
      return `https://www.google.com/search?q=${encodeURIComponent(`${courierId} ${trackingNumber} tracking`)}`;
  }
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { orders, updateOrderStatus, updatePaymentStatus, updateTrackingNumber } = useOrders();
  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);
  const [adminMode, setAdminMode] = useAdminMode();
  const [trackingInput, setTrackingInput] = useState("");
  const [trackingError, setTrackingError] = useState("");

  useEffect(() => {
    setTrackingInput(order?.trackingNumber ?? "");
    setTrackingError("");
  }, [order?.trackingNumber]);

  const handleSetPaymentStatus = (next: PaymentStatus) => {
    if (!order) return;
    updatePaymentStatus(order.id, next);
    toast.success(`Payment marked as ${PAYMENT_STATUS_LABELS[next]}`);
  };

  const handleSetOrderStatus = (next: OrderStatus) => {
    if (!order) return;
    updateOrderStatus(order.id, next);
    toast.success(`Shipping status updated to ${statusConfig[next].label}`);
  };

  const handleSaveTrackingNumber = () => {
    if (!order) return;
    const normalized = trackingInput.trim().toUpperCase();
    if (!/^[A-Z0-9-]{6,32}$/.test(normalized)) {
      setTrackingError("Use 6–32 letters, numbers, or hyphens only.");
      return;
    }
    updateTrackingNumber(order.id, normalized);
    setTrackingInput(normalized);
    setTrackingError("");
    toast.success("Tracking number updated");
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto relative pb-20">
        <header className="sticky top-0 z-40 px-4 py-4 flex items-center gap-3" style={{ background: "var(--gradient-primary)" }}>
          <Link to="/orders" className="text-primary-foreground p-1.5 rounded-full active:bg-primary-foreground/10 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold text-primary-foreground">Order not found</h1>
        </header>
        <div className="flex flex-col items-center justify-center gap-4 pt-24 px-8 text-center">
          <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
            <Package className="h-9 w-9 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">We couldn't find that order.</p>
          <Button asChild className="rounded-xl h-11 px-8 text-sm font-bold mt-2">
            <Link to="/orders">Back to My Orders</Link>
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;
  const platformFee = calculatePlatformFee(order.subtotal);
  const trackingUrl = order.trackingNumber
    ? getCourierTrackingUrl(order.courier.id, order.trackingNumber)
    : null;

  const paymentStatus = order.payment?.status ?? "unpaid";
  const paymentMethodId = order.payment?.id;
  const needsPayment =
    (paymentStatus === "unpaid" || paymentStatus === "failed") && paymentMethodId !== "cod";

  const handlePayNow = () => {
    toast.info("Complete your payment securely", {
      description: "Redirecting to the secure payment page…",
    });
    window.open("https://example.com/pay", "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`min-h-screen bg-background max-w-md mx-auto relative ${needsPayment ? "pb-44" : "pb-20"}`}>
      <header className="sticky top-0 z-40 px-4 py-4 flex items-center gap-3" style={{ background: "var(--gradient-primary)" }}>
        <Link to="/orders" className="text-primary-foreground p-1.5 rounded-full active:bg-primary-foreground/10 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-base font-bold text-primary-foreground truncate">Order Details</h1>
          <p className="text-[11px] text-primary-foreground/75 truncate">{order.id}</p>
        </div>
        <Badge variant="outline" className={`ml-auto gap-1 text-[10px] font-semibold shrink-0 bg-primary-foreground/95 ${status.className}`}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {/* Status hero + progress */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center border ${status.className}`}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-foreground leading-tight">{status.label}</p>
              <p className="text-xs text-muted-foreground leading-snug">{status.description}</p>
            </div>
          </div>

          {(() => {
            const steps: { key: OrderStatus; label: string; icon: typeof CheckCircle }[] = [
              { key: "preparing", label: "Preparing", icon: Package },
              { key: "shipped", label: "Shipped", icon: Truck },
              { key: "in_transit", label: "In Transit", icon: Clock },
              { key: "delivered", label: "Delivered", icon: CheckCircle },
            ];
            const currentIdx = steps.findIndex((s) => s.key === order.status);
            return (
              <div className="flex items-start justify-between relative pt-1">
                {steps.map((step, idx) => {
                  const reached = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center relative z-10 min-w-0">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                          reached
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-card border-border text-muted-foreground"
                        } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <p
                        className={`mt-1.5 text-[10px] font-semibold text-center leading-tight ${
                          reached ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      {idx < steps.length - 1 && (
                        <div
                          className={`absolute top-[15px] left-1/2 w-full h-0.5 -z-0 ${
                            idx < currentIdx ? "bg-primary" : "bg-border"
                          }`}
                          aria-hidden
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </Card>

        {/* Tracking & meta */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Order Info</h2>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground shrink-0">Order ID</span>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-mono font-semibold text-foreground truncate">
                  {order.id}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(order.id).then(
                      () => toast.success("Order ID copied"),
                      () => toast.error("Couldn't copy"),
                    );
                  }}
                  className="p-1 -m-0.5 rounded-md active:bg-secondary text-muted-foreground hover:text-foreground shrink-0"
                  aria-label="Copy order ID"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {order.trackingNumber && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground shrink-0">Tracking #</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-mono font-semibold text-foreground truncate">
                    {order.trackingNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(order.trackingNumber).then(
                        () => toast.success("Tracking number copied"),
                        () => toast.error("Couldn't copy"),
                      );
                    }}
                    className="p-1 -m-0.5 rounded-md active:bg-secondary text-muted-foreground hover:text-foreground shrink-0"
                    aria-label="Copy tracking number"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground shrink-0">Placed on</span>
              <span className="text-xs font-semibold text-foreground text-right">
                {formatDate(order.placedAt)}
              </span>
            </div>
          </div>
        </Card>

        {/* Products */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              Products ({order.itemCount} {order.itemCount === 1 ? "item" : "items"})
            </h2>
          </div>
          <div className="divide-y divide-border">
            {order.items.map((item, i) => (
              <div key={item.id} className={`flex items-center gap-3 ${i === 0 ? "pb-3" : "py-3"} ${i === order.items.length - 1 ? "pb-0" : ""}`}>
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center text-xl shrink-0">
                  {item.img}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{item.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-xs text-muted-foreground">
                      ₱{item.price.toLocaleString()} × {item.qty}
                    </p>
                    {item.source && <SourceBadge source={item.source} />}
                  </div>
                  {item.sellerName && (
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{item.sellerName}</p>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground shrink-0">
                  ₱{(item.price * item.qty).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Delivery info */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Route className="h-4 w-4 text-primary shrink-0" />
              <h2 className="text-sm font-bold text-foreground truncate">Courier & Tracking</h2>
            </div>
            <Badge variant="outline" className={`gap-1 text-[10px] font-bold ${status.className}`}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>

          <div className="rounded-lg bg-secondary/60 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs font-semibold text-foreground">{order.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-foreground">{order.phone}</span>
            </div>
            <div className="flex items-start gap-2 pt-1 border-t border-border">
              <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-foreground leading-relaxed">{order.address}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-secondary/60 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Courier</p>
              <p className="text-sm font-bold text-foreground truncate">{order.courier.name}</p>
            </div>
            <div className="rounded-xl bg-secondary/60 px-3 py-2.5 text-right">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">ETA</p>
              <p className="text-sm font-bold text-foreground truncate">{order.courier.etaDays}</p>
            </div>
          </div>

          {order.trackingNumber && (
            <div className="rounded-xl bg-primary/10 border border-primary/20 px-3 py-2.5 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-primary font-bold">Tracking Number</p>
                    <p className="text-sm font-mono font-extrabold text-foreground tabular-nums truncate">
                      {order.trackingNumber}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(order.trackingNumber).then(
                      () => toast.success("Tracking number copied"),
                      () => toast.error("Couldn't copy"),
                    );
                  }}
                  className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground active:scale-95 transition-transform"
                  aria-label="Copy tracking number"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              {trackingUrl && (
                <Button asChild size="sm" className="w-full h-9 rounded-lg text-xs font-bold gap-1.5">
                  <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Track Shipment
                  </a>
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Payment status — prominent card */}
        {(() => {
          const status = order.payment?.status ?? "unpaid";
          const methodId = order.payment?.id;
          const methodName = order.payment?.name ?? "Cash on Delivery";
          const PaymentIcon =
            methodId === "gcash" ? Smartphone : methodId === "card" ? CreditCard : Wallet;
          const v = PAYMENT_STATUS_VISUALS[status];
          const Icon = v.icon;
          const helper =
            status === "paid"
              ? `Paid via ${methodName}. Thank you!`
              : status === "under_review"
                ? "We're verifying your proof of payment. This usually takes a few minutes."
                : status === "failed"
                  ? `Your ${methodName} payment didn't go through. Please try again or contact support.`
                  : methodId === "cod"
                    ? `Pay ₱${order.total.toLocaleString()} in cash when your order arrives.`
                    : `Complete payment via ${methodName} to start processing your order.`;
          return (
            <Card className={`p-4 space-y-3 border-2 ${v.ring}`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${v.dot} ${v.spin ? "animate-pulse" : ""}`} />
                  Payment Status
                </h2>
                <PaymentStatusBadge status={status} size="md" />
              </div>

              {status === "unpaid" && methodId !== "cod" && (
                <div className="rounded-2xl bg-warning/10 border-2 border-warning/30 p-4 text-center space-y-3">
                  <div className="mx-auto h-14 w-14 rounded-full bg-warning/20 flex items-center justify-center relative">
                    <Clock className="h-7 w-7 text-warning" />
                    <span className="absolute inset-0 rounded-full border-2 border-warning/40 animate-ping" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-extrabold text-foreground">Waiting for payment</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Your order is reserved. Complete payment to start processing.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="rounded-xl bg-card border border-border px-2.5 py-2 text-left">
                      <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-bold">
                        Order ID
                      </p>
                      <p className="text-[11px] font-mono font-bold text-foreground truncate">
                        {order.id}
                      </p>
                    </div>
                    <div className="rounded-xl bg-card border border-border px-2.5 py-2 text-left">
                      <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-bold">
                        Total Amount
                      </p>
                      <p className="text-sm font-extrabold text-primary tabular-nums">
                        ₱{order.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {status === "failed" && (
                <div className="rounded-2xl bg-destructive/10 border-2 border-destructive/30 p-4 text-center space-y-3">
                  <div className="mx-auto h-14 w-14 rounded-full bg-destructive/20 flex items-center justify-center">
                    <XCircle className="h-7 w-7 text-destructive" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-extrabold text-foreground">Payment failed</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      We couldn't confirm your payment. Please try again or contact support.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="rounded-xl bg-card border border-border px-2.5 py-2 text-left">
                      <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-bold">
                        Order ID
                      </p>
                      <p className="text-[11px] font-mono font-bold text-foreground truncate">
                        {order.id}
                      </p>
                    </div>
                    <div className="rounded-xl bg-card border border-border px-2.5 py-2 text-left">
                      <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-bold">
                        Total Amount
                      </p>
                      <p className="text-sm font-extrabold text-primary tabular-nums">
                        ₱{order.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className={`rounded-xl px-3 py-2.5 ${v.surface} flex items-start gap-2`}>
                <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${v.text} ${v.spin ? "animate-spin" : ""}`} aria-hidden="true" />
                <p className={`text-xs leading-relaxed font-medium ${v.text}`}>{helper}</p>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <PaymentIcon className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Method</p>
                    <p className="text-xs font-bold text-foreground truncate">{methodName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                    {status === "paid" ? "Total Paid" : "Total Due"}
                  </p>
                  <p className="text-base font-extrabold text-primary tabular-nums">
                    ₱{order.total.toLocaleString()}
                  </p>
                </div>
              </div>

              {(status === "unpaid" || status === "failed") && methodId !== "cod" && (
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="rounded-xl bg-secondary/60 px-3 py-2.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                        Order ID
                      </span>
                      <span className="text-xs font-mono font-bold text-foreground truncate">
                        {order.id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                        Total Amount
                      </span>
                      <span className="text-sm font-extrabold text-primary tabular-nums">
                        ₱{order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card px-3 py-3 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                      <p className="text-[11px] uppercase tracking-wide font-bold text-foreground">
                        Payment Instructions
                      </p>
                    </div>
                    <ol className="space-y-2">
                      {[
                        { icon: MousePointerClick, text: 'Click "Pay Now" below.' },
                        { icon: Smartphone, text: "Complete payment using GCash or supported methods." },
                        { icon: ArrowLeftRight, text: "Return to the app after payment." },
                      ].map((step, idx) => {
                        const StepIcon = step.icon;
                        return (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="mt-0.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="flex items-start gap-1.5 min-w-0 flex-1">
                              <StepIcon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                              <p className="text-xs text-foreground leading-relaxed">{step.text}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                    <div className="flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/20 px-2.5 py-2">
                      <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                      <p className="text-[11px] font-semibold text-foreground leading-snug">
                        Use the exact amount shown to avoid issues.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="lg"
                    onClick={handlePayNow}
                    className="w-full h-14 rounded-2xl text-base font-extrabold gap-2 shadow-lg shadow-primary/30 ring-2 ring-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-transform tracking-wide"
                  >
                    <ShieldCheck className="h-5 w-5" />
                    {paymentStatus === "failed" ? "Retry Payment" : "Pay Now"}
                    <ExternalLink className="h-4 w-4 opacity-90" />
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center leading-snug">
                    You'll be redirected to an external secure payment page.
                  </p>
                </div>
              )}
            </Card>
          );
        })()}

        {adminMode && (
        <Card className="p-4 space-y-3 border-2 border-dashed border-muted">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-foreground">Order Controls</h2>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Manage payment and delivery updates.
                </p>
              </div>
            </div>
            <Switch
              checked={adminMode}
              onCheckedChange={setAdminMode}
              aria-label="Toggle admin mode"
            />
          </div>

          {adminMode && (
            <div className="space-y-2 pt-1">
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Tracking number
                </p>
                <div className="flex gap-2">
                  <Input
                    value={trackingInput}
                    onChange={(e) => {
                      setTrackingInput(e.target.value.toUpperCase());
                      if (trackingError) setTrackingError("");
                    }}
                    maxLength={32}
                    placeholder="JNT123456789PH"
                    className="h-10 text-xs font-mono uppercase"
                    aria-invalid={!!trackingError}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveTrackingNumber}
                    className="h-10 rounded-lg px-3 text-[11px] font-bold shrink-0"
                  >
                    Save
                  </Button>
                </div>
                {trackingError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" /> {trackingError}
                  </p>
                )}
              </div>

              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                Update shipping status
              </p>
              <div className="grid grid-cols-4 gap-2">
                {(["preparing", "shipped", "in_transit", "delivered"] as OrderStatus[]).map((next) => {
                  const option = statusConfig[next];
                  const OptionIcon = option.icon;
                  return (
                    <Button
                      key={next}
                      type="button"
                      size="sm"
                      variant={order.status === next ? "default" : "outline"}
                      onClick={() => handleSetOrderStatus(next)}
                      className="rounded-lg h-10 px-1 text-[10px] font-bold flex-col gap-0.5"
                    >
                      <OptionIcon className="h-3.5 w-3.5" />
                      {option.label === "In Transit" ? "Transit" : option.label}
                    </Button>
                  );
                })}
              </div>

              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                Update payment status
              </p>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={order.payment?.status === "unpaid" ? "default" : "outline"}
                  onClick={() => handleSetPaymentStatus("unpaid")}
                  className="rounded-lg h-10 px-1 text-[10px] font-bold flex-col gap-0.5"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  Waiting
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={order.payment?.status === "under_review" ? "default" : "outline"}
                  onClick={() => handleSetPaymentStatus("under_review")}
                  className="rounded-lg h-10 px-1 text-[10px] font-bold flex-col gap-0.5"
                >
                  <Loader2 className="h-3.5 w-3.5" />
                  Review
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={order.payment?.status === "paid" ? "default" : "outline"}
                  onClick={() => handleSetPaymentStatus("paid")}
                  className="rounded-lg h-10 px-1 text-[10px] font-bold flex-col gap-0.5"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Paid
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={order.payment?.status === "failed" ? "default" : "outline"}
                  onClick={() => handleSetPaymentStatus("failed")}
                  className="rounded-lg h-10 px-1 text-[10px] font-bold flex-col gap-0.5"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Failed
                </Button>
              </div>
              {(order.payment?.status === "paid" || order.payment?.status === "failed") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSetPaymentStatus("unpaid")}
                  className="w-full rounded-lg h-8 text-[11px] font-semibold text-muted-foreground"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset payment to Waiting
                </Button>
              )}
            </div>
          )}
        </Card>
        )}

        {/* Price breakdown */}
        <Card className="p-4 space-y-2">
          <h2 className="text-sm font-bold text-foreground mb-1">Payment Summary</h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">₱{order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-foreground">₱{order.shipping.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{PLATFORM_COMMISSION_LABEL}</span>
            <span className="text-foreground">₱{platformFee.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment</span>
            <span className="text-foreground font-medium flex items-center gap-1.5">
              {order.payment?.name ?? "Cash on Delivery"}
              <PaymentStatusBadge status={order.payment?.status ?? "unpaid"} size="sm" short />
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-base font-bold text-primary">₱{order.total.toLocaleString()}</span>
          </div>
        </Card>
      </div>

      {needsPayment && (
        <div
          className="fixed bottom-16 left-0 right-0 z-30 mx-auto max-w-md px-4 pt-3 pb-3 bg-card border-t-2 border-primary/30 shadow-[0_-8px_24px_-12px_hsl(var(--primary)/0.35)]"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold leading-none">
                Total Due
              </p>
              <p className="text-lg font-extrabold text-primary tabular-nums leading-tight">
                ₱{order.total.toLocaleString()}
              </p>
            </div>
            <Button
              type="button"
              size="lg"
              onClick={handlePayNow}
              className="h-14 px-6 rounded-2xl text-base font-extrabold gap-2 shadow-lg shadow-primary/40 ring-2 ring-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-transform tracking-wide"
            >
              <ShieldCheck className="h-5 w-5" />
              {paymentStatus === "failed" ? "Retry Payment" : "Pay Now"}
            </Button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default OrderDetail;
