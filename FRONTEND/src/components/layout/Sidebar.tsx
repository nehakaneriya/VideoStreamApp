import { Link, useLocation } from "react-router-dom";
import { Home, Upload, Video, MessageSquare, X } from "lucide-react";
import useAuthStore from "@/auth/store";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const location = useLocation();
  const authStatus = useAuthStore((state) => state.authStatus);

  const publicMenu = [
    { name: "Home", path: "/", icon: Home },
  ];

  const privateMenu = [
    { name: "Upload Video", path: "/UserHome/upload", icon: Upload },
    { name: "My Videos",    path: "/UserHome",         icon: Video },
    { name: "Feedback",     path: "/UserHome/feedback", icon: MessageSquare },
  ];

  const renderLink = (item: { name: string; path: string; icon: typeof Home }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onClose}
        className={`flex items-center gap-4 text-lg p-3 rounded-xl transition ${
          isActive ? "bg-red-600 text-white" : "hover:bg-gray-800"
        }`}
      >
        <Icon className="w-6 h-6" />
        {item.name}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen lg:min-h-screen w-64 bg-[#0f0f0f] text-gray-300 p-5 space-y-2 border-r border-gray-800 z-40 transition-transform duration-300 overflow-y-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-2 lg:hidden">
          <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">Menu</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Public */}
        {publicMenu.map(renderLink)}

        {/* Private */}
        {authStatus && privateMenu.map(renderLink)}
      </aside>
    </>
  );
}