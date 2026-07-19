import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Building2,
  UserCog,
  CalendarDays,
  MoreVertical,
  Eye,
  PlayCircle,
  Pencil,
  UserPlus,
  FileBarChart,
  Download,
  CalendarPlus,
  UploadCloud,
  Trash2,
} from "lucide-react";
import Badge from "../ui/Badge.jsx";

const typeLabels = {
  routine: "Routine",
  emergency: "Emergency",
  annual: "Annual",
  follow_up: "Follow-up",
};

const scoreColor = (score) => {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-warning";
  if (score >= 50) return "text-primary";
  return "text-danger";
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : "—";

const InspectionCard = ({ audit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = audit.checklistProgress || { completed: 0, total: 0 };
  const progressPct = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <Building2 size={20} />
          </div>
          <div>
            <Link to={`/audits/${audit._id}`} className="text-sm font-bold text-text hover:underline">
              {audit.building?.name || "Unknown building"}
            </Link>
            <p className="text-xs text-text-secondary">
              INS-{audit._id?.slice(-6).toUpperCase()} · {typeLabels[audit.inspectionType] || "Routine"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge value={audit.status} />
        </div>
      </div>

      <p className="mt-3 truncate text-xs text-text-secondary">
        {[audit.building?.address?.line1, audit.building?.address?.city].filter(Boolean).join(", ") || "No address on file"}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <UserCog size={14} /> {audit.auditor?.name || "Unassigned"}
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays size={14} /> {formatDate(audit.scheduledDate)}
        </span>
      </div>

      {/* Checklist progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">Checklist completed</span>
          <span className="font-medium text-text">
            {progress.completed} / {progress.total || 0} items
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Risk + score */}
      <div className="mt-4 flex items-center justify-between">
        <Badge value={audit.riskLevel} />
        <div className="text-right">
          <p className={`text-lg font-bold ${scoreColor(audit.overallScore || 0)}`}>
            {audit.overallScore ?? "—"}
          </p>
          <p className="text-[10px] text-text-secondary">Safety score</p>
        </div>
      </div>

      {/* Hover actions */}
      <div className="pointer-events-none absolute right-4 top-4 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-lg border border-border bg-card p-1.5 text-text-secondary shadow-soft hover:bg-surface"
            aria-label="More actions"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-10 w-56 rounded-xl border border-border bg-card py-1 shadow-card">
              <MenuItem icon={Eye} label="View Details" to={`/audits/${audit._id}`} />
              <MenuItem icon={PlayCircle} label="Continue Inspection" to={`/audits/${audit._id}`} />
              <MenuItem icon={Pencil} label="Edit" />
              <MenuItem icon={UserPlus} label="Assign Inspector" />
              <MenuItem icon={FileBarChart} label="Generate Report" />
              <MenuItem icon={Download} label="Download PDF" />
              <MenuItem icon={CalendarPlus} label="Schedule Reinspection" />
              <MenuItem icon={UploadCloud} label="Upload Evidence" />
              <div className="my-1 border-t border-border" />
              <MenuItem icon={Trash2} label="Delete" danger onClick={() => onDelete(audit)} />
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

export default InspectionCard;