import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Search, SlidersHorizontal, Plus, QrCode, Upload } from "lucide-react";
import api from "../api/axios.js";
import AssetStatsCards from "../components/assets/AssetStatsCards.jsx";
import AssetTable from "../components/assets/AssetTable.jsx";
import AssetTableSkeleton from "../components/assets/AssetTableSkeleton.jsx";
import AssetsEmptyState from "../components/assets/AssetsEmptyState.jsx";
import AddEquipmentModal from "../components/assets/AddEquipmentModal.jsx";
import { EQUIPMENT_CATEGORIES } from "../utils/validationSchemas.js";

const categoryLabels = {
  fire_alarm: "Fire Alarm",
  smoke_detector: "Smoke Detector",
  fire_extinguisher: "Fire Extinguisher",
  sprinkler_system: "Sprinkler System",
  emergency_lights: "Emergency Lights",
  exit_signage: "Exit Signage",
  lift: "Lift",
  generator: "Generator",
  electrical_panel: "Electrical Panel",
  cctv: "CCTV",
  access_control: "Access Control",
  gas_detector: "Gas Detector",
  water_pump: "Water Pump",
  hvac: "HVAC",
  emergency_exit_door: "Emergency Exit Door",
  medical_equipment: "Medical Equipment",
  structural_sensors: "Structural Sensors",
};

const conditionFilters = [
  { value: "", label: "All Conditions" },
  { value: "operational", label: "Operational" },
  { value: "needs_service", label: "Needs Service" },
  { value: "maintenance_scheduled", label: "Maintenance Scheduled" },
  { value: "critical", label: "Critical" },
  { value: "out_of_service", label: "Out of Service" },
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
  { value: "oldest", label: "Oldest" },
  { value: "inspection_due", label: "Inspection Due" },
  { value: "highest_risk", label: "Highest Risk" },
];

const Assets = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ category: "", condition: "", riskLevel: "" });
  const [sort, setSort] = useState("newest");
  const [modalOpen, setModalOpen] = useState(false);

  const params = { search: search || undefined, sort, ...filters };
  Object.keys(params).forEach((key) => params[key] === "" && delete params[key]);

  const { data, isLoading, isFetching } = useQuery(
    ["assets", params],
    async () => {
      const { data } = await api.get("/assets", { params });
      return data;
    },
    { keepPreviousData: true }
  );

  const createMutation = useMutation((payload) => api.post("/assets", payload), {
    onSuccess: () => {
      toast.success("Equipment registered successfully");
      setModalOpen(false);
      queryClient.invalidateQueries("assets");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to register equipment"),
  });

  const deleteMutation = useMutation((asset) => api.delete(`/assets/${asset._id}`), {
    onSuccess: () => {
      toast.success("Asset removed");
      queryClient.invalidateQueries("assets");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete asset"),
  });

  const assets = data?.assets || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text sm:text-2xl">Assets & Safety Equipment</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Track, monitor, and manage all building safety assets and inspection schedules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface">
            <QrCode size={16} /> Scan QR
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface">
            <Upload size={16} /> Import CSV
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-primary-dark"
          >
            <Plus size={16} /> Add Equipment
          </button>
        </div>
      </div>

      {/* Stats */}
      <AssetStatsCards stats={data?.stats} />

      {/* Search + filter toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-[240px] items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
          <Search size={18} className="text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by equipment name, asset ID, building, or serial number..."
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
                value={filters.category}
                onChange={(v) => setFilters((f) => ({ ...f, category: v }))}
                options={[{ value: "", label: "All Categories" }, ...EQUIPMENT_CATEGORIES.map((c) => ({ value: c, label: categoryLabels[c] }))]}
              />
              <FilterSelect
                value={filters.condition}
                onChange={(v) => setFilters((f) => ({ ...f, condition: v }))}
                options={conditionFilters}
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

      {/* Table */}
      {isLoading ? (
        <AssetTableSkeleton />
      ) : assets.length === 0 ? (
        <AssetsEmptyState onRegister={() => setModalOpen(true)} />
      ) : (
        <AssetTable
          assets={assets}
          onDelete={(a) => {
            if (window.confirm(`Remove ${a.name}? This can't be undone.`)) {
              deleteMutation.mutate(a);
            }
          }}
        />
      )}

      {isFetching && !isLoading && (
        <p className="text-center text-xs text-text-secondary">Updating results...</p>
      )}

      <AddEquipmentModal
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

export default Assets;