import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "react-query";
import { X, Loader2 } from "lucide-react";
import api from "../../api/axios.js";
import FormInput from "../ui/FormInput.jsx";
import { assetSchema, EQUIPMENT_CATEGORIES } from "../../utils/validationSchemas.js";

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

const AddEquipmentModal = ({ open, onClose, onSubmit, submitting }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(assetSchema),
    defaultValues: { category: "fire_extinguisher" },
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
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text">Add Equipment</h2>
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
                label="Equipment name"
                name="name"
                placeholder="Fire Extinguisher - Lobby"
                register={register}
                error={errors.name}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text">Category</label>
                  <select
                    {...register("category")}
                    className="mt-1.5 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {EQUIPMENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {categoryLabels[cat]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text">Building</label>
                  <select
                    {...register("building")}
                    className="mt-1.5 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select building</option>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Floor" name="floor" register={register} error={errors.floor} />
                <FormInput label="Location" name="location" placeholder="Near east stairwell" register={register} error={errors.location} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Manufacturer" name="manufacturer" register={register} error={errors.manufacturer} />
                <FormInput label="Model" name="model" register={register} error={errors.model} />
              </div>

              <FormInput label="Serial number" name="serialNumber" register={register} error={errors.serialNumber} />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary">Installed</label>
                  <input
                    type="date"
                    {...register("installationDate")}
                    className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary">Warranty expiry</label>
                  <input
                    type="date"
                    {...register("warrantyExpiry")}
                    className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary">Next inspection</label>
                  <input
                    type="date"
                    {...register("nextInspectionDate")}
                    className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
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
                  Add Equipment
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddEquipmentModal;