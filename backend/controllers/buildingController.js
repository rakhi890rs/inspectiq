import asyncHandler from "express-async-handler";
import QRCode from "qrcode";
import Building from "../models/Building.js";
import Log from "../models/Log.js";
import { ROLES } from "../config/constants.js";

// @desc    List buildings (owners see only their own; admins/auditors see all)
// @route   GET /api/buildings
// @access  Private
export const getBuildings = asyncHandler(async (req, res) => {
  const { search, riskLevel, safetyStatus, district, page = 1, limit = 20 } = req.query;

  const query = { isActive: true };
  if (req.user.role === ROLES.OWNER) query.owner = req.user.id;
  if (riskLevel) query.riskLevel = riskLevel;
  if (safetyStatus) query.safetyStatus = safetyStatus;
  if (district) query["address.district"] = district;
  if (search) query.$text = { $search: search };

  const buildings = await Building.find(query)
    .populate("owner", "name email phone")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Building.countDocuments(query);

  res.status(200).json({
    success: true,
    count: buildings.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    buildings,
  });
});

// @desc    Get single building with full profile
// @route   GET /api/buildings/:id
// @access  Private
export const getBuilding = asyncHandler(async (req, res) => {
  const building = await Building.findById(req.params.id)
    .populate("owner", "name email phone")
    .populate("images");

  if (!building) {
    res.status(404);
    throw new Error("Building not found");
  }

  if (
    req.user.role === ROLES.OWNER &&
    building.owner._id.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Not authorized to view this building");
  }

  res.status(200).json({ success: true, building });
});

// @desc    Create a building profile
// @route   POST /api/buildings
// @access  Private
export const createBuilding = asyncHandler(async (req, res) => {
  const owner = req.user.role === ROLES.OWNER ? req.user.id : req.body.owner;
  if (!owner) {
    res.status(400);
    throw new Error("Owner is required");
  }

  const building = await Building.create({ ...req.body, owner });

  // Generate a QR code that encodes a public verification URL for this building
  const verifyUrl = `${process.env.CLIENT_URL}/verify/building/${building.buildingCode}`;
  building.qrCode = await QRCode.toDataURL(verifyUrl);
  await building.save();

  await Log.create({
    user: req.user.id,
    action: "BUILDING_CREATED",
    entity: { kind: "Building", id: building._id },
  });

  res.status(201).json({ success: true, building });
});

// @desc    Update a building profile
// @route   PUT /api/buildings/:id
// @access  Private
export const updateBuilding = asyncHandler(async (req, res) => {
  let building = await Building.findById(req.params.id);
  if (!building) {
    res.status(404);
    throw new Error("Building not found");
  }
  if (
    req.user.role === ROLES.OWNER &&
    building.owner.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Not authorized to update this building");
  }

  building = await Building.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await Log.create({
    user: req.user.id,
    action: "BUILDING_UPDATED",
    entity: { kind: "Building", id: building._id },
  });

  res.status(200).json({ success: true, building });
});

// @desc    Soft-delete a building
// @route   DELETE /api/buildings/:id
// @access  Private
export const deleteBuilding = asyncHandler(async (req, res) => {
  const building = await Building.findById(req.params.id);
  if (!building) {
    res.status(404);
    throw new Error("Building not found");
  }
  if (
    req.user.role === ROLES.OWNER &&
    building.owner.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this building");
  }

  building.isActive = false;
  await building.save();

  await Log.create({
    user: req.user.id,
    action: "BUILDING_DELETED",
    entity: { kind: "Building", id: building._id },
  });

  res.status(200).json({ success: true, message: "Building removed" });
});
