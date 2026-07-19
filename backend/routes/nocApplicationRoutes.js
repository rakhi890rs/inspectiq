import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { ROLES } from "../config/constants.js";
import { createNOCApplication, getNOCApplication, getNOCApplications, updateNOCApplication } from "../controllers/nocApplicationController.js";

const router = express.Router();
router.use(protect);
router.route("/").get(getNOCApplications).post(authorize(ROLES.OWNER, ROLES.SUPER_ADMIN), createNOCApplication);
router.route("/:id").get(getNOCApplication).put(authorize(ROLES.OWNER, ROLES.AUDITOR, ROLES.SUPER_ADMIN), updateNOCApplication);
export default router;
