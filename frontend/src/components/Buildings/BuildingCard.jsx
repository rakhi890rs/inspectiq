import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Building2,
  Layers,
  DoorOpen,
  Users,
  ShieldCheck,
  AlertTriangle,
  CalendarClock,
  MoreVertical,
  Eye,
  Pencil,
  CalendarPlus,
  UploadCloud,
  FileCheck2,
  FileBarChart,
  Trash2,
  Star,
} from "lucide-react";
import Badge from "../ui/Badge.jsx";

const riskBarColor = {
  low: "bg-success",
  medium: "bg-warning",
  high: "bg-primary",
  critical: "bg-danger",
};

const typeLabels = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
  hospital: "Hospital",
  school: "School",
  government: "Government",
};

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—";

const Stat = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
    <Icon size={14} className="text-text-secondary" />
    <span className="font-medium text-text">{value}</span>
    <span>{label}</span>
  </div>
);

const BuildingCard = ({ building, onToggleFavorite, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const compliance = Math.max(0, 100 - (building.riskScore || 0));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative flex h-[260px] flex-col rounded-2xl border border-border bg-card p-5 shadow-card"
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
          <Building2 size={20} />
        </div>
        <div className="flex items-center gap-2">
          <Badge value={building.certificateStatus} />
          <button
            onClick={() => onToggleFavorite(building)}
            aria-label="Bookmark building"
            className="text-text-secondary hover:text-primary"
          >
            <Star
              size={18}
              className={building.isFavorite ? "fill-primary text-primary" : ""}
            />
          </button>
        </div>
      </div>

      {/* Middle */}
      <Link to={`/buildings/${building._id}`} className="mt-3 block">
        <h3 className="truncate text-sm font-bold text-text">{building.name}</h3>
        <p className="mt-0.5 truncate text-xs text-text-secondary">
          {[building.address?.line1, building.address?.city].filter(Boolean).join(", ") || "No address on file"}
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          Owner: <span className="font-medium text-text">{building.owner?.name || "—"}</span>
          {"  ·  "}
          {typeLabels[building.type] || building.type}
        </p>
      </Link>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
        <Stat icon={Layers} label="floors" value={building.numberOfFloors ?? "—"} />
        <Stat icon={DoorOpen} label="exits" value={building.emergencyExits ?? "—"} />
        <Stat icon={Users} label="occupancy" value={building.occupancy ?? "—"} />
        <Stat icon={CalendarClock} label="" value={formatDate(building.lastInspectionDate)} />
      </div>

      {/* Risk + compliance bar */}
      <div className="mt-auto space-y-2 pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-text-secondary">
            <span className={`h-2 w-2 rounded-full ${riskBarColor[building.riskLevel] || "bg-gray-300"}`} />
            {building.riskLevel ? `${building.riskLevel[0].toUpperCase()}${building.riskLevel.slice(1)} risk` : "Risk unknown"}
          </span>
          <span className="font-semibold text-text">{compliance}% compliant</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${riskBarColor[building.riskLevel] || "bg-gray-300"}`}
            style={{ width: `${compliance}%` }}
          />
        </div>
      </div>

      {/* Hover actions */}
      <div className="pointer-events-none absolute inset-x-5 bottom-5 flex translate-y-2 items-center justify-end gap-1 opacity-0 transition-all group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-lg border border-border bg-card p-1.5 text-text-secondary shadow-soft hover:bg-surface"
            aria-label="More actions"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute bottom-9 right-0 z-10 w-52 rounded-xl border border-border bg-card py-1 shadow-card">
              <MenuItem icon={Eye} label="View Details" to={`/buildings/${building._id}`} />
              <MenuItem icon={Pencil} label="Edit" />
              <MenuItem icon={CalendarPlus} label="Schedule Inspection" />
              <MenuItem icon={UploadCloud} label="Upload Documents" />
              <MenuItem icon={FileCheck2} label="Apply NOC" />
              <MenuItem icon={FileBarChart} label="Generate Report" />
              <div className="my-1 border-t border-border" />
              <MenuItem
                icon={Trash2}
                label="Delete"
                danger
                onClick={() => onDelete(building)}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MenuItem = ({ icon: Icon, label, to, onClick, danger }) => {
  const className = `flex w-full items-center gap-2 px-3.5 py-2 text-sm ${
    danger ? "text-danger hover:bg-danger/5" : "text-text hover:bg-surface"
  }`;
  if (to) {
    return (
      <Link to={to} className={className}>
        <Icon size={15} /> {label}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={className}>
      <Icon size={15} /> {label}
    </button>
  );
};

export default BuildingCard;