import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import FormInput from "../ui/FormInput.jsx";
import { buildingSchema } from "../../utils/validationSchemas.js";

const typeOptions = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "hospital", label: "Hospital" },
  { value: "school", label: "School" },
  { value: "government", label: "Government" },
];

const RegisterBuildingModal = ({ open, onClose, onSubmit, submitting }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(buildingSchema),
    defaultValues: { type: "commercial", numberOfFloors: 1, emergencyExits: 0 },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = async (values) => {
    const payload = {
      name: values.name,
      type: values.type,
      numberOfFloors: values.numberOfFloors,
      emergencyExits: values.emergencyExits,
      occupancy: values.occupancy,
      address: {
        line1: values.line1,
        city: values.city,
        district: values.district,
        state: values.state,
        pincode: values.pincode,
      },
    };
    await onSubmit(payload);
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
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text">Register Building</h2>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-text-secondary hover:bg-surface"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(submit)} className="mt-5 space-y-4">
              <FormInput
                label="Building name"
                name="name"
                placeholder="Sunrise Towers"
                register={register}
                error={errors.name}
              />

              <div>
                <label className="block text-sm font-medium text-text">Building type</label>
                <select
                  {...register("type")}
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormInput
                  label="Floors"
                  name="numberOfFloors"
                  type="number"
                  register={register}
                  error={errors.numberOfFloors}
                />
                <FormInput
                  label="Emergency exits"
                  name="emergencyExits"
                  type="number"
                  register={register}
                  error={errors.emergencyExits}
                />
                <FormInput
                  label="Occupancy"
                  name="occupancy"
                  type="number"
                  register={register}
                  error={errors.occupancy}
                />
              </div>

              <FormInput
                label="Address line"
                name="line1"
                placeholder="123 Main Street"
                register={register}
                error={errors.line1}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormInput label="City" name="city" register={register} error={errors.city} />
                <FormInput label="District" name="district" register={register} error={errors.district} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormInput label="State" name="state" register={register} error={errors.state} />
                <FormInput label="Pincode" name="pincode" register={register} error={errors.pincode} />
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
                  Register Building
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegisterBuildingModal;