import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Product, CATEGORIES } from "../types";
import { Search, Filter, Tag, Star, Box, X, ChevronDown, ChevronUp } from "lucide-react";
import { ProductImage } from "../components/ProductImage";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (search) params.append("search", search);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (minRating) params.append("minRating", minRating);
      if (availableOnly) params.append("availableOnly", "true");

      try {
        const data = await api.get(`/products?${params.toString()}`);
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [category, search, minPrice, maxPrice, minRating, availableOnly]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className={`lg:w-64 space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit sticky top-24 transition-all duration-300 ${showFilters ? 'block' : 'hidden lg:block'}`}>
        <div className="flex items-center justify-between lg:hidden">
          <h2 className="font-black uppercase tracking-tight text-gray-900">Filters</h2>
          <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Category</h3>
          <select
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Price Range (₹)</h3>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Max"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Min Seller Rating</h3>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((rating) => (
              <button
                key={rating}
                onClick={() => setMinRating(minRating === rating.toString() ? "" : rating.toString())}
                className={`flex-1 py-2 rounded-xl border transition-all text-sm font-bold ${
                  minRating === rating.toString() 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                }`}
              >
                {rating}+
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            id="availableOnly"
            className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
          />
          <label htmlFor="availableOnly" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
            In Stock Only
          </label>
        </div>

        <button 
          onClick={() => {
            setCategory("");
            setMinPrice("");
            setMaxPrice("");
            setMinRating("");
            setAvailableOnly(false);
            setSearch("");
          }}
          className="w-full py-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-colors"
        >
          Reset All
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm"
          >
            <Filter size={16} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Updating Catalog...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map(product => (
                <Link 
                  key={product.id} 
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col relative"
                >
                  <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    <ProductImage 
                      src={product.image_url} 
                      alt={product.name}
                      productId={product.id}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-100 shadow-sm">
                      {product.category}
                    </div>
                    {product.stock_count <= 5 && product.stock_count > 0 && (
                      <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                        Only {product.stock_count} Left
                      </div>
                    )}
                    {product.stock_count === 0 && (
                      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-white text-gray-900 px-6 py-2 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
                        {product.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                        <Tag size={12} className="text-indigo-500" />
                        {product.seller_name}
                      </div>
                      {product.seller_rating && (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                          <Star size={12} fill="currentColor" />
                          {product.seller_rating}
                        </div>
                      )}
                    </div>

                    <div className="mt-auto flex items-end justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 block uppercase font-black tracking-widest">Starting From</span>
                        <span className="text-3xl font-black text-gray-900 tracking-tighter">₹{product.base_price.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 group-hover:bg-indigo-700 transition-colors">
                          Negotiate
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="text-gray-300" size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">No matches found</h3>
                <p className="text-gray-400 max-w-xs mx-auto text-sm font-medium">Try adjusting your filters or search terms to find what you're looking for.</p>
                <button 
                  onClick={() => {
                    setCategory("");
                    setMinPrice("");
                    setMaxPrice("");
                    setMinRating("");
                    setAvailableOnly(false);
                    setSearch("");
                  }}
                  className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
