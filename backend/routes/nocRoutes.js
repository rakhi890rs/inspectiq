import express from "express";
import {
  getApplications,
  getApplication,
  createApplication,
  updateApplicationStatus,
  assignInspector,
  deleteApplication,
} from "../controllers/nocController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getApplications).post(createApplication);

router.route("/:id").get(getApplication).delete(deleteApplication);

router.put(
  "/:id/status",
  authorize(ROLES.SUPER_ADMIN, ROLES.AUDITOR),
  updateApplicationStatus
);

router.put("/:id/assign", authorize(ROLES.SUPER_ADMIN), assignInspector);

export default router;