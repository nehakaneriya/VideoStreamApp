import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react" // Modern icons
import type LoginData from "@/models/LoginData"
import { toast } from "react-toastify"
import { Spinner } from "@/components/ui/spinner"
import useAuthStore from "@/auth/store"
import Oauth2Buttons from "@/components/layout/Oauth2Buttons"
import AuthBackground from "@/components/auth/AuthBackground"
import axios from "axios"

export default function Login() {
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  })

  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState(false)
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
       await login(loginData);
      toast.success("Welcome back!")
      // Normal user login — hamesha UserHome pe jao.
      // Admin panel sirf /admin-login se hi accessible hona chahiye (security),
      // is user ke paas ROLE_ADMIN ho ya na ho, farak nahi padta.
      navigate("/UserHome");
    } catch (error) {
      console.log("Login error:", error);
      const serverMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "";
      const message =
        axios.isAxiosError(error) && error.response?.status === 401
          ? serverMessage || "Invalid credentials"
          : "Server issue, try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full pl-10 pr-4 py-3 text-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none transition-all placeholder:text-gray-700 text-white";

  return (
    <div className="h-dvh overflow-hidden flex items-start justify-center text-white px-4 relative">
      {/* Animated gradient background (flat black ki jagah) */}
      <AuthBackground />

      <div className="bg-[#121214]/80 backdrop-blur-xl p-6 sm:p-7 rounded-3xl shadow-2xl w-full max-w-xl border border-white/10 animate-fade-in-up mt-[5vh]">

        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-black tracking-tighter">Stream<span className="text-red-600">Hub</span></h1>
          <p className="text-gray-500 text-xs mt-0.5 uppercase tracking-widest font-medium">Welcome back</p>
        </div>

        <form className="space-y-3" onSubmit={handleLogin}>

          {/* Email */}
          <div>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                name="email"
                required
                value={loginData.email}
                onChange={handleInputChange}
                className={inputBase}
                placeholder="Email address"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={loginData.password}
                onChange={handleInputChange}
                className={`${inputBase} pr-10`}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-0.5">
            <a href="#" className="text-xs text-red-500 hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl text-base font-bold transition-all shadow-lg shadow-red-600/30 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer group"
          >
            {loading ? <Spinner /> : (
              <>Login <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></>
            )}
          </button>
        </form>

        {error && (
          <div className="text-center text-sm mt-3 font-medium">
            <p className="text-red-500">⚠️ {error}</p>
            {error.toLowerCase().includes("verify") && (
              <button
                type="button"
                onClick={() => navigate("/verify-email", { state: { email: loginData.email } })}
                className="mt-1 text-xs text-red-500 hover:underline cursor-pointer"
              >
                Verify your email
              </button>
            )}
          </div>
        )}

        {/* Social Login Divider */}
        <Oauth2Buttons />

        <p className="text-center text-gray-500 mt-4 text-sm">
          New here? <Link to="/register" className="text-white font-bold hover:text-red-500 transition-colors">Create an account</Link>
        </p>
      </div>
    </div>
  )
}