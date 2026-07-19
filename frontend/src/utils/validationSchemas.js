import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export const buildingSchema = z.object({
  name: z.string().min(2, "Building name is required"),
  type: z.enum(["residential", "commercial", "industrial", "hospital", "school", "government"]),
  numberOfFloors: z.coerce.number().min(1, "Must be at least 1"),
  emergencyExits: z.coerce.number().min(0, "Cannot be negative"),
  occupancy: z.coerce.number().min(0, "Cannot be negative").optional(),
  line1: z.string().min(2, "Address is required"),
  city: z.string().min(1, "City is required"),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

export const inspectionSchema = z.object({
  building: z.string().min(1, "Please select a building"),
  inspectionType: z.enum(["routine", "emergency", "annual", "follow_up"]),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
});

export const EQUIPMENT_CATEGORIES = [
  "fire_alarm",
  "smoke_detector",
  "fire_extinguisher",
  "sprinkler_system",
  "emergency_lights",
  "exit_signage",
  "lift",
  "generator",
  "electrical_panel",
  "cctv",
  "access_control",
  "gas_detector",
  "water_pump",
  "hvac",
  "emergency_exit_door",
  "medical_equipment",
  "structural_sensors",
];

export const assetSchema = z.object({
  name: z.string().min(2, "Equipment name is required"),
  category: z.enum(EQUIPMENT_CATEGORIES),
  building: z.string().min(1, "Please select a building"),
  floor: z.string().optional(),
  location: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  installationDate: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  nextInspectionDate: z.string().optional(),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });