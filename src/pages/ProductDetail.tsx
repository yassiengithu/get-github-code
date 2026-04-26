import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Star, ShoppingCart, Heart, Share2, Minus, Plus, MapPin, ShieldCheck, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { products } from "@/data/products";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import BottomNav from "@/components/BottomNav";
import SourceBadge from "@/components/SourceBadge";
import PageTransition from "@/components/PageTransition";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [qty, setQty] = useState(1);

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto relative pb-20">
        <header className="sticky top-0 z-40 px-4 py-4 flex items-center gap-3" style={{ background: "var(--gradient-primary)" }}>
          <button onClick={() => navigate(-1)} className="text-primary-foreground p-1.5 rounded-full active:bg-primary-foreground/10 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-primary-foreground">Product not found</h1>
        </header>
        <div className="flex flex-col items-center justify-center gap-4 pt-24 px-8 text-center animate-fade-in">
          <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
            <ShoppingCart className="h-9 w-9 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold text-foreground">This product is unavailable</p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            It may have been removed or the link is invalid. Try browsing our latest products.
          </p>
          <Button asChild className="rounded-xl h-11 px-8 text-sm font-bold mt-2">
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const discount = Math.round((1 - product.price / product.oldPrice) * 100);

  const handleAddToCart = () => {
    addToCart(product, qty);
    toast({
      title: "Added to cart!",
      description: `${qty}x ${product.name} added to your cart.`,
    });
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-background max-w-md mx-auto relative pb-40">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="h-9 w-9 rounded-full bg-card/90 flex items-center justify-center shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => toggleWishlist(product.id)}
            className="h-9 w-9 rounded-full bg-card/90 flex items-center justify-center shadow-sm"
          >
            <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-destructive text-destructive" : "text-foreground"}`} />
          </button>
          <button className="h-9 w-9 rounded-full bg-card/90 flex items-center justify-center shadow-sm">
            <Share2 className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </header>

      {/* Product Image */}
      <div className="bg-secondary flex items-center justify-center h-80 text-8xl relative">
        {product.img}
        {discount > 0 && (
          <span className="absolute bottom-3 left-3 rounded-lg bg-sale px-2 py-1 text-xs font-bold text-sale-foreground">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Details */}
      <div className="px-4 pt-4 space-y-4">
        {/* Category */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {product.category}
          </span>
          <SourceBadge source={product.source} />
        </div>

        {/* Name */}
        <h1 className="text-lg font-bold text-foreground leading-snug">{product.name}</h1>

        {/* Rating & Sold */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-star text-star" />
            <span className="text-sm font-semibold text-foreground">{product.rating}</span>
            <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
          </div>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{product.sold} sold</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">₱{product.price.toLocaleString()}</span>
          {product.oldPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">₱{product.oldPrice.toLocaleString()}</span>
          )}
        </div>

        {/* Source / Sourced From card */}
        {(() => {
          const sourceMeta: Record<typeof product.source, { tagline: string; tile: string; trust: string; searchUrl: string }> = {
            Shopee: {
              tagline: "Imported from Shopee Marketplace",
              tile: "bg-source-shopee/15 text-source-shopee",
              trust: "Backed by Shopee Guarantee",
              searchUrl: "https://shopee.ph/search?keyword=",
            },
            Temu: {
              tagline: "Imported from Temu Marketplace",
              tile: "bg-source-temu/15 text-source-temu",
              trust: "Purchase Protection included",
              searchUrl: "https://www.temu.com/search_result.html?search_key=",
            },
            Amazon: {
              tagline: "Imported from Amazon Marketplace",
              tile: "bg-source-amazon/15 text-source-amazon",
              trust: "A-to-z Guarantee Protection",
              searchUrl: "https://www.amazon.com/s?k=",
            },
          };
          const meta = sourceMeta[product.source];
          const externalUrl = product.affiliateUrl ?? `${meta.searchUrl}${encodeURIComponent(product.name)}`;
          return (
            <div className="rounded-xl border border-border bg-card shadow-card p-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${meta.tile}`}>
                  <Globe className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-foreground">Sourced from</p>
                    <SourceBadge source={product.source} />
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{meta.tagline}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ShieldCheck className="h-3 w-3 text-success shrink-0" />
                    <span className="text-[10px] font-medium text-success">{meta.trust}</span>
                  </div>
                </div>
              </div>
              <p className="rounded-lg bg-secondary px-3 py-2 text-[10px] font-medium text-muted-foreground">
                This app may redirect to external platforms
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg text-xs font-semibold gap-1.5 px-2"
                  onClick={() => window.open(externalUrl, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Affiliate deal
                </Button>
                <Button
                  size="sm"
                  className="h-9 rounded-lg text-xs font-semibold gap-1.5 px-2"
                  onClick={() => window.open(externalUrl, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Source app
                </Button>
              </div>
            </div>
          );
        })()}

        {/* Description */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-1.5">Description</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {/* Seller */}
        <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-lg">
            {product.seller.logo}
          </div>
          <div className="flex-1 min-w-0">
            <Link to={`/shop/${encodeURIComponent(product.seller.name)}`} className="text-xs font-semibold text-primary hover:underline">{product.seller.name}</Link>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-star text-star" />
                <span className="text-[10px] font-medium text-foreground">{product.seller.rating}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">•</span>
              <div className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{product.seller.location}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-7 px-3" onClick={() => navigate(`/shop/${encodeURIComponent(product.seller.name)}`)}>
            Visit Shop
          </Button>
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">Quantity</span>
          <div className="flex items-center gap-0 border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="h-8 w-10 flex items-center justify-center text-sm font-semibold text-foreground border-x border-border">
              {qty}
            </span>
            <button
              onClick={() => setQty(qty + 1)}
              className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-[52px] left-0 right-0 max-w-md mx-auto bg-card border-t border-border px-4 py-3 flex items-center gap-3 z-40">
        <div>
          <p className="text-[10px] text-muted-foreground">Total Price</p>
          <p className="text-base font-bold text-primary">₱{(product.price * qty).toLocaleString()}</p>
        </div>
        <Button variant="outline" className="flex-1 h-11 rounded-xl gap-2 text-sm font-bold" onClick={handleAddToCart}>
          <ShoppingCart className="h-4 w-4" />
          Cart
        </Button>
        <Button className="flex-1 h-11 rounded-xl text-sm font-bold" onClick={() => toast({ title: "Proceeding to checkout", description: `Buying ${qty}x ${product.name}` })}>
          Buy Now
        </Button>
      </div>

      <BottomNav />
    </div>
    </PageTransition>
  );
};

export default ProductDetail;
