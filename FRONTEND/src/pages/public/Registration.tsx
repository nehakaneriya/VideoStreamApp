import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import type RegisterData from "@/models/RegisterData";
import { registerUser } from "@/service/Authservice";
import { toast } from "react-toastify";
import { Spinner } from "@/components/ui/spinner";
import Oauth2Buttons from "@/components/layout/Oauth2Buttons";
import axios from "axios";

export default function Registration() {
  const [data, setData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.name || !data.email || !data.password) {
      toast.error("Please fill in all fields ❌");
      return;
    }

    try {
      setLoading(true);
      await registerUser(data);
      toast.success("Registration Successful 🎉");
      navigate("/login");
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Registration Failed ❌";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white px-4">
      
      {/* Glow Effect */}
      <div className="absolute w-64 h-64 bg-red-600/10 rounded-full blur-[100px] -z-10"></div>

      <div className="bg-[#121214] p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/5 backdrop-blur-sm">
        
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tighter">
            Stream<span className="text-red-600">Hub</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-medium">
            Create Account
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleRegister}>
          
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2 ml-1">
              <User size={14} /> Full Name
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none transition-all placeholder:text-gray-700"
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2 ml-1">
              <Mail size={14} /> Email Address
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none transition-all placeholder:text-gray-700"
              placeholder="name@example.com"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2 ml-1">
              <Lock size={14} /> Password
            </label>
            <input
              type="password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none transition-all placeholder:text-gray-700"
              placeholder="Create password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 cursor-pointer hover:bg-red-700 py-4 rounded-2xl text-lg font-bold transition-all shadow-lg shadow-red-600/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <Spinner /> : (
              <>Register <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        {/* OAuth Section */}
        <Oauth2Buttons />

        <p className="text-center text-gray-500 mt-8 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-white font-bold hover:text-red-500 transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}