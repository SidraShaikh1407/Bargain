import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { User } from "../types";

export default function Login({ setUser }: { setUser: (user: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token, user } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      navigate("/");
    } catch (err: any) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
      <p className="text-gray-500 mb-8">Login to start negotiating the best deals.</p>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
        >
          Sign In
        </button>
      </form>
      
      <p className="mt-8 text-center text-gray-600 text-sm">
        Don't have an account?{" "}
        <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
