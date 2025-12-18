import { RequestWithUser } from '@/interfaces/auth.interface';
import AdminServices from '@/services/admin.service';
import { createAdminDto, loginAdminDto } from '@/validator/admin.validator';
import {
  createClusterDto,
  updateClusterDto,
} from '@/validator/cluster.validator';
import {
  createWarehouseDto,
  updateWarehouseDto,
} from '@/validator/warehouse.validator';
import { NextFunction, Request, Response } from 'express';

class AdminController {
  public adminService = new AdminServices();

  public createAdmin = async (
    req: Request<any, any, createAdminDto['body']>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = req.body;
      const data = await this.adminService.createAdmin(body);

      res.status(201).json({ data, message: 'Admin created successfully' });
    } catch (error) {
      next(error);
    }
  };

  public login = async (
    req: Request<any, any, loginAdminDto['body']>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = req.body;
      const data = await this.adminService.login(body);

      res.status(201).json({ data, message: 'Logged-in successfully' });
    } catch (error) {
      next(error);
    }
  };

  // public createCluster = async (
  //   req: RequestWithUser<any, any, createClusterDto['body']>,
  //   res: Response,
  //   next: NextFunction
  // ) => {
  //   try {
  //     const userData = req.user;
  //     const body = req.body;
  //     const data = await this.adminService.createCluster(userData, body);

  //     res.status(201).json({ data, message: 'Cluster created successfully'});
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  public updateCluster = async (
    req: RequestWithUser<{ clusterId: string }, any, updateClusterDto['body']>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const { clusterId } = req.params;
      const body = req.body;

      const data = await this.adminService.updateCluster(
        userData,
        clusterId,
        body
      );

      res.status(200).json({ data, message: 'Cluster updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  public addGemExciteToCluster = async (
    req: RequestWithUser<{ clusterId: string; gemExciteId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const { clusterId, gemExciteId } = req.params;

      const data = await this.adminService.addGemExciteToCluster(
        userData,
        gemExciteId,
        clusterId
      );

      res.status(200).json({
        data,
        message: 'Gem excite added to cluster updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public createWarehouse = async (
    req: RequestWithUser<any, any, createWarehouseDto['body']>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const body = req.body;

      const data = await this.adminService.createWarehouse(userData, body);

      res.status(201).json({ data, message: 'Warehouse created successfully' });
    } catch (error) {
      next(error);
    }
  };

  public updateWarehouse = async (
    req: RequestWithUser<
      { warehouseId: string },
      any,
      updateWarehouseDto['body']
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const { warehouseId } = req.params;
      const body = req.body;

      const data = await this.adminService.updateWarehouse(
        userData,
        warehouseId,
        body
      );

      res.status(201).json({ data, message: 'Warehouse updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  public addAdminToWarehouse = async (
    req: RequestWithUser<{ warehouseId: string; gemExciteId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const { warehouseId, gemExciteId } = req.params;

      const data = await this.adminService.addAdminToWarehouse(
        userData,
        gemExciteId,
        warehouseId
      );

      res.status(201).json({
        data,
        message: 'Admin added to warehouse successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteWarehouse = async (
    req: RequestWithUser<{ warehouseId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const { warehouseId } = req.params;

      const data = await this.adminService.deleteWarehouse(
        userData,
        warehouseId
      );

      res.status(201).json({ data, message: 'Warehouse deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  public getClustersInWarehouse = async (
    req: RequestWithUser<{ warehouseId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const { warehouseId } = req.params;

      const data = await this.adminService.getClustersInWarehouse(
        userData,
        warehouseId
      );

      res
        .status(201)
        .json({ data, message: 'Warehouse clusters fetched successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminController;
