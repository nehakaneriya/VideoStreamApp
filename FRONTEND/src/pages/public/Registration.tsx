import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";
import type RegisterData from "@/models/RegisterData";
import { registerUser } from "@/service/Authservice";
import { toast } from "react-toastify";
import { Spinner } from "@/components/ui/spinner";
import Oauth2Buttons from "@/components/layout/Oauth2Buttons";
import OtpModal from "@/components/auth/OtpModal";
import AuthBackground from "@/components/auth/AuthBackground";
import axios from "axios";

export default function Registration() {
  const [data, setData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdFocused, setPwdFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const navigate = useNavigate();

  const requirements = (pw: string) => [
    { ok: pw.length >= 6, label: "Minimum 6 characters" },
    { ok: /[A-Za-z]/.test(pw), label: "At least one letter" },
    { ok: /\d/.test(pw), label: "At least one number" },
    { ok: /[^A-Za-z0-9]/.test(pw), label: "At least one special symbol (@#$%)" },
  ];

  const validatePassword = (pw: string): string | null => {
    if (pw.length < 6) return "At least 6 characters";
    if (!/[A-Za-z]/.test(pw)) return "At least one letter";
    if (!/\d/.test(pw)) return "At least one number";
    if (!/[^A-Za-z0-9]/.test(pw)) return "At least one special symbol (e.g. @#$%)";
    return null;
  };

  const passwordError = data.password ? validatePassword(data.password) : null;

  // Requirements panel sirf tab dikhao jab password field pe focus ho (click ho),
  // ya jab koi error ho ya password me kuch likha ho aur sab requirements poori na hui ho.
  const showRequirements = pwdFocused || !!passwordError;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.name || !data.email || !data.password || !confirmPassword) {
      toast.error("Please fill in all fields ❌");
      return;
    }

    const pwError = validatePassword(data.password);
    if (pwError) {
      toast.error(`Password requirement: ${pwError}`);
      return;
    }

    if (data.password !== confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }

    try {
      setLoading(true);
      await registerUser(data);
      toast.success("Registration Successful! Check your email for OTP 📧");
      // OTP modal register page ke upar khul jayega — background locked rahega
      setShowOtp(true);
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

  const inputBase =
    "w-full pl-10 pr-4 py-3 text-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none transition-all placeholder:text-gray-700 text-white";

  return (
    <div className="h-dvh overflow-hidden flex items-start justify-center text-white px-4 relative">

      {/* Animated gradient background (flat black ki jagah) */}
      <AuthBackground />

      <div className="bg-[#121214]/80 backdrop-blur-xl p-6 sm:p-7 rounded-3xl shadow-2xl w-full max-w-xl border border-white/10 animate-fade-in-up mt-[8vh]">

        {/* Header */}
        <div className="mb-3 text-center">
          <h1 className="text-2xl font-black tracking-tighter">
            Stream<span className="text-red-600">Hub</span>
          </h1>
          <p className="text-gray-500 text-xs mt-0.5 uppercase tracking-widest font-medium">
            Create your account
          </p>
        </div>

        <form className="space-y-2.5" onSubmit={handleRegister}>

          {/* Name */}
          <div>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className={inputBase}
                placeholder="Full name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
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
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                onFocus={() => setPwdFocused(true)}
                onBlur={() => setPwdFocused(false)}
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

            {/* Requirements — password pe click/type karne par hi khulti hai */}
            {showRequirements && (
              <div className="mt-1 rounded-lg border border-gray-700/60 bg-[#0f0f0f]/60 p-2 animate-fade-in-up">
                {requirements(data.password).map((req) => (
                  <div
                    key={req.label}
                    className={`flex items-center gap-2 text-[11px] leading-tight ${
                      req.ok ? "text-green-400" : "text-gray-400"
                    }`}
                  >
                    {req.ok ? (
                      <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                    ) : (
                      <Circle size={12} className="text-gray-500 shrink-0" />
                    )}
                    {req.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputBase} pr-10`}
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition cursor-pointer"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && data.password !== confirmPassword && (
              <p className="text-red-500 text-[11px] mt-1 px-1">⚠️ Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 cursor-pointer hover:bg-red-700 py-2.5 rounded-xl text-base font-bold transition-all shadow-lg shadow-red-600/30 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group"
          >
            {loading ? <Spinner /> : (
              <>
                Register <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* OAuth Section */}
        <Oauth2Buttons />

        <p className="text-center text-gray-500 mt-3 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-white font-bold hover:text-red-500 transition-colors"
          >
            Login
          </Link>
        </p>
      </div>

      {/* OTP modal — register success ke baad, background locked */}
      {showOtp && (
        <OtpModal
          email={data.email}
          onSuccess={() => navigate("/login")}
          onClose={() => setShowOtp(false)}
        />
      )}
    </div>
  );
}