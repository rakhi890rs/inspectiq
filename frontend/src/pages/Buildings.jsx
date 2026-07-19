import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Search,
  SlidersHorizontal,
  Plus,
  LayoutGrid,
  List,
  Download,
} from "lucide-react";
import api from "../api/axios.js";
import BuildingCard from "../components/buildings/BuildingCard.jsx";
import BuildingCardSkeleton from "../components/buildings/BuildingCardSkeleton.jsx";
import BuildingsEmptyState from "../components/buildings/BuildingsEmptyState.jsx";
import RegisterBuildingModal from "../components/buildings/RegisterBuildingModal.jsx";

const typeFilters = [
  { value: "", label: "All Types" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "hospital", label: "Hospital" },
  { value: "school", label: "School" },
  { value: "government", label: "Government" },
];

const statusFilters = [
  { value: "", label: "All Statuses" },
  { value: "certified", label: "Certified" },
  { value: "pending", label: "Pending" },
  { value: "expired", label: "Expired" },
  { value: "under_inspection", label: "Under Inspection" },
];

const riskFilters = [
  { value: "", label: "All Risk Levels" },
  { value: "low", label: "Low Risk" },
  { value: "medium", label: "Medium Risk" },
  { value: "high", label: "High Risk" },
  { value: "critical", label: "Critical Risk" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "highest_risk", label: "Highest Risk" },
  { value: "recently_inspected", label: "Recently Inspected" },
  { value: "alphabetical", label: "Alphabetical" },
];

const Buildings = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: "", certificateStatus: "", riskLevel: "" });
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState("grid");
  const [modalOpen, setModalOpen] = useState(false);

  const params = { search: search || undefined, sort, ...filters };
  Object.keys(params).forEach((key) => params[key] === "" && delete params[key]);

  const { data, isLoading, isFetching } = useQuery(
    ["buildings", params],
    async () => {
      const { data } = await api.get("/buildings", { params });
      return data;
    },
    { keepPreviousData: true }
  );

  const createMutation = useMutation(
    (payload) => api.post("/buildings", payload),
    {
      onSuccess: () => {
        toast.success("Building registered successfully");
        setModalOpen(false);
        queryClient.invalidateQueries("buildings");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Failed to register building"),
    }
  );

  const favoriteMutation = useMutation(
    (building) => api.put(`/buildings/${building._id}/favorite`),
    { onSuccess: () => queryClient.invalidateQueries("buildings") }
  );

  const deleteMutation = useMutation(
    (building) => api.delete(`/buildings/${building._id}`),
    {
      onSuccess: () => {
        toast.success("Building removed");
        queryClient.invalidateQueries("buildings");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Failed to delete building"),
    }
  );

  const buildings = data?.buildings || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text sm:text-2xl">Buildings</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage registered buildings and monitor safety compliance.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          <Plus size={16} /> Register Building
        </button>
      </div>

      {/* Search + filter toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-[240px] items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
          <Search size={18} className="text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by building name, owner, address, or ID..."
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
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-card">
          <button
            onClick={() => setView("grid")}
            className={`rounded-lg p-2 ${view === "grid" ? "bg-primary/10 text-primary" : "text-text-secondary"}`}
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded-lg p-2 ${view === "list" ? "bg-primary/10 text-primary" : "text-text-secondary"}`}
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-text-secondary shadow-card hover:text-text">
          <Download size={16} /> Export
        </button>
      </div>

      {/* Filters panel */}
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
                value={filters.type}
                onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
                options={typeFilters}
              />
              <FilterSelect
                value={filters.certificateStatus}
                onChange={(v) => setFilters((f) => ({ ...f, certificateStatus: v }))}
                options={statusFilters}
              />
              <FilterSelect
                value={filters.riskLevel}
                onChange={(v) => setFilters((f) => ({ ...f, riskLevel: v }))}
                options={riskFilters}
              />
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-text-secondary">Sort by</span>
                <FilterSelect value={sort} onChange={setSort} options={sortOptions} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <BuildingCardSkeleton key={i} />
          ))}
        </div>
      ) : buildings.length === 0 ? (
        <BuildingsEmptyState onRegister={() => setModalOpen(true)} />
      ) : (
        <motion.div
          layout
          className={`grid gap-5 ${
            view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          }`}
        >
          <AnimatePresence>
            {buildings.map((building) => (
              <BuildingCard
                key={building._id}
                building={building}
                onToggleFavorite={(b) => favoriteMutation.mutate(b)}
                onDelete={(b) => {
                  if (window.confirm(`Remove ${b.name}? This can't be undone.`)) {
                    deleteMutation.mutate(b);
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

      <RegisterBuildingModal
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

export default Buildings;