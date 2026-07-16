import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Mail, Lock,ArrowRight } from "lucide-react" // Modern icons
import type LoginData from "@/models/LoginData"
import { toast } from "react-toastify"
import { Spinner } from "@/components/ui/spinner"
import useAuthStore from "@/auth/store"
import Oauth2Buttons from "@/components/layout/Oauth2Buttons"
import axios from "axios"

export default function Login() {
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  })

  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("") // clear previous error on new attempt

    if (loginData.email.trim() === "" || loginData.password.trim() === "") {
      toast.error("Please fill in all fields");
      return
    }

    try {
      setLoading(true)
       const response = await login(loginData);
      toast.success("Welcome back!")
      const isAdmin = response.user.roles?.some(
         (r) => r.name === "ROLE_ADMIN"
     );
    if (isAdmin) {
    navigate("/admin/dashboard");
  } else {
    navigate("/UserHome");
  }
    } catch (error) {
      console.log("Login error:", error);
      const message =
        axios.isAxiosError(error) && error.response?.status === 401
          ? "Invalid credentials"
          : "Server issue, try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }
 

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white px-4">
      {/* Glow Effect behind the card */}
      <div className="absolute w-64 h-64 bg-red-600/10 rounded-full blur-[100px] -z-10"></div>

      <div className="bg-[#121214] p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/5 backdrop-blur-sm">
        
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tighter">Stream<span className="text-red-600">Hub</span></h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-medium">User Authentication</p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2 ml-1">
              <Mail size={14} /> Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={loginData.email}
                onChange={handleInputChange}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none transition-all placeholder:text-gray-700"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Lock size={14} /> Password
              </label>
              <a href="#" className="text-xs text-red-500 hover:underline">Forgot?</a>
            </div>
            <input
              type="password"
              name="password"
              required
              value={loginData.password}
              onChange={handleInputChange}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none transition-all placeholder:text-gray-700"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-2xl text-lg font-bold transition-all shadow-lg shadow-red-600/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Spinner /> : (
              <>Login <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        {error && <p className="text-red-500 text-center text-sm mt-4 font-medium">⚠️ {error}</p>}

        {/* Social Login Divider */}
        <Oauth2Buttons />
        
        <p className="text-center text-gray-500 mt-8 text-sm">
          New here? <Link to="/register" className="text-white font-bold hover:text-red-500 transition-colors">Create an account</Link>
        </p>
      </div>
    </div>
  )
}