import React from "react";

const styleMap = {
  // certificate status
  certified: "bg-success/10 text-success",
  pending: "bg-warning/20 text-yellow-700",
  expired: "bg-danger/10 text-danger",
  under_inspection: "bg-blue-100 text-blue-700",
  // risk level
  low: "bg-success/10 text-success",
  medium: "bg-warning/20 text-yellow-700",
  high: "bg-primary/10 text-primary",
  critical: "bg-danger/10 text-danger",
  // inspection status
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  pending_review: "bg-warning/20 text-yellow-700",
  failed: "bg-danger/10 text-danger",
  cancelled: "bg-gray-100 text-gray-600",
  // asset condition
  operational: "bg-success/10 text-success",
  needs_service: "bg-warning/20 text-yellow-700",
  maintenance_scheduled: "bg-blue-100 text-blue-700",
  out_of_service: "bg-gray-200 text-gray-600",
};

const labelMap = {
  certified: "Certified",
  pending: "Pending",
  expired: "Expired",
  under_inspection: "Under Inspection",
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk",
  critical: "Critical Risk",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  pending_review: "Pending Review",
  failed: "Failed",
  cancelled: "Cancelled",
  // asset condition
  operational: "Operational",
  needs_service: "Needs Service",
  maintenance_scheduled: "Maintenance Scheduled",
  out_of_service: "Out of Service",
};

const Badge = ({ value, className = "" }) => {
  if (!value) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        styleMap[value] || "bg-gray-100 text-gray-700"
      } ${className}`}
    >
      {labelMap[value] || value}
    </span>
  );
};

export default Badge;