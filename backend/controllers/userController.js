import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Log from "../models/Log.js";

// @desc    List all users (with optional role/search filter)
// @route   GET /api/users
// @access  Private (super_admin)
export const getUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    users,
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (super_admin)
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({ success: true, user });
});

// @desc    Create a user (e.g. provisioning an Auditor or Admin)
// @route   POST /api/users
// @access  Private (super_admin)
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    department,
    phone,
    isEmailVerified: true, // admin-provisioned accounts skip verification
  });

  await Log.create({
    user: req.user.id,
    action: "USER_CREATED",
    entity: { kind: "User", id: user._id },
  });

  res.status(201).json({ success: true, user });
});

// @desc    Update a user (role, department, active status)
// @route   PUT /api/users/:id
// @access  Private (super_admin)
export const updateUser = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "role", "department", "phone", "isActive"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await Log.create({
    user: req.user.id,
    action: "USER_UPDATED",
    entity: { kind: "User", id: user._id },
    details: updates,
  });

  res.status(200).json({ success: true, user });
});

// @desc    Deactivate (soft delete) a user
// @route   DELETE /api/users/:id
// @access  Private (super_admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await Log.create({
    user: req.user.id,
    action: "USER_DEACTIVATED",
    entity: { kind: "User", id: user._id },
  });

  res.status(200).json({ success: true, message: "User deactivated" });
});
