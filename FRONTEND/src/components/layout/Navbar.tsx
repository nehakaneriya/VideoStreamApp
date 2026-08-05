import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import useAuthStore from "@/auth/store";
import { verifySession } from "@/service/Authservice";
import LogoutConfirmModal from "@/components/layout/LogoutConfirmModal";

export default function Navbar() {

  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useAuthStore((state) => state.user);

  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [search, setSearch] = useState("");

  // Keep search box synced with URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
  }, [location.search]);

  // Verify session
  useEffect(() => {

    if (
      !authStatus ||
      !user?.email ||
      !useAuthStore.getState().accessToken
    ) {
      return;
    }

    const verifyUser = async () => {
      try {
        await verifySession();
      } catch {
        useAuthStore.getState().logout();
        navigate("/login");
      }
    };

    const timeout = setTimeout(verifyUser, 5000);

    const interval = setInterval(verifyUser, 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };

  }, [authStatus, user?.email, navigate]);

  const handleSearch = () => {

    const keyword = search.trim();

    if (!keyword) {
      navigate("/");
      return;
    }

    navigate(`/?search=${encodeURIComponent(keyword)}`);

  };

  const handleLogoutConfirm = () => {

    setShowLogoutModal(false);

    setOpen(false);

    useAuthStore.getState().logout();

    navigate("/");

  };

  return (

    <header className="flex items-center justify-between px-6 py-3 bg-[#0f0f0f] border-b border-gray-800 relative">

      {/* Logo */}

      <Link
        to="/"
        className="text-xl font-bold"
      >
        <span className="text-red-600">
          Video
        </span>
        Stream
      </Link>

      {/* Search */}

      <div className="flex items-center w-[400px]">

        <input

          type="text"

          placeholder="Search videos..."

          value={search}

          onChange={(e) => setSearch(e.target.value)}

          onKeyDown={(e) => {

            if (e.key === "Enter") {

              handleSearch();

            }

          }}

          className="w-full px-4 py-2 bg-[#181818] border border-gray-700 rounded-l-full text-white focus:outline-none focus:border-red-600"

        />

        <button

          onClick={handleSearch}

          className="px-5 py-2 bg-[#222] border border-gray-700 rounded-r-full hover:bg-[#333] transition cursor-pointer"

        >

          <Search size={18} />

        </button>

      </div>

      {/* Right Side */}

      <div className="flex items-center gap-4 relative">

        {authStatus ? (

          <>

            <button

              onClick={() => navigate("/UserHome/upload")}

              className="px-4 py-2 bg-red-600 rounded-full hover:bg-red-500 transition text-sm font-medium cursor-pointer"

            >

              Upload

            </button>

            <div className="relative">

              <button

                onClick={() => setOpen(!open)}

                className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg hover:scale-105 transition cursor-pointer"

              >

                {user?.name?.charAt(0).toUpperCase()}

              </button>

              {open && (

                <div className="absolute right-0 mt-3 w-64 bg-[#181818] border border-gray-700 rounded-xl shadow-xl p-3 space-y-2 z-50">

                  <div className="border-b border-gray-700 pb-2">

                    <p className="text-white font-semibold">

                      {user?.name}

                    </p>

                    <p className="text-gray-400 text-sm">

                      {user?.email}

                    </p>

                  </div>

                  <Link

                    to="/UserHome/profile"

                    onClick={() => setOpen(false)}

                    className="block px-3 py-2 rounded-lg hover:bg-gray-700 transition"

                  >

                    Profile

                  </Link>

                  <Link

                    to="/UserHome/upload"

                    onClick={() => setOpen(false)}

                    className="block px-3 py-2 rounded-lg hover:bg-gray-700 transition"

                  >

                    Upload Video

                  </Link>

                  <Link

                    to="/UserHome"

                    onClick={() => setOpen(false)}

                    className="block px-3 py-2 rounded-lg hover:bg-gray-700 transition"

                  >

                    Dashboard

                  </Link>

                  <button

                    onClick={() => {

                      setOpen(false);

                      setShowLogoutModal(true);

                    }}

                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 transition text-red-500 cursor-pointer"

                  >

                    Logout

                  </button>

                </div>

              )}

            </div>

          </>

        ) : (

          <Link

            to="/login"

            className="px-4 py-2 bg-red-600 rounded-full hover:bg-red-500 transition"

          >

            Sign In

          </Link>

        )}

      </div>

      {showLogoutModal && (

        <LogoutConfirmModal

          onConfirm={handleLogoutConfirm}

          onCancel={() => setShowLogoutModal(false)}

        />

      )}

    </header>

  );

}