import asyncHandler from "express-async-handler";
import Certificate from "../models/Certificate.js";
import Building from "../models/Building.js";
import NOCApplication from "../models/NOCApplication.js";
import { NOC_STATUS, ROLES } from "../config/constants.js";

const populateCertificate = (query) => query.populate("building", "name buildingCode address owner").populate("issuedBy", "name email").populate("nocApplication", "applicationNumber status");

export const getCertificates = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.building) query.building = req.query.building;
  if (req.user.role === ROLES.OWNER) {
    const buildings = await Building.find({ owner: req.user.id }).select("_id");
    query.building = { $in: buildings.map(({ _id }) => _id) };
  }
  const certificates = await populateCertificate(Certificate.find(query).sort({ validUntil: 1 }));
  res.json({ success: true, count: certificates.length, certificates });
});

export const getCertificate = asyncHandler(async (req, res) => {
  const certificate = await populateCertificate(Certificate.findById(req.params.id));
  if (!certificate) { res.status(404); throw new Error("Certificate not found"); }
  if (req.user.role === ROLES.OWNER && certificate.building.owner.toString() !== req.user.id) { res.status(403); throw new Error("Not authorized to view this certificate"); }
  res.json({ success: true, certificate });
});

export const issueCertificate = asyncHandler(async (req, res) => {
  const { building, nocApplication, validUntil, pdfUrl, qrCodeUrl, digitalSignatureUrl } = req.body;
  if (!building || !validUntil) { res.status(400); throw new Error("Building and valid-until date are required"); }
  const certificate = await Certificate.create({ building, nocApplication, validUntil, pdfUrl, qrCodeUrl, digitalSignatureUrl, issuedBy: req.user.id });
  await Building.findByIdAndUpdate(building, { certificateStatus: "certified" });
  if (nocApplication) await NOCApplication.findByIdAndUpdate(nocApplication, { certificate: certificate._id, status: NOC_STATUS.CERTIFICATE_ISSUED, decidedAt: new Date() });
  res.status(201).json({ success: true, certificate });
});

export const updateCertificate = asyncHandler(async (req, res) => {
  const updates = {};
  ["validUntil", "status", "pdfUrl", "qrCodeUrl", "digitalSignatureUrl"].forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
  const certificate = await Certificate.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!certificate) { res.status(404); throw new Error("Certificate not found"); }
  if (updates.status === "expired" || updates.status === "revoked") await Building.findByIdAndUpdate(certificate.building, { certificateStatus: "expired" });
  res.json({ success: true, certificate });
});

export const verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await populateCertificate(Certificate.findOne({ certificateNumber: req.params.certificateNumber }));
  if (!certificate) { res.status(404); throw new Error("Certificate not found"); }
  certificate.verificationCount += 1;
  await certificate.save();
  res.json({ success: true, valid: certificate.status === "active" && certificate.validUntil >= new Date(), certificate });
});
