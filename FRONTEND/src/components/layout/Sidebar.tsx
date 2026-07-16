import { Link, useLocation } from "react-router-dom";
import { Home, Upload, Video, MessageSquare } from "lucide-react";
import useAuthStore from "@/auth/store";

export default function Sidebar() {
  const location = useLocation();
  const authStatus = useAuthStore((state) => state.authStatus);

  const publicMenu = [
    { name: "Home", path: "/", icon: Home },
  ];

  const privateMenu = [
    { name: "Upload Video", path: "/UserHome/upload", icon: Upload },
    { name: "My Videos",    path: "/UserHome/myvideos", icon: Video },
    { name: "Feedback",     path: "/UserHome/feedback", icon: MessageSquare },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#0f0f0f] text-gray-300 p-5 space-y-2 border-r border-gray-800">

      {/* Public */}
      {publicMenu.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 text-lg p-3 rounded-xl transition ${
              isActive ? "bg-red-600 text-white" : "hover:bg-gray-800"
            }`}
          >
            <Icon className="w-6 h-6" />
            {item.name}
          </Link>
        );
      })}

      {/* Private */}
      {authStatus &&
        privateMenu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 text-lg p-3 rounded-xl transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-gray-800"
              }`}
            >
              <Icon className="w-6 h-6" />
              {item.name}
            </Link>
          );
        })}
    </aside>
  );
}