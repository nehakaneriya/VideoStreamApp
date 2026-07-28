import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Menu, LayoutDashboard, Users, Video, LogOut, MessageSquare, MessageCircle } from "lucide-react";
import useAdminStore from "@/auth/adminStore";
import { adminRefreshToken } from "@/service/Authservice";
import LogoutConfirmModal from "@/components/layout/LogoutConfirmModal";

export default function AdminLayout() {

  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const adminUser = useAdminStore((state) => state.adminUser);
  const adminStatus = useAdminStore((state) => state.adminStatus);
  const adminToken = useAdminStore((state) => state.adminToken);
  const adminLogout = useAdminStore((state) => state.adminLogout);

  const needsRestoring = !!(adminStatus && adminUser && !adminToken);
  const [restoring, setRestoring] = useState(needsRestoring);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    if (needsRestoring) {
      adminRefreshToken()
        .then((res) => {
          useAdminStore.setState({
            adminToken: res.accessToken,
            adminUser: res.user,
            adminStatus: true,
          });
        })
        .catch(() => {
          adminLogout();
        })
        .finally(() => setRestoring(false));
    }
  }, [needsRestoring, adminLogout]);

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await adminLogout();
    window.location.href = "/admin-login";
  };

  if (restoring) {
    return (
      <div className="flex min-h-screen bg-[#0f0f0f] items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!adminStatus || !adminUser) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#0f0f0f] text-white">

      {/* Sidebar */}
      <aside
        className={`bg-[#181818] border-r border-gray-800 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >

        <div className="flex items-center justify-between p-4">
          {!collapsed && (
            <h2 className="text-xl font-bold">
              <span className="text-red-600">Admin</span>
            </h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-300 hover:text-white"
          >
            <Menu />
          </button>
        </div>

        <nav className="mt-6 space-y-2 px-2">

          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600" : "hover:bg-gray-800 text-gray-300"
              }`
            }
          >
            <LayoutDashboard size={20} />
            {!collapsed && "Dashboard"}
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600" : "hover:bg-gray-800 text-gray-300"
              }`
            }
          >
            <Users size={20} />
            {!collapsed && "Users"}
          </NavLink>

          <NavLink
            to="/admin/videos"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600" : "hover:bg-gray-800 text-gray-300"
              }`
            }
          >
            <Video size={20} />
            {!collapsed && "Videos"}
          </NavLink>

          <NavLink
            to="/admin/feedbacks"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600" : "hover:bg-gray-800 text-gray-300"
              }`
            }
          >
            <MessageSquare size={20} />
            {!collapsed && "Feedback"}
          </NavLink>

          <NavLink
            to="/admin/comments"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600" : "hover:bg-gray-800 text-gray-300"
              }`
            }
          >
            <MessageCircle size={20} />
            {!collapsed && "Comments"}
          </NavLink>

          {/* Logout — modal ke saath */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 mt-4 w-full cursor-pointer"
          >
            <LogOut size={20} />
            {!collapsed && "Logout"}
          </button>

        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 transition-all duration-300">
        <Outlet />
      </main>

      {/* Logout Confirm Modal */}
      {showLogoutModal && (
        <LogoutConfirmModal
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

    </div>
  );
}