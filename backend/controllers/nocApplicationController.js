import asyncHandler from "express-async-handler";
import NOCApplication from "../models/NOCApplication.js";
import Building from "../models/Building.js";
import { NOC_STATUS, ROLES } from "../config/constants.js";

const populateApplication = (query) =>
  query
    .populate("building", "name buildingCode address owner")
    .populate("applicant", "name email")
    .populate("assignedInspector", "name email")
    .populate("audit")
    .populate("certificate");

export const getNOCApplications = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === ROLES.OWNER) query.applicant = req.user.id;
  if (req.user.role === ROLES.AUDITOR) query.assignedInspector = req.user.id;
  if (req.query.status) query.status = req.query.status;
  if (req.query.building) query.building = req.query.building;

  const applications = await populateApplication(
    NOCApplication.find(query).sort({ createdAt: -1 })
  );
  res.json({ success: true, count: applications.length, applications });
});

export const getNOCApplication = asyncHandler(async (req, res) => {
  const application = await populateApplication(NOCApplication.findById(req.params.id));
  if (!application) {
    res.status(404);
    throw new Error("NOC application not found");
  }
  if (
    req.user.role === ROLES.OWNER &&
    application.applicant._id.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Not authorized to view this application");
  }
  if (
    req.user.role === ROLES.AUDITOR &&
    application.assignedInspector?._id.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Not authorized to view this application");
  }
  res.json({ success: true, application });
});

export const createNOCApplication = asyncHandler(async (req, res) => {
  const { building, applicationType, documents } = req.body;
  if (!building) {
    res.status(400);
    throw new Error("Building is required");
  }
  const buildingRecord = await Building.findById(building);
  if (!buildingRecord) {
    res.status(404);
    throw new Error("Building not found");
  }
  if (req.user.role === ROLES.OWNER && buildingRecord.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to apply for this building");
  }
  const application = await NOCApplication.create({
    building,
    applicationType,
    documents,
    applicant: req.user.role === ROLES.OWNER ? req.user.id : req.body.applicant,
  });
  res.status(201).json({ success: true, application });
});

export const updateNOCApplication = asyncHandler(async (req, res) => {
  const application = await NOCApplication.findById(req.params.id);
  if (!application) {
    res.status(404);
    throw new Error("NOC application not found");
  }
  const isOwner = req.user.role === ROLES.OWNER;
  if (isOwner && application.applicant.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to update this application");
  }

  const allowed = isOwner ? ["documents", "applicationType"] : ["status", "assignedInspector", "audit", "certificate", "rejectionReason"];
  for (const field of allowed) if (req.body[field] !== undefined) application[field] = req.body[field];
  if (!isOwner && req.body.status !== undefined) {
    if (!Object.values(NOC_STATUS).includes(req.body.status)) {
      res.status(400);
      throw new Error("Invalid NOC status");
    }
    application.statusHistory.push({ status: req.body.status, changedBy: req.user.id, note: req.body.note });
    if ([NOC_STATUS.APPROVED, NOC_STATUS.REJECTED, NOC_STATUS.CERTIFICATE_ISSUED].includes(req.body.status)) application.decidedAt = new Date();
  }
  await application.save();
  res.json({ success: true, application });
});
