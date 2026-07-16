import { Outlet } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { useEffect, useRef, useState } from "react";
import { refreshToken } from "@/service/Authservice";
import useAuthStore from "@/auth/store";

export default function RootLayout() {

  const authStatus = useAuthStore((state) => state.authStatus);
  const accessToken = useAuthStore((state) => state.accessToken);
  const changeLocalLoginData = useAuthStore((state) => state.changeLocalLoginData);
  const logout = useAuthStore((state) => state.logout);
  const hasFetched = useRef(false);

  // Page refresh pe authStatus true hai lekin accessToken null hoga (persist nahi hota)
  // Tab tak koi bhi child route render na ho — warna bina token API calls jaayenge aur 401 aayega
  const needsRestoring = !!(authStatus && !accessToken);
  const [restoring, setRestoring] = useState(needsRestoring);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    if (needsRestoring) {
      refreshToken()
        .then((res) => {
          changeLocalLoginData(res.accessToken, res.user, true);
        })
        .catch(() => {
          // Refresh fail — user deleted hai ya cookie expire — force logout
          logout();
        })
        .finally(() => setRestoring(false));
    } else {
      // Koi restore nahi karna (logged out ya token pehle se hai)
      setRestoring(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Jab tak token restore ho raha hai, spinner dikhao — Outlet mat render karo
  if (restoring) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}