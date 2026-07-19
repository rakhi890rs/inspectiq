import express from "express";
import {
  getAudits,
  getAudit,
  createAudit,
  updateAudit,
  deleteAudit,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
} from "../controllers/auditController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getAudits)
  .post(authorize(ROLES.SUPER_ADMIN, ROLES.AUDITOR), createAudit);

router
  .route("/:id")
  .get(getAudit)
  .put(authorize(ROLES.SUPER_ADMIN, ROLES.AUDITOR), updateAudit)
  .delete(authorize(ROLES.SUPER_ADMIN, ROLES.AUDITOR), deleteAudit);

router
  .route("/:id/checklist")
  .post(authorize(ROLES.SUPER_ADMIN, ROLES.AUDITOR), addChecklistItem);

router
  .route("/:id/checklist/:itemId")
  .put(authorize(ROLES.SUPER_ADMIN, ROLES.AUDITOR), updateChecklistItem)
  .delete(authorize(ROLES.SUPER_ADMIN, ROLES.AUDITOR), deleteChecklistItem);

export default router;