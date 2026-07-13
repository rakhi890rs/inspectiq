import React from "react";
import { motion } from "framer-motion";

const toneStyles = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
  warning: "bg-warning/10 text-yellow-700",
  default: "bg-gray-100 text-gray-700",
};

const StatCard = ({ label, value, icon: Icon, tone = "default", trend }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="mt-1 text-2xl font-bold text-text">{value}</p>
          {trend && (
            <p
              className={`mt-1 text-xs font-medium ${
                trend.startsWith("-") ? "text-danger" : "text-success"
              }`}
            >
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`rounded-xl p-2.5 ${toneStyles[tone]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
