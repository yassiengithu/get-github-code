import SearchHeader from "@/components/SearchHeader";
import PromoBanner from "@/components/PromoBanner";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";

const Index = () => (
  <div className="min-h-screen bg-background max-w-md mx-auto relative">
    <SearchHeader />
    <PageTransition>
      <PromoBanner />
      <CategoriesSection />
      <FeaturedProducts />
    </PageTransition>
    <BottomNav />
  </div>
);

export default Index;
