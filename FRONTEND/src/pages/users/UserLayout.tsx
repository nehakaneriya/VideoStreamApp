import { Navigate, Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "@/auth/store";
import { useEffect } from "react";
import { verifySession } from "@/service/Authservice";

// Module-level flag — StrictMode ke double-mount se reset nahi hoga
let sessionVerified = false;

export default function UserLayout() {

  const authStatus = useAuthStore((state) => state.authStatus);
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    // Token abhi restore nahi hua (RootLayout ka refreshToken in-flight) — wait karo
    if (!authStatus || !accessToken) return;

    // Ek baar verify karo per session
    if (sessionVerified) return;
    sessionVerified = true;

    // Backend se verify karo — agar user deleted hai to 401 aayega
    verifySession()
      .catch(() => {
        // 401 aaya — user deleted ya invalid → state clear karo aur login par bhejo
        sessionVerified = false; // next login pe fir verify hoga
        logout();
        navigate("/login", { replace: true });
      });
  }, [authStatus, accessToken, logout, navigate]);

  // Logout pe cleanup
  useEffect(() => {
    return () => {
      if (!useAuthStore.getState().authStatus) {
        sessionVerified = false;
      }
    };
  }, []);

  if (!authStatus) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
}