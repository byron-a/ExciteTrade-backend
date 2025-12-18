import { NextFunction, Request, Response } from "express";
import { RequestWithUser } from "@/interfaces/auth.interface";
import GemAdminService from "@/services/gemAdmin.service";
import {
  createClusterDto,
  updateClusterDto,
} from '@/validator/cluster.validator';
import { IUser } from "@/interfaces/users.interface";
import { ICluster } from "@/models/cluster.model";
import { getAllUserDTO, registerStaffDTO } from "@/validator/gemAdmin.validator";


class GemAdminController {
  public gemAdminService = new GemAdminService();

  public overview = async (req: RequestWithUser<any, any>, res: Response, next: NextFunction) => {
    try {
      const operatorData = req.user;

      const {
        clusterCount,
        gemExciteCount,
        warehouseCount,
        orders
      } = await this.gemAdminService.gemAdminOverview(operatorData);

      res
        .status(201)
        .json({
          data: { clusterCount, gemExciteCount, warehouseCount, orders },
          message:"GemAdmin Overview fetched Successfully"
        });

    } catch (error) {
      next(error);
    }
   };

  public createCluster = async (
    req: RequestWithUser<any, any, createClusterDto['body']>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const clusterBody = req.body;
      const userData = req.user;
      // console.log(req.query, req.user);
      const createWithNewClusterData =
        await this.gemAdminService.creatingCluster(clusterBody, userData);

      if (createWithNewClusterData) {
        res.status(200).json({
          data: createWithNewClusterData,
          message: 'A new Cluster has been created!',
        });
      }
    } catch (error) {
      console.log('could not access clusterService');
      next(error);
    }
  };

  public updateToCluster = async (
    req: RequestWithUser<
      updateClusterDto['params'],
      any,
      updateClusterDto['body']
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { clusterId } = req.params;
      const updateData = req.body;
      const userData = req.user;

      const addToCluster = await this.gemAdminService.updateToCluster(
        userData,
        clusterId,
        updateData,
      );
      if (addToCluster) {
        res.status(200).json({
          data: addToCluster,
          message: `${addToCluster.name} Cluster has been updated!`,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  public detachFromCluster = async (req: RequestWithUser<{clusterCode: string}, any, {userType:string,userId:string}>, res: Response, next: NextFunction) => {
    const operatorUserData = req.user;
    const { clusterCode } = req.params;
    const body = req.body;

    try {
      const {update, message} = await this.gemAdminService.detachFromCluster(operatorUserData, clusterCode, body);

      res.status(200).json({ data: update, message });
    } catch (error) {
      // console.log('Can not get to detachGemService')
      next(error);
    }
   };

  public deleteCluster = async (req: RequestWithUser<{ clusterId: string }, any, any>, res: Response, next: NextFunction) => {
    const { clusterId } = req.params;
    const operatorUserData = req.user;
    try {
      const deleteEvent = await this.gemAdminService.deleteCluster(clusterId, operatorUserData);

      res.status(200).json({data:deleteEvent, message:"Cluster has been deleted Successfully"})
    } catch (error) {
       next(error)
    }
  };

  public createWarehouse = async () => {};

  public updateToWarehouse = async () => { };

  public detachFromWarehouse = async (req: RequestWithUser<{ warehouseId: string }, any, any>, res: Response, next: NextFunction) => {
    try {
      // const { clusterId } = req.params;
      // const operatorData = req.user;
      // const

    } catch (error) {

    }
   };

  public deleteWarehouse = async () => { };

  public getUsers4GemAdmin = async (req: RequestWithUser<any, any, getAllUserDTO['query']>, res: Response, next: NextFunction) => {
    const query = req.query;
    const operatorUserData = req.user;

    try {
      const allUsers = await this.gemAdminService.getUsers4GemAdmin(query, operatorUserData);

      res.status(200).json({ data: allUsers, message: "Users fetched Successfully" })
    } catch (error) {
      next(error);
    }
  };

  public registerStaffs = async (req: RequestWithUser<any, any, registerStaffDTO['body']>, res: Response, next: NextFunction) => {
    const registrationData = req.body;
    const operatorData = req.user;
    try {
      const registerNewStaff = await this.gemAdminService.registerStaffs(operatorData, registrationData);
      res.status(200).json({ data: registerNewStaff, message: `A ${registerNewStaff.userType} has been registered successfully` })
    } catch (error) {
      next(error)
    }
  };

  public unregisterStaffs = async (req:RequestWithUser<{userId:string},any>,res:Response, next:NextFunction) => {
    try {
      const operatorData = req.user;
      const { userId } = req.params;

      const deleteEvent = await this.gemAdminService.unregisterStaffs(userId, operatorData);

      res.status(200).json({data:deleteEvent, message:"Delete Action Successful"})

    } catch (error) {
      next(error)
    }
  }
};

export default GemAdminController;
