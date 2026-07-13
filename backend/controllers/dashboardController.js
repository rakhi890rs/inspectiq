import asyncHandler from "express-async-handler";
import Building from "../models/Building.js";
import NOCApplication from "../models/NOCApplication.js";
import Audit from "../models/Audit.js";
import Certificate from "../models/Certificate.js";
import { ROLES, NOC_STATUS } from "../config/constants.js";

// @desc    Get top-level dashboard stat cards, scoped by role
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
  const buildingQuery = { isActive: true };
  if (req.user.role === ROLES.OWNER) buildingQuery.owner = req.user.id;

  const [
    totalBuildings,
    pendingAudits,
    approvedNOCs,
    rejectedNOCs,
    todaysInspections,
    expiringCertificates,
  ] = await Promise.all([
    Building.countDocuments(buildingQuery),
    Audit.countDocuments({ status: { $in: ["scheduled", "in_progress"] } }),
    NOCApplication.countDocuments({
      status: { $in: [NOC_STATUS.APPROVED, NOC_STATUS.CERTIFICATE_ISSUED] },
    }),
    NOCApplication.countDocuments({ status: NOC_STATUS.REJECTED }),
    Audit.countDocuments({
      scheduledDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    }),
    Certificate.countDocuments({
      status: "active",
      validUntil: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    }),
  ]);

  const buildings = await Building.find(buildingQuery).select("riskScore");
  const avgCompliance = buildings.length
    ? Math.round(
        buildings.reduce((sum, b) => sum + (100 - b.riskScore), 0) / buildings.length
      )
    : 0;

  res.status(200).json({
    success: true,
    stats: {
      totalBuildings,
      pendingAudits,
      approvedNOCs,
      rejectedNOCs,
      compliancePercentage: avgCompliance,
      todaysInspections,
      expiringCertificates,
    },
  });
});
