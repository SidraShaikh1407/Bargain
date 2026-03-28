import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { User } from "./types";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/Cart";
import OrdersPage from "./pages/Orders";
import SellerDashboard from "./pages/SellerDashboard";
import { ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, Package } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-tight">
                BARGAIN
              </Link>
              
              <div className="flex items-center gap-6">
                <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium">
                  Home
                </Link>
                <Link to="/products" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2">
                  <Package size={18} />
                  Products
                </Link>
                
                {user ? (
                  <>
                    {user.is_seller && (
                      <Link to="/seller" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2">
                        <LayoutDashboard size={18} />
                        Seller Dashboard
                      </Link>
                    )}
                    <Link to="/cart" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2">
                      <ShoppingCart size={18} />
                      Cart
                    </Link>
                    <Link to="/orders" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2">
                      Orders
                    </Link>
                    <div className="flex items-center gap-4 border-l pl-6 border-gray-200">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <UserIcon size={14} />
                        {user.name}
                      </span>
                      <button 
                        onClick={logout}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Logout"
                      >
                        <LogOut size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-4">
                    <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium">
                      Login
                    </Link>
                    <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
            <Route path="/products/:id" element={<ProductDetail user={user} />} />
            <Route path="/cart" element={user ? <CartPage /> : <Navigate to="/login" />} />
            <Route path="/orders" element={user ? <OrdersPage /> : <Navigate to="/login" />} />
            <Route path="/seller" element={user?.is_seller ? <SellerDashboard /> : <Navigate to="/" />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            &copy; 2026 Bargain Negotiation E-Commerce. Built for smart shoppers.
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
