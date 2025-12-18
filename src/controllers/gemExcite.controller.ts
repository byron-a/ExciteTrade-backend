import { RequestWithUser } from '@/interfaces/auth.interface';
import { IGemExcite } from '@/interfaces/users.interface';
import GemExciteService from '@/services/gemExcite.service';
import {
  gemExciteAssignUserToRequestSchemaDto,
  gemExciteOnboardingSchemaDto,
} from '@/validator/gemExcite.validator';
import { Response, NextFunction } from 'express';

class GemExciteController {
  public gemExciteService = new GemExciteService();

  public onboarding = async (
    req: RequestWithUser<
      any,
      any,
      gemExciteOnboardingSchemaDto['body'],
      any,
      any,
      IGemExcite
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = req.body;
      const userData = req.user;
      const data = await this.gemExciteService.onboarding(userData, body);

      res
        .status(200)
        .json({ message: 'Gem excite onboarded successfully', data });
    } catch (err) {
      next(err);
    }
  };

  public overview = async (
    req: RequestWithUser<any, any, any, any, any, IGemExcite>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const data = await this.gemExciteService.overview(userData);

      res.status(200).json({ message: 'Gem excite overview', data });
    } catch (err) {
      next(err);
    }
  };

  public assignUserToRequest = async (
    req: RequestWithUser<
      gemExciteAssignUserToRequestSchemaDto['params'],
      any,
      gemExciteAssignUserToRequestSchemaDto['body'],
      any,
      any,
      IGemExcite
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { requestId } = req.params;
      const body = req.body;
      const userData = req.user;
      const data = await this.gemExciteService.asignUserToRequest(
        userData,
        requestId,
        body
      );

      res
        .status(200)
        .json({ message: 'User assigned to request successfully', data });
    } catch (err) {
      next(err);
    }
  };

  public getClusterUsers = async (
    req: RequestWithUser<any, any, any, any, any, IGemExcite>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const data = await this.gemExciteService.getClusterUsers(userData);

      res.status(200).json({ message: 'Cluster users', data });
    } catch (err) {
      next(err);
    }
  };

  public getClusterUploadedCommodities = async (
    req: RequestWithUser<any, any, any, any, any, IGemExcite>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const data =
        await this.gemExciteService.getClusterUploadedCommodities(userData);

      res.status(200).json({ message: 'Cluster uploaded commodities', data });
    } catch (err) {
      next(err);
    }
  };
}

export default GemExciteController;
