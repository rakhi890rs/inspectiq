import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { ROLES } from "../config/constants.js";
import { getCertificate, getCertificates, issueCertificate, updateCertificate, verifyCertificate } from "../controllers/certificateController.js";

const router = express.Router();
router.get("/verify/:certificateNumber", verifyCertificate);
router.use(protect);
router.route("/").get(getCertificates).post(authorize(ROLES.AUDITOR, ROLES.SUPER_ADMIN), issueCertificate);
router.route("/:id").get(getCertificate).put(authorize(ROLES.AUDITOR, ROLES.SUPER_ADMIN), updateCertificate);
export default router;
