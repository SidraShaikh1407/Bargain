import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSeller, setIsSeller] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { name, email, password, is_seller: isSeller });
      navigate("/login");
    } catch (err: any) {
      setError("Email already exists or invalid input");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
      <p className="text-gray-500 mb-8">Join the community and start bargaining.</p>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 p-4 bg-indigo-50 rounded-lg">
          <input
            type="checkbox"
            id="isSeller"
            className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
            checked={isSeller}
            onChange={(e) => setIsSeller(e.target.checked)}
          />
          <label htmlFor="isSeller" className="text-sm font-medium text-indigo-900">
            Register as a Seller
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
        >
          Create Account
        </button>
      </form>
      
      <p className="mt-8 text-center text-gray-600 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
          Sign in here
        </Link>
      </p>
    </div>
  );
}
