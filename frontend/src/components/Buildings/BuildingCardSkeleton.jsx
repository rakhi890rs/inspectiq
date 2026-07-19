import React from "react";

const BuildingCardSkeleton = () => (
  <div className="h-[260px] animate-pulse rounded-2xl border border-border bg-card p-5 shadow-card">
    <div className="flex items-start justify-between">
      <div className="h-10 w-10 rounded-xl bg-gray-100" />
      <div className="h-6 w-20 rounded-full bg-gray-100" />
    </div>
    <div className="mt-4 h-4 w-3/4 rounded bg-gray-100" />
    <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
    <div className="mt-1.5 h-3 w-2/3 rounded bg-gray-100" />
    <div className="mt-4 grid grid-cols-2 gap-2">
      <div className="h-3 w-16 rounded bg-gray-100" />
      <div className="h-3 w-16 rounded bg-gray-100" />
      <div className="h-3 w-16 rounded bg-gray-100" />
      <div className="h-3 w-16 rounded bg-gray-100" />
    </div>
    <div className="mt-8 h-1.5 w-full rounded-full bg-gray-100" />
  </div>
);

export default BuildingCardSkeleton;