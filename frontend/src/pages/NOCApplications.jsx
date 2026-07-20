import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Search, Plus } from "lucide-react";
import api from "../api/axios.js";
import NOCApplicationCard from "../components/noc/NOCApplicationCard.jsx";
import NOCApplicationsEmptyState from "../components/noc/NOCApplicationsEmptyState.jsx";
import NewApplicationModal from "../components/noc/NewApplicationModal.jsx";

const tabs = [
  { value: "", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "verification", label: "Verification" },
  { value: "inspection", label: "Inspection" },
  { value: "approved", label: "Approved" },
  { value: "certificate_issued", label: "Certificate Issued" },
  { value: "rejected", label: "Rejected" },
];

const NOCApplications = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const params = { search: search || undefined, status: activeTab || undefined };

  const { data, isLoading, isFetching } = useQuery(
    ["noc-applications", params],
    async () => {
      const { data } = await api.get("/noc-applications", { params });
      return data;
    },
    { keepPreviousData: true }
  );

  const createMutation = useMutation((payload) => api.post("/noc-applications", payload), {
    onSuccess: () => {
      toast.success("NOC application submitted");
      setModalOpen(false);
      queryClient.invalidateQueries("noc-applications");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to submit application"),
  });

  const applications = data?.applications || [];
  const counts = data?.counts || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text sm:text-2xl">NOC Applications</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Track No Objection Certificate applications from submission to issuance.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          <Plus size={16} /> Apply for NOC
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value ? "bg-primary text-white" : "text-text-secondary hover:bg-surface"
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

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
        <Search size={18} className="text-text-secondary" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by application number, building, or applicant..."
          className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-secondary"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-card shadow-card" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <NOCApplicationsEmptyState onCreate={() => setModalOpen(true)} />
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {applications.map((app) => (
              <NOCApplicationCard key={app._id} application={app} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {isFetching && !isLoading && (
        <p className="text-center text-xs text-text-secondary">Updating results...</p>
      )}

      <NewApplicationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(payload) => createMutation.mutateAsync(payload)}
        submitting={createMutation.isLoading}
      />
    </div>
  );
};

export default NOCApplications;