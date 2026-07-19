import asyncHandler from "express-async-handler";
import QRCode from "qrcode";
import Asset, { EQUIPMENT_CATEGORIES } from "../models/Asset.js";
import Building from "../models/Building.js";
import Log from "../models/Log.js";
import { ROLES } from "../config/constants.js";

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  inspection_due: { nextInspectionDate: 1 },
  highest_risk: { riskLevel: -1 },
};

const scopeToOwner = async (req, query) => {
  if (req.user.role === ROLES.OWNER) {
    const ownedBuildings = await Building.find({ owner: req.user.id }).select("_id");
    query.building = { $in: ownedBuildings.map((b) => b._id) };
  }
  return query;
};

// @desc    List assets with search, filters, sort, and summary stats
// @route   GET /api/assets
// @access  Private
export const getAssets = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    building,
    condition,
    riskLevel,
    safetyStatus,
    sort = "newest",
    page = 1,
    limit = 20,
  } = req.query;

  let query = { isActive: true };
  query = await scopeToOwner(req, query);

  if (category) query.category = category;
  if (building) query.building = building;
  if (condition) query.condition = condition;
  if (riskLevel) query.riskLevel = riskLevel;
  if (safetyStatus) query.safetyStatus = safetyStatus;
  if (search) query.$text = { $search: search };

  const assets = await Asset.find(query)
    .populate("building", "name buildingCode")
    .populate("assignedTechnician", "name email")
    .sort(SORT_OPTIONS[sort] || SORT_OPTIONS.newest)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Asset.countDocuments(query);

  // Summary stat cards, scoped to the same base query (ignoring pagination)
  const baseQuery = { ...query };
  const now = new Date();
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const [operational, maintenanceDue, critical, expiredCertifications, upcomingInspections] =
    await Promise.all([
      Asset.countDocuments({ ...baseQuery, condition: "operational" }),
      Asset.countDocuments({ ...baseQuery, maintenanceDueDate: { $lte: in30Days } }),
      Asset.countDocuments({ ...baseQuery, condition: "critical" }),
      Asset.countDocuments({ ...baseQuery, warrantyExpiry: { $lte: now } }),
      Asset.countDocuments({ ...baseQuery, nextInspectionDate: { $gte: now, $lte: in30Days } }),
    ]);

  res.status(200).json({
    success: true,
    count: assets.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    stats: {
      totalAssets: total,
      operational,
      maintenanceDue,
      critical,
      expiredCertifications,
      upcomingInspections,
    },
    assets,
  });
});

// @desc    Get a single asset with full details
// @route   GET /api/assets/:id
// @access  Private
export const getAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate("building", "name buildingCode address owner")
    .populate("assignedTechnician", "name email department");

  if (!asset) {
    res.status(404);
    throw new Error("Asset not found");
  }

  res.status(200).json({ success: true, asset });
});

// @desc    Register a new asset/equipment
// @route   POST /api/assets
// @access  Private
export const createAsset = asyncHandler(async (req, res) => {
  if (!EQUIPMENT_CATEGORIES.includes(req.body.category)) {
    res.status(400);
    throw new Error("Invalid equipment category");
  }

  const asset = await Asset.create(req.body);

  const verifyUrl = `${process.env.CLIENT_URL}/verify/asset/${asset.assetCode}`;
  asset.qrCode = await QRCode.toDataURL(verifyUrl);
  await asset.save();

  await Log.create({
    user: req.user.id,
    action: "ASSET_CREATED",
    entity: { kind: "Asset", id: asset._id },
  });

  const populated = await Asset.findById(asset._id).populate("building", "name buildingCode");

  res.status(201).json({ success: true, asset: populated });
});

// @desc    Update an asset
// @route   PUT /api/assets/:id
// @access  Private
export const updateAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("building", "name buildingCode")
    .populate("assignedTechnician", "name email");

  if (!asset) {
    res.status(404);
    throw new Error("Asset not found");
  }

  await Log.create({
    user: req.user.id,
    action: "ASSET_UPDATED",
    entity: { kind: "Asset", id: asset._id },
    details: req.body,
  });

  res.status(200).json({ success: true, asset });
});

// @desc    Soft-delete an asset
// @route   DELETE /api/assets/:id
// @access  Private
export const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    res.status(404);
    throw new Error("Asset not found");
  }

  asset.isActive = false;
  await asset.save();

  await Log.create({
    user: req.user.id,
    action: "ASSET_DELETED",
    entity: { kind: "Asset", id: asset._id },
  });

  res.status(200).json({ success: true, message: "Asset removed" });
});