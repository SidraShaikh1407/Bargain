import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Product, CATEGORIES } from "../types";
import { Plus, Package, Tag, Filter, Trash2, LayoutDashboard } from "lucide-react";
import { ProductImage } from "../components/ProductImage";

export default function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [basePrice, setBasePrice] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fetchProducts = async () => {
    try {
      const data = await api.get("/products");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setProducts(data.filter((p: Product) => p.seller_id === user.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/products", {
        name,
        category,
        base_price: Number(basePrice),
        min_price: Number(minPrice),
        image_url: imageUrl
      });
      setShowAdd(false);
      setName("");
      setBasePrice("");
      setMinPrice("");
      setImageUrl("");
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-20">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 text-white p-4 rounded-3xl shadow-xl shadow-indigo-100">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Seller Dashboard</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Manage your inventory & negotiations</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100"
        >
          <Plus size={20} />
          {showAdd ? "Cancel" : "Add Product"}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">Add New Product</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Product Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Category</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white font-medium"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Base Price (₹)</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Minimum Price (₹)</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-widest">
                  This is the lowest price you'll accept. Customers won't see this.
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
              >
                List Product
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Your Inventory</h2>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            {products.length} Products
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] uppercase font-black tracking-widest text-gray-400">
                <th className="px-8 py-4">Product</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Base Price</th>
                <th className="px-8 py-4">Min Price</th>
                <th className="px-8 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        <ProductImage 
                          src={product.image_url} 
                          alt={product.name}
                          productId={product.id}
                          size="small"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-bold text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{product.category}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-black text-gray-900">₹{product.base_price}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-black text-indigo-600">₹{product.min_price}</span>
                  </td>
                  <td className="px-8 py-6">
                    <button className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-20">
            <Package className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No products listed yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
