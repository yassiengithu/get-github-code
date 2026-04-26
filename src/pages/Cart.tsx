import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import BottomNav from "@/components/BottomNav";
import SourceBadge from "@/components/SourceBadge";

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQty, removeFromCart, clearCart, totalPrice } = useCart();
  

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative pb-44">
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-4 flex items-center gap-3" style={{ background: "var(--gradient-primary)" }}>
        <button onClick={() => navigate(-1)} className="text-primary-foreground p-1.5 rounded-full active:bg-primary-foreground/10 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-primary-foreground">My Cart</h1>
        {items.length > 0 && (
          <button
            onClick={() => clearCart()}
            className="ml-auto text-xs font-medium text-primary-foreground/80 active:text-primary-foreground transition-colors"
          >
            Clear All
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 pt-28 px-8">
          <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
            <ShoppingBag className="h-9 w-9 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold text-foreground">Your cart is empty</p>
          <p className="text-sm text-muted-foreground text-center leading-relaxed">Browse products and add items to your cart to see them here.</p>
          <Button asChild className="rounded-xl h-11 px-8 text-sm font-bold mt-2">
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="px-4 pt-4 space-y-3">
            {items.map(({ product: p, qty }) => (
              <div key={p.id} className="flex gap-3.5 rounded-xl bg-card shadow-card p-3.5 animate-fade-in">
                {/* Thumbnail */}
                <Link to={`/product/${p.id}`} className="shrink-0 h-[88px] w-[88px] rounded-lg bg-secondary flex items-center justify-center text-3xl active:scale-95 transition-transform">
                  {p.img}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <Link to={`/product/${p.id}`} className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                      {p.name}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{p.category}</span>
                      <SourceBadge source={p.source} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-primary">₱{(p.price * qty).toLocaleString()}</span>

                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => qty === 1 ? removeFromCart(p.id) : updateQty(p.id, qty - 1)}
                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-secondary active:bg-secondary transition-colors"
                      >
                        {qty === 1 ? <Trash2 className="h-3.5 w-3.5 text-destructive" /> : <Minus className="h-3.5 w-3.5" />}
                      </button>
                      <span className="h-8 w-9 flex items-center justify-center text-xs font-bold text-foreground border-x border-border">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQty(p.id, qty + 1)}
                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-secondary active:bg-secondary transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom checkout bar */}
          <div className="fixed bottom-[52px] left-0 right-0 max-w-md mx-auto bg-card border-t border-border px-5 py-4 flex items-center gap-4 z-50 safe-bottom">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Total</p>
              <p className="text-lg font-bold text-primary">₱{totalPrice.toLocaleString()}</p>
            </div>
            <Button className="flex-1 h-12 rounded-xl text-sm font-bold" onClick={handleCheckout}>
              Checkout ({items.reduce((s, i) => s + i.qty, 0)})
            </Button>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
};

export default Cart;
