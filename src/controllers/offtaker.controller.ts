import { NextFunction, Request, Response } from 'express';
import { RequestWithUser } from '@interfaces/auth.interface';
import OfftakerService from '@/services/offtaker.service';
import {
  getOrderDto,
  offtakerCheckoutDto,
  offtakerOnboardingDto,
} from '@/validator/offtaker.validator';
import { IOfftaker } from '@/interfaces/users.interface';

class OfftakerController {
  public offtakerService = new OfftakerService();

  public onboarding = async (
    req: RequestWithUser<
      any,
      any,
      offtakerOnboardingDto['body'],
      any,
      any,
      IOfftaker
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const body = req.body;

      const onboardedUser = await this.offtakerService.onboarding(
        userData,
        body
      );

      res
        .status(200)
        .json({ data: onboardedUser, message: 'Onboarded offtaker' });
    } catch (error) {
      next(error);
    }
  };

  public checkout = async (
    req: RequestWithUser<
      any,
      any,
      offtakerCheckoutDto['body'],
      any,
      any,
      IOfftaker
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const body = req.body;

      const data = await this.offtakerService.checkout(userData, body);

      res.status(200).json({ message: 'Checkout successful', data });
    } catch (error) {
      next(error);
    }
  };

  public getOrders = async (
    req: RequestWithUser<
      any,
      any,
      offtakerCheckoutDto['body'],
      any,
      any,
      IOfftaker
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const data = await this.offtakerService.getOrders(userData);

      res.status(200).json({ message: 'Orders retreived successfully', data });
    } catch (error) {
      next(error);
    }
  };

  public getOrder = async (
    req: RequestWithUser<getOrderDto['params'], any, any, any, any, IOfftaker>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const { orderId } = req.params;

      const data = await this.offtakerService.getOrder(userData, orderId);

      res.status(200).json({ message: 'Orders retreived successfully', data });
    } catch (error) {
      next(error);
    }
  };

  public requestOrder = async () => { };
}

export default OfftakerController;
