import React from "react";
import { FileCheck2, Plus } from "lucide-react";

const NOCApplicationsEmptyState = ({ onCreate }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
    <div className="rounded-full bg-primary/10 p-4 text-primary">
      <FileCheck2 size={28} />
    </div>
    <h3 className="mt-4 text-lg font-bold text-text">No NOC Applications Yet</h3>
    <p className="mt-1 max-w-sm text-sm text-text-secondary">
      Submit your first No Objection Certificate application for a registered building.
    </p>
    <button
      onClick={onCreate}
      className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
    >
      <Plus size={16} /> Apply for NOC
    </button>
  </div>
);

export default NOCApplicationsEmptyState;