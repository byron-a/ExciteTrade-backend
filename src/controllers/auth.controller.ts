import { NextFunction, Request, Response } from 'express';
import { RequestWithUser } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import AuthService from '@services/auth.service';
import {
  loginDto,
  resendVerificationDto,
  signupDto,
  verifyUserDto,
} from '@/validator/auth.validator';
import { IUser } from '@/interfaces/users.interface';

class AuthController {
  public authService = new AuthService();

  public signUp = async (
    req: Request<any, any, signupDto['body']>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.body;
      const signUpUserData = await this.authService.signup(userData);

      res
        .status(201)
        .json({ data: signUpUserData, message: 'User created successfully' });
    } catch (error) {
      next(error);
    }
  };

  public verifyUser = async (
    req: Request<verifyUserDto['params'], {}, {}>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const confirmationCode = req.params.confirmationCode;
      const verifiedUserData =
        await this.authService.verifyUser(confirmationCode);
      console.log(verifiedUserData);
      res.status(200).json({
        data: verifiedUserData,
        message: 'User verified successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public resendVerification = async (
    req: Request<{}, {}, resendVerificationDto['body']>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = req.body;
      const data = await this.authService.resendVerification(body);

      res.status(200).json({
        data,
        message: 'Verification mail resent',
      });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (
    req: Request<{}, {}, loginDto['body']>,
    res: Response,
    next: NextFunction
  ) => {
    // console.log(req.body)
    try {
      const userData = req.body;
      const { cookie, user, token } = await this.authService.login(userData);

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({
        data: { ...user.toObject(),password:undefined, token },
        message: 'Logged-in successful',
      });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData: IUser = req.user;
      const logOutUserData: IUser = await this.authService.logout(userData);

      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      res.status(200).json({ data: logOutUserData, message: `logout` });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
