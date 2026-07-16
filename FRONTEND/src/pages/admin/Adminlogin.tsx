import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAdminStore from "@/auth/adminStore";

export default function Adminlogin() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const adminLogin = useAdminStore((state) => state.adminLogin);
  const adminLoading = useAdminStore((state) => state.adminLoading);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await adminLogin(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Admin login error:", err);
      setError(
        err instanceof Error && err.message === "You are not an admin"
          ? "You are not an admin"
          : "Invalid admin credentials"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
      <div className="bg-[#181818] p-8 rounded-xl w-87.5 border border-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center">
          <span className="text-red-600">Admin</span> Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded bg-[#0f0f0f] border border-gray-700 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-[#0f0f0f] border border-gray-700 focus:outline-none"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={adminLoading}
            className="w-full bg-red-600 hover:bg-red-700 p-2 rounded font-semibold disabled:opacity-60"
          >
            {adminLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}