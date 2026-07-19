import React from "react";

const AssetTableSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
    <div className="border-b border-border bg-surface px-4 py-3">
      <div className="h-3 w-full max-w-[900px] animate-pulse rounded bg-gray-200" />
    </div>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex animate-pulse items-center gap-6 border-b border-border px-4 py-4 last:border-0">
        <div className="h-3 w-16 rounded bg-gray-100" />
        <div className="h-3 w-32 rounded bg-gray-100" />
        <div className="h-3 w-24 rounded bg-gray-100" />
        <div className="h-3 w-24 rounded bg-gray-100" />
        <div className="h-6 w-20 rounded-full bg-gray-100" />
        <div className="h-3 w-20 rounded bg-gray-100" />
        <div className="ml-auto h-6 w-6 rounded bg-gray-100" />
      </div>
    ))}
  </div>
);

export default AssetTableSkeleton;