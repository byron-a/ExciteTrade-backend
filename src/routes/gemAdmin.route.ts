import { Router } from "express";
import { Routes } from "@/interfaces/routes.interface";
import GemAdminController from "@/controllers/gemAdmin.controller";
import authMiddleware from "@/middlewares/auth.middleware";
import ValidationMiddleware from "@/middlewares/validation.middleware";
import { createClusterSchema, updateClusterSchema } from "@/validator/cluster.validator";
import { registerStaffSchema } from "@/validator/gemAdmin.validator";



class GemAdminRoutes implements Routes {
  public router = Router();
  public path = '/gemadmin';
  public gemAdminController = new GemAdminController();

  constructor() {
    this.initializeRoutes();
  };

  private initializeRoutes() {
    this.router.get(`${this.path}/overview`, authMiddleware, this.gemAdminController.overview);

    this.router.post(
      `${this.path}/cluster/create`,
      authMiddleware,
      ValidationMiddleware(createClusterSchema),
      this.gemAdminController.createCluster
    );

    this.router.put(
      `${this.path}/cluster/:clusterId`,
      authMiddleware,
      ValidationMiddleware(updateClusterSchema),
      this.gemAdminController.updateToCluster);

    this.router.patch(`${this.path}/cluster/detach/:clusterCode`, authMiddleware, this.gemAdminController.detachFromCluster);

    this.router.delete(`${this.path}/cluster/:clusterId`, authMiddleware, this.gemAdminController.deleteCluster);

    this.router.get(`${this.path}/allusers`, authMiddleware, this.gemAdminController.getUsers4GemAdmin);

    this.router.post(
      `${this.path}/register-staff`,
      authMiddleware,
      ValidationMiddleware(registerStaffSchema), this.gemAdminController.registerStaffs);

    this.router.delete(`${this.path}/unregister-staff/:userId`, authMiddleware, this.gemAdminController.unregisterStaffs)
  };


};

export default GemAdminRoutes;
