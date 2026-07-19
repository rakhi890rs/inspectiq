import React from "react";
import { Wrench, Plus } from "lucide-react";

const AssetsEmptyState = ({ onRegister }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
    <div className="rounded-full bg-primary/10 p-4 text-primary">
      <Wrench size={28} />
    </div>
    <h3 className="mt-4 text-lg font-bold text-text">No Safety Equipment Registered</h3>
    <p className="mt-1 max-w-sm text-sm text-text-secondary">
      Register your first piece of safety equipment to start tracking inspections, maintenance, and compliance.
    </p>
    <button
      onClick={onRegister}
      className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
    >
      <Plus size={16} /> Register Equipment
    </button>
  </div>
);

export default AssetsEmptyState;