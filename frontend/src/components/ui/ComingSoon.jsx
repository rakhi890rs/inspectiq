import React from "react";
import { Construction } from "lucide-react";

const ComingSoon = ({ title }) => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card text-center">
      <div className="rounded-full bg-primary/10 p-4 text-primary">
        <Construction size={28} />
      </div>
      <h2 className="mt-4 text-lg font-bold text-text">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-text-secondary">
        This module is planned for the next build phase and will connect to its
        own set of API routes.
      </p>
    </div>
  );
};

export default ComingSoon;
