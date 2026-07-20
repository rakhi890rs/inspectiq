import React from "react";
import { Check, X } from "lucide-react";
import { NOC_STATUS } from "../../utils/nocStatus.js";

const STAGES = [
  { key: NOC_STATUS.SUBMITTED, label: "Submitted" },
  { key: NOC_STATUS.VERIFICATION, label: "Verification" },
  { key: NOC_STATUS.INSPECTION, label: "Inspection" },
  { key: NOC_STATUS.APPROVED, label: "Approval" },
  { key: NOC_STATUS.CERTIFICATE_ISSUED, label: "Certificate Issued" },
];

const StatusTimeline = ({ status }) => {
  if (status === NOC_STATUS.REJECTED) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-danger/5 p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-danger text-white">
          <X size={16} />
        </div>
        <p className="text-sm font-semibold text-danger">Application Rejected</p>
      </div>
    );
  }

  const currentIndex = STAGES.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center">
      {STAGES.map((stage, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <React.Fragment key={stage.key}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  isDone
                    ? "bg-primary text-white"
                    : isCurrent
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {isDone ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={`w-20 text-center text-[11px] font-medium ${
                  isDone || isCurrent ? "text-text" : "text-text-secondary"
                }`}
              >
                {stage.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 ${i < currentIndex ? "bg-primary" : "bg-gray-100"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StatusTimeline;