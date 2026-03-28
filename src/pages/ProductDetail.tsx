import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Product, User } from "../types";
import { ArrowLeft, MessageSquare, ShoppingCart, CheckCircle, XCircle, RefreshCw, Star, Box } from "lucide-react";
import { ProductImage } from "../components/ProductImage";

export default function ProductDetail({ user }: { user: User | null }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState("");
  const [negotiationResult, setNegotiationResult] = useState<{ status: string; suggested_price: number | null } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`).then(setProduct).finally(() => setLoading(false));
  }, [id]);

  const handleNegotiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    
    setSubmitting(true);
    try {
      const result = await api.post("/negotiate", {
        product_id: Number(id),
        user_offer: Number(offer)
      });
      setNegotiationResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const addToCart = async (price: number) => {
    if (!user) return navigate("/login");
    try {
      await api.post("/cart", {
        product_id: Number(id),
        negotiated_price: price
      });
      navigate("/cart");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-20">Loading product details...</div>;
  if (!product) return <div className="text-center py-20">Product not found.</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 transition-colors">
        <ArrowLeft size={18} />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        {/* Product Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
          <ProductImage 
            src={product.image_url} 
            alt={product.name}
            productId={product.id}
            size="large"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                {product.category}
              </span>
              <div className="flex items-center gap-2">
                {product.stock_count > 0 ? (
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${product.stock_count <= 5 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                    {product.stock_count} In Stock
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-red-100 text-red-600">
                    Sold Out
                  </span>
                )}
              </div>
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-500 flex items-center gap-1 text-sm">
                Sold by <span className="font-bold text-gray-900">{product.seller_name}</span>
              </p>
              {product.seller_rating && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                  <Star size={12} fill="currentColor" />
                  {product.seller_rating} Seller Rating
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 font-medium">Original Price</span>
              <span className="text-3xl font-black text-gray-900">₹{product.base_price}</span>
            </div>
            <div className="text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 flex items-center gap-2">
              <MessageSquare size={14} />
              This seller is open to negotiation!
            </div>
          </div>

          {/* Negotiation Section */}
          <div className="space-y-6">
            {product.stock_count > 0 ? (
              !negotiationResult ? (
              <form onSubmit={handleNegotiate} className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">Make an Offer</label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      placeholder="Enter your price"
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-lg"
                      value={offer}
                      onChange={(e) => setOffer(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100 flex items-center gap-2"
                  >
                    {submitting ? "Negotiating..." : "Negotiate"}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                  Tip: Offers within 5% of the base price might get a counter-offer.
                </p>
              </form>
            ) : (
              <div className={`p-6 rounded-2xl border ${
                negotiationResult.status === 'accepted' ? 'bg-green-50 border-green-100 text-green-900' :
                negotiationResult.status === 'counter_offer' ? 'bg-amber-50 border-amber-100 text-amber-900' :
                'bg-red-50 border-red-100 text-red-900'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {negotiationResult.status === 'accepted' && <CheckCircle className="text-green-600" />}
                  {negotiationResult.status === 'counter_offer' && <RefreshCw className="text-amber-600" />}
                  {negotiationResult.status === 'rejected' && <XCircle className="text-red-600" />}
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    {negotiationResult.status === 'accepted' ? "Offer Accepted!" :
                     negotiationResult.status === 'counter_offer' ? "Counter Offer" :
                     "Offer Rejected"}
                  </h3>
                </div>

                {negotiationResult.status === 'accepted' && (
                  <>
                    <p className="mb-6 opacity-80">Great deal! Your offer of <span className="font-bold">₹{offer}</span> has been accepted.</p>
                    <button
                      onClick={() => addToCart(Number(offer))}
                      className="w-full bg-green-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                    >
                      <ShoppingCart size={20} />
                      Add to Cart at ₹{offer}
                    </button>
                  </>
                )}

                {negotiationResult.status === 'counter_offer' && (
                  <>
                    <p className="mb-6 opacity-80">Your offer was a bit low. The seller suggests <span className="font-bold">₹{negotiationResult.suggested_price}</span> instead.</p>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => addToCart(negotiationResult.suggested_price!)}
                        className="w-full bg-amber-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-amber-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-100"
                      >
                        <ShoppingCart size={20} />
                        Accept & Add to Cart
                      </button>
                      <button
                        onClick={() => setNegotiationResult(null)}
                        className="text-amber-700 font-bold text-sm hover:underline"
                      >
                        Try another offer
                      </button>
                    </div>
                  </>
                )}

                {negotiationResult.status === 'rejected' && (
                  <>
                    <p className="mb-6 opacity-80">Your offer of <span className="font-bold">₹{offer}</span> was too low for this item. Please try a higher amount.</p>
                    <button
                      onClick={() => setNegotiationResult(null)}
                      className="w-full bg-red-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                    >
                      Try Again
                    </button>
                  </>
                )}
              </div>
            )) : (
              <div className="p-8 bg-gray-50 rounded-3xl border-2 border-gray-200 text-center space-y-4">
                <Box className="mx-auto text-gray-300" size={48} />
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Currently Unavailable</h3>
                <p className="text-gray-500 text-sm font-medium">This product is out of stock. Check back later or browse similar items.</p>
                <Link to="/products" className="inline-block text-indigo-600 font-black uppercase tracking-widest text-xs hover:underline">
                  Browse Other Products
                </Link>
              </div>
            )}
            
            <div className="pt-8 border-t border-gray-100">
              <button
                onClick={() => addToCart(product.base_price)}
                disabled={product.stock_count === 0}
                className="w-full border-2 border-gray-200 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Buy Now at Full Price (₹{product.base_price})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
