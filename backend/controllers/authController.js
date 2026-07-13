import crypto from "crypto";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Log from "../models/Log.js";
import { sendTokenResponse } from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import {
  verificationEmailTemplate,
  resetPasswordEmailTemplate,
} from "../utils/emailTemplates.js";
import { ROLE_LIST, ROLES } from "../config/constants.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, department } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  // Only allow self-registration as an Owner. Auditors/Admins are
  // provisioned by a Super Admin via the admin panel.
  const assignedRole = role && role === ROLES.OWNER ? role : ROLES.OWNER;
  if (role && !ROLE_LIST.includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    department,
    role: assignedRole,
  });

  const verifyToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Verify your SafeBuild AI account",
      html: verificationEmailTemplate(user.name, verifyUrl),
    });
  } catch (err) {
    // Registration should still succeed even if the email fails to send;
    // the user can request a new verification link later.
    console.error("Verification email failed to send:", err.message);
  }

  await Log.create({ user: user._id, action: "USER_REGISTERED" });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("This account has been deactivated. Contact an administrator.");
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  await Log.create({ user: user._id, action: "USER_LOGIN" });

  sendTokenResponse(user, 200, res);
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Verification link is invalid or has expired");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: "Email verified successfully" });
});

// @desc    Forgot password - sends reset link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  // Always respond with success to avoid leaking which emails are registered
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If that email exists, a reset link has been sent",
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "SafeBuild AI - Password Reset Request",
      html: resetPasswordEmailTemplate(user.name, resetUrl),
    });
    res.status(200).json({
      success: true,
      message: "If that email exists, a reset link has been sent",
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error("Email could not be sent, please try again later");
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    res.status(400);
    throw new Error("Reset link is invalid or has expired");
  }

  if (!req.body.password || req.body.password.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  await Log.create({ user: user._id, action: "PASSWORD_RESET" });

  sendTokenResponse(user, 200, res);
});

// @desc    Update own profile (name, phone, photo, notification prefs)
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "phone", "photo", "notificationPreferences"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, user });
});

// @desc    Change password while logged in
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }
  if (!newPassword || newPassword.length < 8) {
    res.status(400);
    throw new Error("New password must be at least 8 characters");
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});
