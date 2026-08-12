import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import useAuthStore from "@/auth/store";
import { verifySession } from "@/service/Authservice";
import LogoutConfirmModal from "@/components/layout/LogoutConfirmModal";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {

  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useAuthStore((state) => state.user);

  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [lastSearch, setLastSearch] = useState("");

  // Keep search box synced with URL (adjust state during render — React recommended)
  const urlSearch = new URLSearchParams(location.search).get("search") || "";
  if (urlSearch !== lastSearch) {
    setLastSearch(urlSearch);
    setSearch(urlSearch);
  }

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
    setMobileSearchOpen(false);

  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    setOpen(false);
    useAuthStore.getState().logout();
    navigate("/");

  };

  return (

    <header className="flex items-center justify-between gap-2 px-3 sm:px-6 py-3 bg-[#0f0f0f] border-b border-gray-800 relative z-10">

      {/* Mobile sidebar toggle */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition cursor-pointer shrink-0"
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>
      )}

      {/* Logo */}

      <Link
        to="/"
        className="text-lg sm:text-xl font-bold shrink-0 tracking-tight"
      >
        <span className="text-red-600">
          Stream
        </span>
        Hub
      </Link>

      {/* Search — desktop/tablet */}

      <div className="hidden sm:flex items-center flex-1 max-w-md mx-auto">

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

          className="w-full px-4 py-2 bg-[#181818] border border-gray-700 rounded-l-full text-white focus:outline-none focus:border-red-600 transition-colors"

        />

        <button

          onClick={handleSearch}

          className="px-5 py-2 bg-[#222] border border-gray-700 rounded-r-full hover:bg-[#333] transition cursor-pointer"

        >

          <Search size={18} />

        </button>

      </div>

      {/* Search — mobile icon trigger */}
      <button
        onClick={() => setMobileSearchOpen((v) => !v)}
        className="sm:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition cursor-pointer ml-auto"
        aria-label="Search"
      >
        {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
      </button>

      {/* Right Side */}

      <div className="flex items-center gap-2 sm:gap-4 relative">

        {authStatus ? (

          <>

            <button
              onClick={() => navigate("/UserHome/upload")}
              className="hidden sm:inline-flex px-4 py-2 bg-red-600 rounded-full hover:bg-red-500 transition text-sm font-medium cursor-pointer"
            >

              Upload

            </button>
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-base sm:text-lg hover:scale-105 transition cursor-pointer"
              >
                {user?.name?.charAt(0).toUpperCase()}
              </button>
              {open && (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] w-64 max-w-[90vw] bg-[#181818] border border-gray-700 rounded-xl shadow-2xl p-3 space-y-2 z-50">

                  <div className="border-b border-gray-700 pb-2">
                    <p className="text-white font-semibold">
                      {user?.name}
                    </p>
                    <p className="text-gray-400 text-sm truncate">
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
                    className="block px-3 py-2 rounded-lg hover:bg-gray-700 transition sm:hidden"
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
            className="px-3 sm:px-4 py-2 bg-red-600 rounded-full hover:bg-red-500 transition text-sm sm:text-base"
          >

            Sign In

          </Link>

        )}

      </div>

      {/* Mobile search bar — expands below header */}
      {mobileSearchOpen && (
        <div className="absolute left-0 right-0 top-full sm:hidden flex items-center px-3 py-3 bg-[#0f0f0f] border-b border-gray-800 z-40">
          <input
            type="text"
            autoFocus
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
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
      )}

      {showLogoutModal && (

        <LogoutConfirmModal

          onConfirm={handleLogoutConfirm}

          onCancel={() => setShowLogoutModal(false)}

        />

      )}

    </header>

  );

}