import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { useQuery } from "react-query";
import { X, Loader2 } from "lucide-react";
import api from "../../api/axios.js";

const typeOptions = [
  { value: "new", label: "New Application" },
  { value: "renewal", label: "Renewal" },
  { value: "modification", label: "Modification" },
];

const NewApplicationModal = ({ open, onClose, onSubmit, submitting }) => {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { applicationType: "new" } });

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
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text">Apply for NOC</h2>
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
                  {...register("building", { required: true })}
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a building</option>
                  {buildingsData?.buildings?.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text">Application type</label>
                <select
                  {...register("applicationType")}
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
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
                  Submit Application
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewApplicationModal;