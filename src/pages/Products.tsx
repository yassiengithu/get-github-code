import { useState } from "react";
import { Star, ShoppingCart, ArrowLeft, Flame, TrendingUp, Search, X, Heart, PackageSearch, ExternalLink } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { products, type ProductSource, type Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import BottomNav from "@/components/BottomNav";
import SourceBadge from "@/components/SourceBadge";
import EmptyState from "@/components/EmptyState";
import { useWishlist } from "@/context/WishlistContext";

const sources: (ProductSource | "All")[] = ["All", "Shopee", "Temu", "Amazon"];
const categories = ["All", ...new Set(products.map(p => p.category))];

const getDiscount = (p: Product) => Math.round((1 - p.price / p.oldPrice) * 100);
const isPopular = (p: Product) => parseFloat(p.sold.replace("k", "000").replace(".", "")) >= 1000 || p.reviews >= 200;

const Products = () => {
  const [activeSource, setActiveSource] = useState<ProductSource | "All">("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = products
    .filter(p => activeSource === "All" || p.source === activeSource)
    .filter(p => activeCategory === "All" || p.category === activeCategory)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3" style={{ background: "var(--gradient-primary)" }}>
        <button onClick={() => navigate(-1)} className="text-primary-foreground p-1 rounded-full active:bg-primary-foreground/10 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-bold text-primary-foreground">All Products</h1>
        <span className="ml-auto text-[11px] text-primary-foreground/70">{filtered.length} items</span>
      </header>

      {/* Search Bar */}
      <div className="sticky top-[52px] z-35 bg-background px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3.5 py-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="p-0.5 rounded-full hover:bg-muted transition-colors">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Source Filter */}
      <div className="sticky top-[100px] z-30 bg-background px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-border">
        {sources.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSource(s)}
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              activeSource === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="sticky top-[140px] z-25 bg-background px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-border">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              activeCategory === c
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="px-4 pt-3">
        <p className="rounded-lg border border-border bg-card px-3 py-2 text-[11px] font-medium text-muted-foreground shadow-card">
          This app may redirect to external platforms
        </p>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          className="pt-16 pb-24"
          icon={PackageSearch}
          title="No products found"
          description={
            searchQuery
              ? `No matches for "${searchQuery}". Try a different search or clear your filters.`
              : "No products match the selected filters. Try adjusting them."
          }
          action={
            <Button
              variant="outline"
              className="rounded-xl h-11 px-6 text-sm font-bold"
              onClick={() => {
                setSearchQuery("");
                setActiveSource("All");
                setActiveCategory("All");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
      <div className="p-4 pb-20 grid grid-cols-2 gap-2.5">
        {filtered.map((p, i) => {
          const discount = getDiscount(p);
          const popular = isPopular(p);
          return (
            <Link
              to={`/product/${p.id}`}
              key={p.id}
              className="contain-card rounded-xl bg-card shadow-card overflow-hidden animate-fade-in flex flex-col active:scale-[0.98] transition-transform"
               style={{ animationDelay: `${i * 24}ms` }}
            >
              <div className="relative bg-secondary flex items-center justify-center h-36 text-5xl">
                {p.img}
                {/* Wishlist heart */}
                <button
                  className="absolute top-2 right-2 rounded-full bg-card/80 p-1.5 z-10"
                  onClick={(e) => { e.preventDefault(); toggleWishlist(p.id); }}
                >
                  <Heart className={`h-3.5 w-3.5 ${isWishlisted(p.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                </button>
                <SourceBadge source={p.source} className="absolute bottom-2 left-2" />
                {/* Discount badge */}
                {discount >= 20 && (
                  <span className="absolute top-2 left-2 flex items-center gap-0.5 rounded-md bg-sale px-1.5 py-0.5 text-[9px] font-bold text-sale-foreground shadow-sm">
                    <Flame className="h-2.5 w-2.5" />
                    {discount}% OFF
                  </span>
                )}
                {/* Popular badge */}
                {popular && (
                  <span className="absolute top-2 right-2 flex items-center gap-0.5 rounded-md bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground shadow-sm">
                    <TrendingUp className="h-2.5 w-2.5" />
                    Popular
                  </span>
                )}
              </div>
              <div className="p-2.5 flex flex-col flex-1">
                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">
                  {p.category}
                </span>
                <p className="text-[11px] font-semibold text-foreground line-clamp-2 leading-snug mt-0.5">
                  {p.name}
                </p>
                <button
                  onClick={(e) => { e.preventDefault(); navigate(`/shop/${encodeURIComponent(p.seller.name)}`); }}
                  className="flex items-center gap-1 mt-1 text-left group/seller min-w-0"
                >
                  <span className="text-[11px] leading-none shrink-0">{p.seller.logo}</span>
                  <span className="text-[10px] text-muted-foreground truncate group-hover/seller:text-primary transition-colors">
                    {p.seller.name}
                  </span>
                </button>
                <div className="mt-1.5">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(p.affiliateUrl ?? `/product/${p.id}`, "_blank", "noopener,noreferrer");
                    }}
                    className="inline-flex min-h-6 items-center gap-1 rounded-md bg-secondary px-2 text-[10px] font-semibold text-secondary-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open in source app
                  </button>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 fill-star text-star" />
                  <span className="text-[10px] font-medium text-foreground">{p.rating}</span>
                  <span className="text-[10px] text-muted-foreground">({p.reviews})</span>
                </div>
                <div className="mt-auto pt-1.5 flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-primary">₱{p.price.toLocaleString()}</span>
                    <span className="text-[9px] text-muted-foreground line-through">₱{p.oldPrice.toLocaleString()}</span>
                  </div>
                  <Button
                    size="icon"
                    className="h-7 w-7 rounded-lg"
                    onClick={(e) => { e.preventDefault(); handleAddToCart(p); }}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Products;
