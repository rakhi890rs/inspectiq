import React from "react";

const InspectionCardSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-border bg-card p-5 shadow-card">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gray-100" />
        <div>
          <div className="h-4 w-32 rounded bg-gray-100" />
          <div className="mt-1.5 h-3 w-20 rounded bg-gray-100" />
        </div>
      </div>
      <div className="h-6 w-20 rounded-full bg-gray-100" />
    </div>
    <div className="mt-4 h-3 w-1/2 rounded bg-gray-100" />
    <div className="mt-3 h-3 w-2/3 rounded bg-gray-100" />
    <div className="mt-5 h-1.5 w-full rounded-full bg-gray-100" />
    <div className="mt-5 flex items-center justify-between">
      <div className="h-6 w-16 rounded-full bg-gray-100" />
      <div className="h-8 w-10 rounded bg-gray-100" />
    </div>
  </div>
);

export default InspectionCardSkeleton;