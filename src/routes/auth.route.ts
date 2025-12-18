import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@middlewares/auth.middleware';
import ValidationMiddleware from '@/middlewares/validation.middleware';
import {
  offtakerSignupSchema,
  resendVerificationSchema,
  signupSchema,
  verifyUserSchema,
} from '@/validator/auth.validator';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication related endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SignupRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - phoneNumber
 *         - country
 *         - userType
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *         phoneNumber:
 *           type: string
 *           description: User's phone number
 *         country:
 *           type: string
 *           description: User's country
 *         userType:
 *           type: string
 *           enum: [Offtaker, Miner, Farmer, GemExcite]
 *           description: User type
 *       example:
 *         email: user@example.com
 *         password: StrongP@ssw0rd
 *         phoneNumber: +2349012345678
 *         country: Nigeria
 *         userType: Offtaker
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *       example:
 *         email: user@example.com
 *         password: StrongP@ssw0rd
 *     ResendVerificationRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *       example:
 *         email: user@example.com
 */

class AuthRoute implements Routes {
  public path = '/auth';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /auth/signup:
     *   post:
     *     summary: Sign up a new user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SignupRequest'
     *     responses:
     *       201:
     *         description: User signed up successfully
     *       400:
     *         description: Invalid input data
     */
    this.router.post(
      `${this.path}/signup`,
      ValidationMiddleware(signupSchema),
      this.authController.signUp
    );

    /**
     * @swagger
     * /auth/verify/{confirmationCode}:
     *   get:
     *     summary: Verify a user's account
     *     tags: [Auth]
     *     parameters:
     *       - in: path
     *         name: confirmationCode
     *         schema:
     *           type: string
     *         required: true
     *         description: Confirmation code sent to the user
     *     responses:
     *       200:
     *         description: User verified successfully
     *       400:
     *         description: Invalid confirmation code
     */
    this.router.get(
      `${this.path}/verify/:confirmationCode`,
      ValidationMiddleware(verifyUserSchema),
      this.authController.verifyUser
    );

    /**
     * @swagger
     * /auth/verify/resend:
     *   post:
     *     summary: Resend verification email
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ResendVerificationRequest'
     *     responses:
     *       201:
     *         description: Verification mail resent
     *       400:
     *         description: Error resending verification mail
     */
    this.router.post(
      `${this.path}/verify/resend`,
      ValidationMiddleware(resendVerificationSchema),
      this.authController.resendVerification
    );

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Log in a user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginRequest'
     *     responses:
     *       200:
     *         description: User logged in successfully
     *       401:
     *         description: Invalid credentials
     */
    this.router.post(`${this.path}/login`, this.authController.logIn);

    /**
     * @swagger
     * /auth/logout:
     *   post:
     *     summary: Log out a user
     *     tags: [Auth]
     *     responses:
     *       200:
     *         description: User logged out successfully
     */
    this.router.post(
      `${this.path}/logout`,
      authMiddleware,
      this.authController.logOut
    );
  }
}

export default AuthRoute;
