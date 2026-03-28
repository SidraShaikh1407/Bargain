import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Cart } from "../types";
import { Trash2, ShoppingBag, ArrowRight, Tag, Percent } from "lucide-react";
import { ProductImage } from "../components/ProductImage";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const data = await api.get("/cart");
      setCart(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeItem = async (id: number) => {
    await api.delete(`/cart/${id}`);
    fetchCart();
  };

  const checkout = async () => {
    try {
      await api.post("/orders/checkout", {});
      navigate("/orders");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-20">Loading your cart...</div>;
  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
        <ShoppingBag className="mx-auto text-gray-200 mb-6" size={64} />
        <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Start negotiating some deals to fill it up!</p>
        <Link to="/" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-black text-gray-900 mb-12 uppercase tracking-tight">Your Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-6 items-center">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <ProductImage 
                  src={item.image_url} 
                  alt={item.name}
                  productId={item.product_id}
                  size="small"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-4">
                  {item.category} • Seller: {item.seller_name}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-bold uppercase">Negotiated Price:</span>
                    <span className="text-xl font-black text-indigo-600">₹{item.negotiated_price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight border-b border-gray-100 pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Subtotal</span>
                <span>₹{cart.subtotal.toFixed(2)}</span>
              </div>
              
              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600 font-bold bg-green-50 p-3 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2">
                    <Percent size={14} />
                    <span>Bulk Discount (10%)</span>
                  </div>
                  <span>-₹{cart.discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-2xl font-black text-gray-900 pt-4 border-t border-gray-100">
                <span>Total</span>
                <span>₹{cart.total.toFixed(2)}</span>
              </div>
            </div>

            {cart.discount > 0 && (
              <div className="mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-700 text-xs font-medium flex items-start gap-3">
                <Tag size={16} className="flex-shrink-0 mt-0.5" />
                <p>You've unlocked a 10% bulk discount for ordering 3+ items from the same seller!</p>
              </div>
            )}

            <button 
              onClick={checkout}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"
            >
              Checkout
              <ArrowRight size={20} />
            </button>
            
            <p className="mt-6 text-center text-[10px] text-gray-400 uppercase font-bold tracking-widest">
              Secure Checkout • 24/7 Support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
