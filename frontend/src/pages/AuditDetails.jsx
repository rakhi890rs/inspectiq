import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Building2,
  UserCog,
  CalendarDays,
  Sparkles,
  ImageIcon,
} from "lucide-react";
import api from "../api/axios.js";
import Badge from "../components/ui/Badge.jsx";
import ChecklistAccordion from "../components/audits/ChecklistAccordion.jsx";

const statusOptions = ["scheduled", "in_progress", "completed", "pending_review", "failed", "cancelled"];
const riskOptions = ["low", "medium", "high", "critical"];

const AuditDetails = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: audit, isLoading } = useQuery(["audit", id], async () => {
    const { data } = await api.get(`/audits/${id}`);
    return data.audit;
  });

  const updateMutation = useMutation((payload) => api.put(`/audits/${id}`, payload), {
    onSuccess: () => queryClient.invalidateQueries(["audit", id]),
    onError: (err) => toast.error(err.response?.data?.message || "Update failed"),
  });

  const addItemMutation = useMutation(
    (item) => api.post(`/audits/${id}/checklist`, item),
    {
      onSuccess: () => queryClient.invalidateQueries(["audit", id]),
      onError: (err) => toast.error(err.response?.data?.message || "Failed to add item"),
    }
  );

  const deleteItemMutation = useMutation(
    (item) => api.delete(`/audits/${id}/checklist/${item._id}`),
    {
      onSuccess: () => queryClient.invalidateQueries(["audit", id]),
      onError: (err) => toast.error(err.response?.data?.message || "Failed to remove item"),
    }
  );

  if (isLoading) {
    return <p className="text-sm text-text-secondary">Loading inspection...</p>;
  }
  if (!audit) {
    return <p className="text-sm text-text-secondary">Inspection not found.</p>;
  }

  const items = audit.checklistItems || [];
  const progressPct = items.length
    ? Math.round((items.filter((i) => i.result !== undefined).length / items.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <Link
        to="/audits"
        className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text"
      >
        <ArrowLeft size={16} /> Back to Safety Inspections
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text">{audit.building?.name}</h1>
              <p className="mt-1 text-xs text-text-secondary">
                INS-{audit._id.slice(-6).toUpperCase()}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <UserCog size={14} /> {audit.auditor?.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  {new Date(audit.scheduledDate).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge value={audit.status} />
            <Badge value={audit.riskLevel} />
          </div>
        </div>

        {/* Inline status/risk/score controls */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ControlSelect
            label="Status"
            value={audit.status}
            options={statusOptions}
            onChange={(status) => updateMutation.mutate({ status })}
          />
          <ControlSelect
            label="Risk level"
            value={audit.riskLevel || ""}
            options={riskOptions}
            onChange={(riskLevel) => updateMutation.mutate({ riskLevel })}
          />
          <div>
            <label className="block text-xs font-medium text-text-secondary">Safety score</label>
            <input
              type="number"
              min={0}
              max={100}
              defaultValue={audit.overallScore ?? ""}
              onBlur={(e) => updateMutation.mutate({ overallScore: Number(e.target.value) })}
              className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-text">Inspection Checklist</h3>
            <p className="mt-1 text-xs text-text-secondary">
              {items.length} items logged · {progressPct}% recorded
            </p>
            <div className="mt-4">
              <ChecklistAccordion
                items={items}
                onAddItem={(item) => addItemMutation.mutate(item)}
                onDeleteItem={(item) => deleteItemMutation.mutate(item)}
                adding={addItemMutation.isLoading}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-text">Inspector Notes</h3>
            <textarea
              defaultValue={audit.inspectorNotes || ""}
              onBlur={(e) => updateMutation.mutate({ inspectorNotes: e.target.value })}
              rows={4}
              placeholder="Add notes from the inspection..."
              className="mt-3 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <UpcomingSection
            title="Evidence Gallery"
            icon={ImageIcon}
            note="Will show uploaded images, videos, and voice notes per checklist item once media upload is wired to Cloudinary."
          />
        </div>

        <div className="space-y-6">
          <UpcomingSection
            title="AI Insights"
            icon={Sparkles}
            note="Building health score, risk prediction, detected compliance issues, and corrective action suggestions will appear here once the AI features are built."
          />
          <UpcomingSection title="Previous Inspections" note="Will list this building's inspection history for comparison." />
          <UpcomingSection title="Compliance Report" note="Will generate a PDF compliance report from this inspection's checklist results." />
          <UpcomingSection title="NOC Status" note="Will show whether this inspection is linked to an active NOC application." />
        </div>
      </div>
    </div>
  );
};

const ControlSelect = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-text-secondary">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm capitalize outline-none focus:border-primary"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt.replace("_", " ")}
        </option>
      ))}
    </select>
  </div>
);

const UpcomingSection = ({ title, note, icon: Icon }) => (
  <div className="rounded-2xl border border-dashed border-border bg-card p-5">
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-primary" />
      <h3 className="text-sm font-semibold text-text">{title}</h3>
    </div>
    <p className="mt-2 text-xs text-text-secondary">{note}</p>
  </div>
);

export default AuditDetails;