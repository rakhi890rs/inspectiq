import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  PlayCircle,
  FileCheck2,
  CalendarCheck,
  Building2,
  ClipboardCheck,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";

const stats = [
  { label: "Buildings Registered", value: "12,400+", icon: Building2 },
  { label: "Audits Completed", value: "38,900+", icon: ClipboardCheck },
  { label: "Compliance Rate", value: "94%", icon: TrendingUp },
  { label: "Certificates Issued", value: "9,150+", icon: BadgeCheck },
];

const faqs = [
  {
    q: "Which safety domains does SafeBuild AI audit?",
    a: "Structural, fire, electrical, plumbing, lift, HVAC, emergency exit, environmental, occupational, and accessibility compliance — all in a single unified workflow.",
  },
  {
    q: "How long does an NOC application take?",
    a: "Most applications move from submission to certificate issuance in a matter of days once verification and inspection are scheduled, tracked live on your dashboard.",
  },
  {
    q: "Can I verify a certificate's authenticity?",
    a: "Every certificate carries a QR code and a unique certificate number that can be scanned or looked up for instant verification.",
  },
];

const Landing = () => {
  return (
    <div className="bg-surface text-text">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold">SafeBuild AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-text">
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl"
        >
          Building Safety, <span className="text-primary">Simplified.</span>
        </motion.h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-text-secondary">
          AI-powered Building Safety Audits, Compliance Tracking and Smart NOC Management.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-dark"
          >
            <FileCheck2 size={18} /> Apply for NOC
          </Link>
          <Link
            to="/register"
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-text hover:bg-surface"
          >
            <CalendarCheck size={18} /> Book Inspection
          </Link>
          <button className="flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-text-secondary hover:text-text">
            <PlayCircle size={18} /> Watch Demo
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-6 shadow-card sm:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center gap-2 py-4 text-center">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Icon size={20} />
              </div>
              <p className="text-2xl font-extrabold">{value}</p>
              <p className="text-xs text-text-secondary">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <h2 className="text-center text-2xl font-bold">Frequently asked questions</h2>
        <div className="mt-8 space-y-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-border bg-card p-4 shadow-card"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-text">
                {item.q}
              </summary>
              <p className="mt-2 text-sm text-text-secondary">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-xs text-text-secondary">
          &copy; {new Date().getFullYear()} SafeBuild AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
