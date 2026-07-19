import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Wrench,
  ClipboardCheck,
  CalendarDays,
  FileCheck2,
  FolderOpen,
  BadgeCheck,
  BarChart3,
  LineChart,
  Bell,
  Users,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useAuth, ROLES } from "../../context/AuthContext.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/buildings", label: "Buildings", icon: Building2 },
  { to: "/assets", label: "Assets & Safety Equipment", icon: Wrench },
  { to: "/audits", label: "Safety Audits", icon: ClipboardCheck },
  { to: "/calendar", label: "Inspection Calendar", icon: CalendarDays },
  { to: "/noc-applications", label: "NOC Applications", icon: FileCheck2 },
  { to: "/documents", label: "Documents", icon: FolderOpen },
  { to: "/certificates", label: "Certificates", icon: BadgeCheck },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/users", label: "Users", icon: Users, roles: [ROLES.SUPER_ADMIN] },
  { to: "/settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">SafeBuild AI</p>
            <p className="text-[11px] text-gray-400">NOC Management</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white shadow-soft"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <p className="text-[11px] text-gray-500">
            &copy; {new Date().getFullYear()} SafeBuild AI
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;