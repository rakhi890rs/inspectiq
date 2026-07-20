import express from "express";
import {
  getCertificates,
  createCertificate,
  deleteCertificate,
} from "../controllers/certificateController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getCertificates)
  .post(authorize(ROLES.SUPER_ADMIN, ROLES.AUDITOR), createCertificate);

router.delete("/:id", authorize(ROLES.SUPER_ADMIN, ROLES.AUDITOR), deleteCertificate);

export default router;