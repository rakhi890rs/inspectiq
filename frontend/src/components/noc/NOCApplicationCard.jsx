import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Building2, UserCog, CalendarDays, ArrowRight } from "lucide-react";
import Badge from "../ui/Badge.jsx";

const typeLabels = { new: "New", renewal: "Renewal", modification: "Modification" };

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—";

const NOCApplicationCard = ({ application }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
    className="rounded-2xl border border-border bg-card p-5 shadow-card"
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
          <Building2 size={20} />
        </div>
        <div>
          <Link to={`/noc-applications/${application._id}`} className="text-sm font-bold text-text hover:underline">
            {application.building?.name || "Unknown building"}
          </Link>
          <p className="text-xs text-text-secondary">
            {application.applicationNumber} · {typeLabels[application.applicationType] || "New"}
          </p>
        </div>
      </div>
      <Badge value={application.status} />
    </div>

    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-secondary">
      <span className="flex items-center gap-1.5">
        <UserCog size={14} /> {application.applicant?.name || "Unknown"}
      </span>
      <span className="flex items-center gap-1.5">
        <CalendarDays size={14} /> {formatDate(application.submittedAt)}
      </span>
    </div>

    {application.assignedInspector && (
      <p className="mt-2 text-xs text-text-secondary">
        Inspector: <span className="font-medium text-text">{application.assignedInspector.name}</span>
      </p>
    )}

    <Link
      to={`/noc-applications/${application._id}`}
      className="mt-4 flex items-center justify-end gap-1 text-sm font-semibold text-primary hover:underline"
    >
      View Timeline <ArrowRight size={14} />
    </Link>
  </motion.div>
);

export default NOCApplicationCard;