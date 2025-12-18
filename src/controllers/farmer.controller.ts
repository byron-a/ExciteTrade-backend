import { RequestWithUser } from '@/interfaces/auth.interface';
import { IFarmer } from '@/interfaces/users.interface';
import FarmerService from '@/services/farmer.service';
import {
  onboardingSchemaDto,
  updateProfileSchemaDto,
  uploadCommodityDto,
} from '@/validator/farmer.validator';
import { NextFunction, Response } from 'express';

class FarmerController {
  public farmerService = new FarmerService();

  public onboarding = async (
    req: RequestWithUser<
      any,
      any,
      onboardingSchemaDto['body'],
      any,
      any,
      IFarmer
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const data = req.body;

      const onboardedFarmer = await this.farmerService.onboarding(
        userData,
        data
      );

      res
        .status(200)
        .json({ data: onboardedFarmer, message: 'Onboarding successfull' });
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (
    req: RequestWithUser<
      any,
      any,
      updateProfileSchemaDto['body'],
      any,
      any,
      IFarmer
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const body = req.body;

      const updatedProfile = await this.farmerService.updateProfile(
        userData,
        body
      );

      res
        .status(200)
        .json({
          data: updatedProfile,
          message: 'Profile updated successfully',
        });
    } catch (error) {
      next(error);
    }
  };

  public overview = async (
    req: RequestWithUser<any, any, any, any, any, IFarmer>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;

      const overviewData = await this.farmerService.overview(userData);

      res
        .status(200)
        .json({ data: overviewData, message: 'Overview fetched successfully' });
    } catch (error) {
      next(error);
    }
  };

  public uploadCommodity = async (
    req: RequestWithUser<
      any,
      any,
      uploadCommodityDto['body'],
      any,
      any,
      IFarmer
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const body = req.body;

      const commodity = await this.farmerService.uploadCommodity(
        userData,
        body
      );

      res
        .status(200)
        .json({ data: commodity, message: 'Commodity uploaded successfully' });
    } catch (error) {
      next(error);
    }
  };

  public getUploadedCommodities = async (
    req: RequestWithUser<any, any, any, any, any, IFarmer>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;

      const commodities =
        await this.farmerService.getUploadedCommodities(userData);

      res
        .status(200)
        .json({
          data: commodities,
          message: 'Uploaded commodities fetched successfully',
        });
    } catch (error) {
      next(error);
    }
  };
}

export default FarmerController;
