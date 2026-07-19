import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
} from "lucide-react";

const CATEGORY_LABELS = {
  structural: "Structural",
  fire: "Fire Safety",
  electrical: "Electrical",
  plumbing: "Water Supply",
  lift: "Lift Safety",
  hvac: "HVAC",
  emergency_exit: "Emergency Exit",
  environmental: "Environmental Safety",
  occupational: "Occupational Safety",
  accessibility: "Accessibility",
};

const resultStyle = {
  pass: { icon: CheckCircle2, className: "text-success" },
  warning: { icon: AlertTriangle, className: "text-warning" },
  fail: { icon: XCircle, className: "text-danger" },
};

const ChecklistAccordion = ({ items, onAddItem, onDeleteItem, adding }) => {
  const [openCategory, setOpenCategory] = useState(null);
  const [draft, setDraft] = useState({ category: "", itemName: "", result: "pass", remarks: "" });

  const grouped = Object.keys(CATEGORY_LABELS).reduce((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat);
    return acc;
  }, {});

  const submitDraft = (category) => {
    if (!draft.itemName.trim()) return;
    onAddItem({ ...draft, category });
    setDraft({ category: "", itemName: "", result: "pass", remarks: "" });
  };

  return (
    <div className="space-y-2">
      {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
        const categoryItems = grouped[key];
        const isOpen = openCategory === key;
        const failCount = categoryItems.filter((i) => i.result === "fail").length;

        return (
          <div key={key} className="rounded-xl border border-border bg-card">
            <button
              onClick={() => setOpenCategory(isOpen ? null : key)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-text">
                {label}
                <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-text-secondary">
                  {categoryItems.length}
                </span>
                {failCount > 0 && (
                  <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] text-danger">
                    {failCount} failed
                  </span>
                )}
              </span>
              <ChevronDown
                size={16}
                className={`text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-border"
                >
                  <div className="space-y-2 p-4">
                    {categoryItems.length === 0 && (
                      <p className="text-xs text-text-secondary">No checklist items added yet.</p>
                    )}
                    {categoryItems.map((item) => {
                      const Result = resultStyle[item.result] || resultStyle.pass;
                      const Icon = Result.icon;
                      return (
                        <div
                          key={item._id}
                          className="flex items-start justify-between gap-3 rounded-lg bg-surface p-3"
                        >
                          <div className="flex items-start gap-2">
                            <Icon size={16} className={`mt-0.5 ${Result.className}`} />
                            <div>
                              <p className="text-sm font-medium text-text">{item.itemName}</p>
                              {item.remarks && (
                                <p className="mt-0.5 text-xs text-text-secondary">{item.remarks}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => onDeleteItem(item)}
                            className="text-text-secondary hover:text-danger"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}

                    {/* Add new item */}
                    <div className="mt-3 space-y-2 rounded-lg border border-dashed border-border p-3">
                      <input
                        value={draft.category === key ? draft.itemName : ""}
                        onChange={(e) => setDraft({ ...draft, category: key, itemName: e.target.value })}
                        placeholder="Checklist item name"
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={draft.category === key ? draft.result : "pass"}
                          onChange={(e) => setDraft({ ...draft, category: key, result: e.target.value })}
                          className="rounded-lg border border-border bg-white px-2 py-1.5 text-xs outline-none"
                        >
                          <option value="pass">Pass</option>
                          <option value="warning">Warning</option>
                          <option value="fail">Fail</option>
                        </select>
                        <input
                          value={draft.category === key ? draft.remarks : ""}
                          onChange={(e) => setDraft({ ...draft, category: key, remarks: e.target.value })}
                          placeholder="Remarks (optional)"
                          className="flex-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                        />
                        <button
                          onClick={() => submitDraft(key)}
                          disabled={adding}
                          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                        >
                          <Plus size={13} /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default ChecklistAccordion;