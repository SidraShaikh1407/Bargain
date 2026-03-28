import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare, Percent, ShieldCheck, TrendingDown, Zap, Package } from "lucide-react";

import { User } from "../types";

export default function Home({ user }: { user: User | null }) {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-indigo-600 px-8 py-20 md:px-16 md:py-32 text-white shadow-2xl shadow-indigo-200">
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tighter">
            Don't just shop. <br />
            <span className="text-indigo-200">Negotiate.</span>
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 mb-10 leading-relaxed font-medium">
            The first e-commerce platform where the price isn't final. 
            Talk to our AI-driven engine and get the best deals on premium products.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/products" 
              className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-xl"
            >
              Start Bargaining
              <ArrowRight size={20} />
            </Link>
            {user ? (
              <Link 
                to={user.is_seller ? "/seller" : "/orders"} 
                className="bg-indigo-500 text-white border-2 border-indigo-400 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-400 transition-all"
              >
                {user.is_seller ? "Seller Dashboard" : "View Your Orders"}
              </Link>
            ) : (
              <Link 
                to="/register" 
                className="bg-indigo-500 text-white border-2 border-indigo-400 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-400 transition-all"
              >
                Join the Community
              </Link>
            )}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute right-20 bottom-10 w-64 h-64 bg-indigo-700 rounded-full blur-3xl opacity-50"></div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-indigo-50 text-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
            <MessageSquare size={28} />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">AI Negotiation</h3>
          <p className="text-gray-500 leading-relaxed">
            Our smart engine understands your offers. If you're close enough to the seller's minimum, you'll get the deal instantly.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-green-50 text-green-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
            <Percent size={28} />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">Bulk Discounts</h3>
          <p className="text-gray-500 leading-relaxed">
            Buying more? Get an extra 10% off automatically when you purchase 3 or more items from the same seller.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-amber-50 text-amber-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck size={28} />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">Secure Trading</h3>
          <p className="text-gray-500 leading-relaxed">
            Every transaction is protected. We ensure both buyers and sellers get a fair deal through our transparent system.
          </p>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white rounded-3xl border border-gray-100 p-12 md:p-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">How Bargain Works</h2>
          <p className="text-gray-500 font-medium">Three simple steps to save more on every purchase.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white border-4 border-indigo-600 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-black mb-6 shadow-lg">1</div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Find a Product</h4>
            <p className="text-sm text-gray-500">Browse our curated selection of premium goods across multiple categories.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white border-4 border-indigo-600 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-black mb-6 shadow-lg">2</div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Make an Offer</h4>
            <p className="text-sm text-gray-500">Enter your best price. Our AI will negotiate with you in real-time.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white border-4 border-indigo-600 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-black mb-6 shadow-lg">3</div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Seal the Deal</h4>
            <p className="text-sm text-gray-500">Once accepted, add to cart and checkout with your negotiated price.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Users", value: "50k+", icon: Zap },
          { label: "Negotiations", value: "1.2M", icon: MessageSquare },
          { label: "Avg. Savings", value: "18%", icon: TrendingDown },
          { label: "Products", value: "10k+", icon: Package },
        ].map((stat, i) => (
          <div key={i} className="bg-indigo-50 p-6 rounded-2xl text-center border border-indigo-100">
            <div className="text-indigo-600 mb-2 flex justify-center">
              <stat.icon size={20} />
            </div>
            <div className="text-2xl font-black text-indigo-900">{stat.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="text-center py-10">
        <h2 className="text-3xl font-black text-gray-900 mb-6 uppercase tracking-tight">Ready to save?</h2>
        <Link 
          to="/products" 
          className="inline-flex bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100"
        >
          Explore All Products
        </Link>
      </section>
    </div>
  );
}
