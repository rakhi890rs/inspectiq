import express from "express";
import {
  getBuildings,
  getBuilding,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} from "../controllers/buildingController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getBuildings)
  .post(authorize(ROLES.OWNER, ROLES.SUPER_ADMIN), createBuilding);

router
  .route("/:id")
  .get(getBuilding)
  .put(authorize(ROLES.OWNER, ROLES.SUPER_ADMIN, ROLES.AUDITOR), updateBuilding)
  .delete(authorize(ROLES.OWNER, ROLES.SUPER_ADMIN), deleteBuilding);

export default router;
