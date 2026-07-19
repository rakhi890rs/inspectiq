import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Search, SlidersHorizontal, Plus, Upload } from "lucide-react";
import api from "../api/axios.js";
import InspectionCard from "../components/audits/InspectionCard.jsx";
import InspectionCardSkeleton from "../components/audits/InspectionCardSkeleton.jsx";
import InspectionsEmptyState from "../components/audits/InspectionsEmptyState.jsx";
import NewInspectionModal from "../components/audits/NewInspectionModal.jsx";

const tabs = [
  { value: "", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "in_progress", label: "In Progress" },
  { value: "scheduled", label: "Scheduled" },
  { value: "pending_review", label: "Pending Review" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

const riskFilters = [
  { value: "", label: "All Risk Levels" },
  { value: "low", label: "Low Risk" },
  { value: "medium", label: "Medium Risk" },
  { value: "high", label: "High Risk" },
  { value: "critical", label: "Critical Risk" },
];

const typeFilters = [
  { value: "", label: "All Types" },
  { value: "routine", label: "Routine" },
  { value: "emergency", label: "Emergency" },
  { value: "annual", label: "Annual" },
  { value: "follow_up", label: "Follow-up" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "highest_risk", label: "Highest Risk" },
  { value: "highest_score", label: "Highest Score" },
];

const SafetyAudits = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ riskLevel: "", inspectionType: "" });
  const [sort, setSort] = useState("newest");
  const [modalOpen, setModalOpen] = useState(false);

  const params = { search: search || undefined, status: activeTab || undefined, sort, ...filters };
  Object.keys(params).forEach((key) => params[key] === "" && delete params[key]);

  const { data, isLoading, isFetching } = useQuery(
    ["audits", params],
    async () => {
      const { data } = await api.get("/audits", { params });
      return data;
    },
    { keepPreviousData: true }
  );

  const createMutation = useMutation((payload) => api.post("/audits", payload), {
    onSuccess: () => {
      toast.success("Inspection scheduled");
      setModalOpen(false);
      queryClient.invalidateQueries("audits");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to schedule inspection"),
  });

  const deleteMutation = useMutation((audit) => api.delete(`/audits/${audit._id}`), {
    onSuccess: () => {
      toast.success("Inspection deleted");
      queryClient.invalidateQueries("audits");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete inspection"),
  });

  const audits = data?.audits || [];
  const counts = data?.counts || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text sm:text-2xl">Safety Inspections</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage, monitor, and review all building safety inspections.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface">
            <Upload size={16} /> Import Inspection
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-primary-dark"
          >
            <Plus size={16} /> New Inspection
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-primary text-white"
                : "text-text-secondary hover:bg-surface"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                activeTab === tab.value ? "bg-white/20" : "bg-gray-100 text-text-secondary"
              }`}
            >
              {tab.value ? counts[tab.value] ?? 0 : counts.all ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search + filter toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-[240px] items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
          <Search size={18} className="text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by building, inspection ID, or inspector..."
            className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-secondary"
          />
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-card ${
            showFilters ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-text-secondary"
          }`}
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
              <FilterSelect
                value={filters.riskLevel}
                onChange={(v) => setFilters((f) => ({ ...f, riskLevel: v }))}
                options={riskFilters}
              />
              <FilterSelect
                value={filters.inspectionType}
                onChange={(v) => setFilters((f) => ({ ...f, inspectionType: v }))}
                options={typeFilters}
              />
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-text-secondary">Sort by</span>
                <FilterSelect value={sort} onChange={setSort} options={sortOptions} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <InspectionCardSkeleton key={i} />
          ))}
        </div>
      ) : audits.length === 0 ? (
        <InspectionsEmptyState onCreate={() => setModalOpen(true)} />
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <AnimatePresence>
            {audits.map((audit) => (
              <InspectionCard
                key={audit._id}
                audit={audit}
                onDelete={(a) => {
                  if (window.confirm("Delete this inspection? This can't be undone.")) {
                    deleteMutation.mutate(a);
                  }
                }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {isFetching && !isLoading && (
        <p className="text-center text-xs text-text-secondary">Updating results...</p>
      )}

      <NewInspectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(payload) => createMutation.mutateAsync(payload)}
        submitting={createMutation.isLoading}
      />
    </div>
  );
};

const FilterSelect = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

export default SafetyAudits;