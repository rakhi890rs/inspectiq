import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "react-query";
import { X, Loader2 } from "lucide-react";
import api from "../../api/axios.js";
import { inspectionSchema } from "../../utils/validationSchemas.js";

const typeOptions = [
  { value: "routine", label: "Routine" },
  { value: "emergency", label: "Emergency" },
  { value: "annual", label: "Annual" },
  { value: "follow_up", label: "Follow-up" },
];

const NewInspectionModal = ({ open, onClose, onSubmit, submitting }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inspectionSchema),
    defaultValues: { inspectionType: "routine" },
  });

  const { data: buildingsData } = useQuery(
    "buildings-for-select",
    async () => {
      const { data } = await api.get("/buildings", { params: { limit: 100 } });
      return data;
    },
    { enabled: open }
  );

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = async (values) => {
    await onSubmit(values);
    reset();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text">New Inspection</h2>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-text-secondary hover:bg-surface"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(submit)} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text">Building</label>
                <select
                  {...register("building")}
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a building</option>
                  {buildingsData?.buildings?.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {errors.building && (
                  <p className="mt-1 text-xs text-danger">{errors.building.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text">Inspection type</label>
                <select
                  {...register("inspectionType")}
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text">Scheduled date</label>
                <input
                  type="date"
                  {...register("scheduledDate")}
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {errors.scheduledDate && (
                  <p className="mt-1 text-xs text-danger">{errors.scheduledDate.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  Schedule Inspection
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewInspectionModal;