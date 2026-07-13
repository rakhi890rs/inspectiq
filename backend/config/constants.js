// Central place for role/status enums so every model & middleware
// references the same source of truth.

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  AUDITOR: "auditor", // Government Safety Officer / Auditor
  OWNER: "owner", // Building Owner
};

export const ROLE_LIST = Object.values(ROLES);

export const AUDIT_ITEM_RESULT = {
  PASS: "pass",
  WARNING: "warning",
  FAIL: "fail",
};

export const AUDIT_CATEGORIES = [
  "structural",
  "fire",
  "electrical",
  "plumbing",
  "lift",
  "hvac",
  "emergency_exit",
  "environmental",
  "occupational",
  "accessibility",
];

export const NOC_STATUS = {
  SUBMITTED: "submitted",
  VERIFICATION: "verification",
  INSPECTION: "inspection",
  APPROVED: "approved",
  REJECTED: "rejected",
  CERTIFICATE_ISSUED: "certificate_issued",
};

export const RISK_LEVEL = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

export const NOTIFICATION_TYPE = {
  INSPECTION_REMINDER: "inspection_reminder",
  CERTIFICATE_EXPIRY: "certificate_expiry",
  APPLICATION_APPROVED: "application_approved",
  APPLICATION_REJECTED: "application_rejected",
  GENERAL: "general",
};
