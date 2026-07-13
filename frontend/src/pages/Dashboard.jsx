import React from "react";
import { useQuery } from "react-query";
import {
  Building2,
  ClipboardList,
  BadgeCheck,
  XCircle,
  Percent,
  CalendarClock,
  ShieldAlert,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import StatCard from "../components/ui/StatCard.jsx";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const monthlyAudits = [
  { month: "Feb", audits: 32 },
  { month: "Mar", audits: 41 },
  { month: "Apr", audits: 38 },
  { month: "May", audits: 52 },
  { month: "Jun", audits: 47 },
  { month: "Jul", audits: 60 },
];

const riskDistribution = [
  { name: "Low", value: 52, color: "#22C55E" },
  { name: "Medium", value: 28, color: "#FACC15" },
  { name: "High", value: 14, color: "#F97316" },
  { name: "Critical", value: 6, color: "#EF4444" },
];

const fetchStats = async () => {
  const { data } = await api.get("/dashboard/stats");
  return data.stats;
};

const Dashboard = () => {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery("dashboard-stats", fetchStats, {
    // Falls back gracefully if the backend isn't running yet during setup
    onError: () => {},
  });

  const cards = [
    {
      label: "Total Buildings",
      value: stats?.totalBuildings ?? "—",
      icon: Building2,
      tone: "primary",
    },
    {
      label: "Pending Audits",
      value: stats?.pendingAudits ?? "—",
      icon: ClipboardList,
      tone: "warning",
    },
    {
      label: "Approved NOCs",
      value: stats?.approvedNOCs ?? "—",
      icon: BadgeCheck,
      tone: "success",
    },
    {
      label: "Rejected NOCs",
      value: stats?.rejectedNOCs ?? "—",
      icon: XCircle,
      tone: "danger",
    },
    {
      label: "Compliance %",
      value: stats ? `${stats.compliancePercentage}%` : "—",
      icon: Percent,
      tone: "primary",
    },
    {
      label: "Today's Inspections",
      value: stats?.todaysInspections ?? "—",
      icon: CalendarClock,
      tone: "default",
    },
    {
      label: "Certificates Expiring Soon",
      value: stats?.expiringCertificates ?? "—",
      icon: ShieldAlert,
      tone: "danger",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text sm:text-2xl">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Here's what's happening across your buildings today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <h3 className="text-sm font-semibold text-text">Monthly Audits</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyAudits}>
                <defs>
                  <linearGradient id="auditsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="audits"
                  stroke="#F97316"
                  strokeWidth={2}
                  fill="url(#auditsFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold text-text">Building Risk Distribution</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {riskDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={24} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {isLoading && (
        <p className="text-xs text-text-secondary">Loading live stats from the API...</p>
      )}
    </div>
  );
};

export default Dashboard;
