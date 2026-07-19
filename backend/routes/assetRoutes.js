import express from "express";
import {
  getAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
} from "../controllers/assetController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getAssets)
  .post(authorize(ROLES.SUPER_ADMIN, ROLES.AUDITOR, ROLES.OWNER), createAsset);

router
  .route("/:id")
  .get(getAsset)
  .put(authorize(ROLES.SUPER_ADMIN, ROLES.AUDITOR, ROLES.OWNER), updateAsset)
  .delete(authorize(ROLES.SUPER_ADMIN, ROLES.AUDITOR, ROLES.OWNER), deleteAsset);

export default router;