import React from "react";
import { ShieldCheck } from "lucide-react";

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-sidebar p-10 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <ShieldCheck size={20} />
          </div>
          <span className="text-lg font-bold">SafeBuild AI</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-extrabold leading-tight">
            Building Safety, Simplified.
          </h1>
          <p className="mt-3 text-gray-400">
            AI-powered audits, compliance tracking, and smart NOC management —
            all in one platform for owners, auditors, and authorities.
          </p>
        </div>

        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} SafeBuild AI. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold text-text">SafeBuild AI</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-text">{title}</h2>
          {subtitle && <p className="mt-1.5 text-sm text-text-secondary">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
