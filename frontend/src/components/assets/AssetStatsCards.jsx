import React from "react";
import { motion } from "framer-motion";
import {
  Boxes,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  FileWarning,
  CalendarClock,
} from "lucide-react";

const cards = [
  { key: "totalAssets", label: "Total Assets", icon: Boxes, tone: "primary" },
  { key: "operational", label: "Operational", icon: CheckCircle2, tone: "success" },
  { key: "maintenanceDue", label: "Maintenance Due", icon: Wrench, tone: "warning" },
  { key: "critical", label: "Critical Assets", icon: AlertTriangle, tone: "danger" },
  { key: "expiredCertifications", label: "Expired Certifications", icon: FileWarning, tone: "danger" },
  { key: "upcomingInspections", label: "Upcoming Inspections", icon: CalendarClock, tone: "default" },
];

const toneStyles = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/20 text-yellow-700",
  danger: "bg-danger/10 text-danger",
  default: "bg-gray-100 text-gray-700",
};

const AssetStatsCards = ({ stats }) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
    {cards.map(({ key, label, icon: Icon, tone }) => (
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl border border-border bg-card p-4 shadow-card"
      >
        <div className={`inline-flex rounded-lg p-2 ${toneStyles[tone]}`}>
          <Icon size={16} />
        </div>
        <p className="mt-2 text-lg font-bold text-text">{stats?.[key] ?? "—"}</p>
        <p className="text-[11px] text-text-secondary">{label}</p>
      </motion.div>
    ))}
  </div>
);

export default AssetStatsCards;