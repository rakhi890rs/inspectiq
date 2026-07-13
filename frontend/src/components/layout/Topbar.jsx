import React, { useState } from "react";
import { Menu, Search, Bell, ChevronDown, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const roleLabels = {
  super_admin: "Super Admin",
  auditor: "Government Auditor",
  owner: "Building Owner",
};

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:px-6">
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-text-secondary hover:bg-surface lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 sm:flex">
          <Search size={16} className="text-text-secondary" />
          <input
            type="text"
            placeholder="Search buildings, owners, certificates..."
            className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-secondary"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="relative rounded-lg p-2 text-text-secondary hover:bg-surface"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold leading-tight">{user?.name}</p>
              <p className="text-xs text-text-secondary">{roleLabels[user?.role]}</p>
            </div>
            <ChevronDown size={16} className="text-text-secondary" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card py-1 shadow-card">
              <a
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-surface"
              >
                <Settings size={16} /> Settings
              </a>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-surface"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
