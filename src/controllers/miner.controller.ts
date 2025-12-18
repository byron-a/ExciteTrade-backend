import { RequestWithUser } from '@/interfaces/auth.interface';
import { IMiner } from '@/models/users.model';
import MinerService from '@/services/miner.service';
import {
  onboardingSchemaDto,
  updateProfileSchemaDto,
  uploadCommodityDto,
} from '@/validator/miner.validator';
import { NextFunction, Response } from 'express';

class MinerController {
  public MinerService = new MinerService();

  public onboarding = async (
    req: RequestWithUser<
      any,
      any,
      onboardingSchemaDto['body'],
      any,
      any,
      IMiner
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const data = req.body;

      const onboardedMiner = await this.MinerService.onboarding(userData, data);

      res
        .status(200)
        .json({ data: onboardedMiner, message: 'Onboarding successfull' });
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
      IMiner
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const body = req.body;

      const updatedProfile = await this.MinerService.updateProfile(
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
    req: RequestWithUser<any, any, any, any, any, IMiner>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;

      const overviewData = await this.MinerService.overview(userData);

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
      IMiner
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const body = req.body;

      const commodity = await this.MinerService.uploadCommodity(userData, body);

      res
        .status(200)
        .json({ data: commodity, message: 'Commodity uploaded successfully' });
    } catch (error) {
      next(error);
    }
  };

  public getUploadedCommodities = async (
    req: RequestWithUser<any, any, any, any, any, IMiner>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;

      const commodities =
        await this.MinerService.getUploadedCommodities(userData);

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

export default MinerController;
