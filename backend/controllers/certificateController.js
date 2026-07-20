import asyncHandler from "express-async-handler";
import QRCode from "qrcode";
import Certificate from "../models/Certificate.js";
import Building from "../models/Building.js";
import Log from "../models/Log.js";
import { ROLES } from "../config/constants.js";

// @desc    List certificates (owners see only their own buildings' certificates)
// @route   GET /api/certificates
// @access  Private
export const getCertificates = asyncHandler(async (req, res) => {
  const query = {};

  if (req.user.role === ROLES.OWNER) {
    const ownedBuildings = await Building.find({ owner: req.user.id }).select("_id");
    query.building = { $in: ownedBuildings.map((b) => b._id) };
  }

  // Keep status accurate: flip anything past its validUntil date to "expired"
  await Certificate.updateMany(
    { status: "active", validUntil: { $lt: new Date() } },
    { status: "expired" }
  );

  const certificates = await Certificate.find(query)
    .populate("building", "name buildingCode")
    .populate("issuedBy", "name")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: certificates.length, certificates });
});

// @desc    Issue a new certificate
// @route   POST /api/certificates
// @access  Private (super_admin, auditor)
export const createCertificate = asyncHandler(async (req, res) => {
  const { building, validUntil, safetyScore } = req.body;

  if (!building || !validUntil) {
    res.status(400);
    throw new Error("Building and validity date are required");
  }

  const certificate = await Certificate.create({
    building,
    validUntil,
    safetyScore,
    issuedBy: req.user.id,
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify/certificate/${certificate.certificateNumber}`;
  certificate.qrCodeUrl = await QRCode.toDataURL(verifyUrl);
  await certificate.save();

  await Log.create({
    user: req.user.id,
    action: "CERTIFICATE_ISSUED",
    entity: { kind: "Certificate", id: certificate._id },
  });

  const populated = await Certificate.findById(certificate._id)
    .populate("building", "name buildingCode")
    .populate("issuedBy", "name");

  res.status(201).json({ success: true, certificate: populated });
});

// @desc    Revoke/delete a certificate
// @route   DELETE /api/certificates/:id
// @access  Private (super_admin, auditor)
export const deleteCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);
  if (!certificate) {
    res.status(404);
    throw new Error("Certificate not found");
  }

  await certificate.deleteOne();

  await Log.create({
    user: req.user.id,
    action: "CERTIFICATE_DELETED",
    entity: { kind: "Certificate", id: certificate._id },
  });

  res.status(200).json({ success: true, message: "Certificate removed" });
});