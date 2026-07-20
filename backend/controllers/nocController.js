import asyncHandler from "express-async-handler";
import NOCApplication from "../models/NOCApplication.js";
import Building from "../models/Building.js";
import Log from "../models/Log.js";
import { ROLES, NOC_STATUS } from "../config/constants.js";

// Defines which transitions are allowed from each status, keeping the
// Submitted -> Verification -> Inspection -> Approved -> Certificate Issued
// workflow enforced server-side (Rejected is reachable from any active stage).
const ALLOWED_TRANSITIONS = {
  [NOC_STATUS.SUBMITTED]: [NOC_STATUS.VERIFICATION, NOC_STATUS.REJECTED],
  [NOC_STATUS.VERIFICATION]: [NOC_STATUS.INSPECTION, NOC_STATUS.REJECTED],
  [NOC_STATUS.INSPECTION]: [NOC_STATUS.APPROVED, NOC_STATUS.REJECTED],
  [NOC_STATUS.APPROVED]: [NOC_STATUS.CERTIFICATE_ISSUED],
  [NOC_STATUS.REJECTED]: [],
  [NOC_STATUS.CERTIFICATE_ISSUED]: [],
};

// @desc    List NOC applications with search, status/type filters, and tab counts
// @route   GET /api/noc-applications
// @access  Private
export const getApplications = asyncHandler(async (req, res) => {
  const { search, status, applicationType, page = 1, limit = 12 } = req.query;

  const query = {};
  if (req.user.role === ROLES.OWNER) query.applicant = req.user.id;
  if (req.user.role === ROLES.AUDITOR) query.assignedInspector = req.user.id;

  if (status) query.status = status;
  if (applicationType) query.applicationType = applicationType;

  let applications = await NOCApplication.find(query)
    .populate("building", "name buildingCode address")
    .populate("applicant", "name email")
    .populate("assignedInspector", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  if (search) {
    const term = search.toLowerCase();
    applications = applications.filter(
      (a) =>
        a.applicationNumber?.toLowerCase().includes(term) ||
        a.building?.name?.toLowerCase().includes(term) ||
        a.applicant?.name?.toLowerCase().includes(term)
    );
  }

  const total = await NOCApplication.countDocuments(query);

  const baseQuery = { ...query };
  delete baseQuery.status;
  const statuses = Object.values(NOC_STATUS);
  const counts = {};
  await Promise.all(
    statuses.map(async (s) => {
      counts[s] = await NOCApplication.countDocuments({ ...baseQuery, status: s });
    })
  );
  counts.all = await NOCApplication.countDocuments(baseQuery);

  res.status(200).json({
    success: true,
    count: applications.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    counts,
    applications,
  });
});

// @desc    Get a single application with full timeline and linked records
// @route   GET /api/noc-applications/:id
// @access  Private
export const getApplication = asyncHandler(async (req, res) => {
  const application = await NOCApplication.findById(req.params.id)
    .populate("building", "name buildingCode address owner")
    .populate("applicant", "name email phone")
    .populate("assignedInspector", "name email department")
    .populate("audit", "status overallScore scheduledDate completedDate")
    .populate("certificate", "certificateNumber status validUntil pdfUrl")
    .populate("statusHistory.changedBy", "name");

  if (!application) {
    res.status(404);
    throw new Error("NOC application not found");
  }

  res.status(200).json({ success: true, application });
});

// @desc    Submit a new NOC application
// @route   POST /api/noc-applications
// @access  Private
export const createApplication = asyncHandler(async (req, res) => {
  const { building, applicationType } = req.body;

  if (!building) {
    res.status(400);
    throw new Error("Building is required");
  }

  const buildingDoc = await Building.findById(building);
  if (!buildingDoc) {
    res.status(404);
    throw new Error("Building not found");
  }
  if (req.user.role === ROLES.OWNER && buildingDoc.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error("You can only apply for buildings you own");
  }

  const applicant = req.user.role === ROLES.OWNER ? req.user.id : buildingDoc.owner;

  const application = await NOCApplication.create({
    building,
    applicant,
    applicationType: applicationType || "new",
    status: NOC_STATUS.SUBMITTED,
    statusHistory: [
      { status: NOC_STATUS.SUBMITTED, changedBy: req.user.id, note: "Application submitted" },
    ],
  });

  await Log.create({
    user: req.user.id,
    action: "NOC_APPLICATION_SUBMITTED",
    entity: { kind: "NOCApplication", id: application._id },
  });

  const populated = await NOCApplication.findById(application._id)
    .populate("building", "name buildingCode")
    .populate("applicant", "name email");

  res.status(201).json({ success: true, application: populated });
});

// @desc    Advance (or reject) an application's workflow status
// @route   PUT /api/noc-applications/:id/status
// @access  Private (super_admin, auditor)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, note, rejectionReason } = req.body;

  const application = await NOCApplication.findById(req.params.id);
  if (!application) {
    res.status(404);
    throw new Error("NOC application not found");
  }

  const allowed = ALLOWED_TRANSITIONS[application.status] || [];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(`Cannot move from '${application.status}' to '${status}'`);
  }

  application.status = status;
  application.statusHistory.push({ status, changedBy: req.user.id, note });

  if (status === NOC_STATUS.REJECTED) {
    application.rejectionReason = rejectionReason || "No reason provided";
    application.decidedAt = new Date();
  }
  if (status === NOC_STATUS.APPROVED || status === NOC_STATUS.CERTIFICATE_ISSUED) {
    application.decidedAt = application.decidedAt || new Date();
  }

  await application.save();

  await Log.create({
    user: req.user.id,
    action: "NOC_STATUS_UPDATED",
    entity: { kind: "NOCApplication", id: application._id },
    details: { status },
  });

  const populated = await NOCApplication.findById(application._id)
    .populate("building", "name buildingCode")
    .populate("applicant", "name email")
    .populate("assignedInspector", "name email")
    .populate("statusHistory.changedBy", "name");

  res.status(200).json({ success: true, application: populated });
});

// @desc    Assign or reassign an inspector to the application
// @route   PUT /api/noc-applications/:id/assign
// @access  Private (super_admin)
export const assignInspector = asyncHandler(async (req, res) => {
  const { inspectorId } = req.body;

  const application = await NOCApplication.findByIdAndUpdate(
    req.params.id,
    { assignedInspector: inspectorId },
    { new: true }
  )
    .populate("building", "name buildingCode")
    .populate("assignedInspector", "name email");

  if (!application) {
    res.status(404);
    throw new Error("NOC application not found");
  }

  await Log.create({
    user: req.user.id,
    action: "NOC_INSPECTOR_ASSIGNED",
    entity: { kind: "NOCApplication", id: application._id },
    details: { inspectorId },
  });

  res.status(200).json({ success: true, application });
});

// @desc    Withdraw/delete an application (only while still submitted)
// @route   DELETE /api/noc-applications/:id
// @access  Private
export const deleteApplication = asyncHandler(async (req, res) => {
  const application = await NOCApplication.findById(req.params.id);
  if (!application) {
    res.status(404);
    throw new Error("NOC application not found");
  }
  if (application.status !== NOC_STATUS.SUBMITTED) {
    res.status(400);
    throw new Error("Only applications still in Submitted status can be withdrawn");
  }

  await application.deleteOne();

  await Log.create({
    user: req.user.id,
    action: "NOC_APPLICATION_WITHDRAWN",
    entity: { kind: "NOCApplication", id: application._id },
  });

  res.status(200).json({ success: true, message: "Application withdrawn" });
});