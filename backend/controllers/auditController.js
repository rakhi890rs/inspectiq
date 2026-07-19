import asyncHandler from "express-async-handler";
import Audit from "../models/Audit.js";
import AuditChecklist from "../models/AuditChecklist.js";
import Building from "../models/Building.js";
import Log from "../models/Log.js";
import { ROLES, AUDIT_CATEGORIES } from "../config/constants.js";

const SORT_OPTIONS = {
  newest: { scheduledDate: -1 },
  oldest: { scheduledDate: 1 },
  highest_risk: { riskScore: -1 }, // fallback below if riskScore absent
  highest_score: { overallScore: -1 },
};

// @desc    List inspections with search, filters, status tabs, sort
// @route   GET /api/audits
// @access  Private
export const getAudits = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    riskLevel,
    inspectionType,
    auditor,
    dateFrom,
    dateTo,
    sort = "newest",
    page = 1,
    limit = 12,
  } = req.query;

  const query = {};

  if (req.user.role === ROLES.OWNER) {
    const ownedBuildings = await Building.find({ owner: req.user.id }).select("_id");
    query.building = { $in: ownedBuildings.map((b) => b._id) };
  }
  if (req.user.role === ROLES.AUDITOR) {
    query.auditor = req.user.id;
  }

  if (status) query.status = status;
  if (riskLevel) query.riskLevel = riskLevel;
  if (inspectionType) query.inspectionType = inspectionType;
  if (auditor) query.auditor = auditor;
  if (dateFrom || dateTo) {
    query.scheduledDate = {};
    if (dateFrom) query.scheduledDate.$gte = new Date(dateFrom);
    if (dateTo) query.scheduledDate.$lte = new Date(dateTo);
  }

  let audits = await Audit.find(query)
    .populate("building", "name address buildingCode")
    .populate("auditor", "name email")
    .populate("checklistItems")
    .sort(SORT_OPTIONS[sort] || SORT_OPTIONS.newest)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  // Free-text search across building name, inspector name, and audit id
  if (search) {
    const term = search.toLowerCase();
    audits = audits.filter(
      (a) =>
        a.building?.name?.toLowerCase().includes(term) ||
        a.auditor?.name?.toLowerCase().includes(term) ||
        a._id.toString().includes(term)
    );
  }

  const total = await Audit.countDocuments(query);

  // Status tab counts (scoped to the same base query, ignoring the status filter itself)
  const baseQuery = { ...query };
  delete baseQuery.status;
  const statuses = ["scheduled", "in_progress", "completed", "pending_review", "failed", "cancelled"];
  const counts = {};
  await Promise.all(
    statuses.map(async (s) => {
      counts[s] = await Audit.countDocuments({ ...baseQuery, status: s });
    })
  );
  counts.all = await Audit.countDocuments(baseQuery);

  const withProgress = audits.map((a) => {
    const items = a.checklistItems || [];
    const passCount = items.filter((i) => i.result === "pass").length;
    return {
      ...a.toObject(),
      checklistProgress: { completed: items.length, total: items.length, passed: passCount },
    };
  });

  res.status(200).json({
    success: true,
    count: withProgress.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    counts,
    audits: withProgress,
  });
});

// @desc    Get single inspection with full checklist
// @route   GET /api/audits/:id
// @access  Private
export const getAudit = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id)
    .populate("building", "name address buildingCode owner")
    .populate("auditor", "name email department")
    .populate("checklistItems");

  if (!audit) {
    res.status(404);
    throw new Error("Inspection not found");
  }

  res.status(200).json({ success: true, audit });
});

// @desc    Schedule a new inspection
// @route   POST /api/audits
// @access  Private (super_admin, auditor)
export const createAudit = asyncHandler(async (req, res) => {
  const { building, auditor, inspectionType, scheduledDate, nocApplication } = req.body;

  if (!building || !scheduledDate) {
    res.status(400);
    throw new Error("Building and scheduled date are required");
  }

  const assignedAuditor = req.user.role === ROLES.AUDITOR ? req.user.id : auditor;
  if (!assignedAuditor) {
    res.status(400);
    throw new Error("An inspector must be assigned");
  }

  const audit = await Audit.create({
    building,
    auditor: assignedAuditor,
    inspectionType: inspectionType || "routine",
    scheduledDate,
    nocApplication,
  });

  await Log.create({
    user: req.user.id,
    action: "INSPECTION_SCHEDULED",
    entity: { kind: "Audit", id: audit._id },
  });

  const populated = await Audit.findById(audit._id)
    .populate("building", "name address buildingCode")
    .populate("auditor", "name email");

  res.status(201).json({ success: true, audit: populated });
});

// @desc    Update an inspection (status, score, notes, signature, risk level)
// @route   PUT /api/audits/:id
// @access  Private
export const updateAudit = asyncHandler(async (req, res) => {
  const allowedFields = [
    "status",
    "riskLevel",
    "overallScore",
    "summary",
    "inspectorNotes",
    "digitalSignature",
    "durationMinutes",
    "completedDate",
    "scheduledDate",
    "inspectionType",
  ];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (updates.status === "completed" && !updates.completedDate) {
    updates.completedDate = new Date();
  }

  const audit = await Audit.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  })
    .populate("building", "name address buildingCode")
    .populate("auditor", "name email");

  if (!audit) {
    res.status(404);
    throw new Error("Inspection not found");
  }

  // Keep the building's lastInspectionDate + risk in sync when an inspection completes
  if (updates.status === "completed") {
    await Building.findByIdAndUpdate(audit.building._id, {
      lastInspectionDate: audit.completedDate,
      ...(audit.riskLevel && { riskLevel: audit.riskLevel }),
    });
  }

  await Log.create({
    user: req.user.id,
    action: "INSPECTION_UPDATED",
    entity: { kind: "Audit", id: audit._id },
    details: updates,
  });

  res.status(200).json({ success: true, audit });
});

// @desc    Delete/cancel an inspection
// @route   DELETE /api/audits/:id
// @access  Private
export const deleteAudit = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id);
  if (!audit) {
    res.status(404);
    throw new Error("Inspection not found");
  }

  await AuditChecklist.deleteMany({ audit: audit._id });
  await audit.deleteOne();

  await Log.create({
    user: req.user.id,
    action: "INSPECTION_DELETED",
    entity: { kind: "Audit", id: audit._id },
  });

  res.status(200).json({ success: true, message: "Inspection deleted" });
});

// @desc    Add a checklist item to an inspection
// @route   POST /api/audits/:id/checklist
// @access  Private
export const addChecklistItem = asyncHandler(async (req, res) => {
  const { category, itemName, result, remarks } = req.body;

  if (!AUDIT_CATEGORIES.includes(category)) {
    res.status(400);
    throw new Error("Invalid checklist category");
  }
  if (!itemName || !result) {
    res.status(400);
    throw new Error("Item name and result are required");
  }

  const audit = await Audit.findById(req.params.id);
  if (!audit) {
    res.status(404);
    throw new Error("Inspection not found");
  }

  const item = await AuditChecklist.create({
    audit: audit._id,
    category,
    itemName,
    result,
    remarks,
  });

  audit.checklistItems.push(item._id);
  await audit.save();

  res.status(201).json({ success: true, item });
});

// @desc    Update a checklist item (result/remarks)
// @route   PUT /api/audits/:id/checklist/:itemId
// @access  Private
export const updateChecklistItem = asyncHandler(async (req, res) => {
  const allowedFields = ["result", "remarks", "images", "videos", "voiceNoteUrl"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const item = await AuditChecklist.findOneAndUpdate(
    { _id: req.params.itemId, audit: req.params.id },
    updates,
    { new: true, runValidators: true }
  );

  if (!item) {
    res.status(404);
    throw new Error("Checklist item not found");
  }

  res.status(200).json({ success: true, item });
});

// @desc    Remove a checklist item
// @route   DELETE /api/audits/:id/checklist/:itemId
// @access  Private
export const deleteChecklistItem = asyncHandler(async (req, res) => {
  const item = await AuditChecklist.findOneAndDelete({
    _id: req.params.itemId,
    audit: req.params.id,
  });
  if (!item) {
    res.status(404);
    throw new Error("Checklist item not found");
  }

  await Audit.findByIdAndUpdate(req.params.id, { $pull: { checklistItems: item._id } });

  res.status(200).json({ success: true, message: "Checklist item removed" });
});