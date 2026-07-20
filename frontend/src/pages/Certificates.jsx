import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { BadgeCheck, Download, Plus, FileText } from "lucide-react";
import api from "../api/axios.js";
import IssueCertificateModal from "../components/certificates/IssueCertificateModal.jsx";

const statusStyles = {
  active: "bg-success/10 text-success",
  expired: "bg-danger/10 text-danger",
  revoked: "bg-gray-100 text-gray-600",
};

const scoreColor = (score) => {
  if (score === undefined || score === null) return "text-text-secondary";
  if (score >= 85) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-danger";
};

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—";

const Certificates = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery("certificates", async () => {
    const { data } = await api.get("/certificates");
    return data.certificates;
  });

  const createMutation = useMutation((payload) => api.post("/certificates", payload), {
    onSuccess: () => {
      toast.success("Certificate issued");
      setModalOpen(false);
      queryClient.invalidateQueries("certificates");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to issue certificate"),
  });

  const certificates = data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text sm:text-2xl">Certificates</h1>
          <p className="mt-1 text-sm text-text-secondary">Fire safety compliance certificates.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-primary-dark"
        >
          <Plus size={16} /> Issue Certificate
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-card shadow-card" />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
          <div className="rounded-full bg-primary/10 p-4 text-primary">
            <FileText size={28} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-text">No Certificates Issued</h3>
          <p className="mt-1 max-w-sm text-sm text-text-secondary">
            Issue your first compliance certificate for a registered building.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <Plus size={16} /> Issue Certificate
          </button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AnimatePresence>
            {certificates.map((cert) => (
              <motion.div
                key={cert._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                      <BadgeCheck size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text">{cert.building?.name}</p>
                      <p className="text-xs text-text-secondary">{cert.certificateNumber}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      statusStyles[cert.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {cert.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-text-secondary">Issued</p>
                    <p className="mt-0.5 font-medium text-text">{formatDate(cert.issueDate)}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Expires</p>
                    <p className="mt-0.5 font-medium text-text">{formatDate(cert.validUntil)}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Safety Score</p>
                    <p className={`mt-0.5 font-semibold ${scoreColor(cert.safetyScore)}`}>
                      {cert.safetyScore != null ? `${cert.safetyScore}/100` : "—"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    cert.pdfUrl
                      ? window.open(cert.pdfUrl, "_blank")
                      : toast.error("PDF not generated yet for this certificate")
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-medium text-text hover:bg-surface"
                >
                  <Download size={15} /> Download PDF
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <IssueCertificateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(payload) => createMutation.mutateAsync(payload)}
        submitting={createMutation.isLoading}
      />
    </div>
  );
};

export default Certificates;