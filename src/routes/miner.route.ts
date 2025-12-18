import MinerController from '@/controllers/miner.controller';
import { Routes } from '@/interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import ValidationMiddleware from '@/middlewares/validation.middleware';
import {
  onboardingSchema,
  updateProfileSchema,
  uploadCommoditySchema,
} from '@/validator/miner.validator';
import { Router } from 'express';

/**
 * @swagger
 * tags:
 *   name: Miner
 *   description: Miner related endpoints
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     MinerOnboardingRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - mineName
 *         - clusterId
 *         - mineLocation
 *         - commodityName
 *         - commodityProductionCapacity
 *       properties:
 *         firstName:
 *           type: string
 *           description: First name of the miner
 *         lastName:
 *           type: string
 *           description: Last name of the miner
 *         mineName:
 *           type: string
 *           description: Name of the mine
 *         clusterId:
 *           type: string
 *           description: Cluster ID
 *         mineLocation:
 *           type: string
 *           description: Location of the mine
 *         commodityName:
 *           type: string
 *           description: Name of the commodity being mined
 *         commodityProductionCapacity:
 *           type: number
 *           description: Production capacity of mine
 *       example:
 *         firstName: John
 *         lastName: Doe
 *         mineName: Golden Peak Mine
 *         clusterId: cluster123
 *         mineLocation: Nevada, USA
 *         commodityName: Gold
 *         commodityProductionCapacity: 100
 *     MinerUpdateProfileRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         mineName:
 *           type: string
 *         clusterId:
 *           type: string
 *         mineLocation:
 *           type: string
 *         commodityName:
 *           type: string
 *         commodityProductionCapacity:
 *           type: number
 *     MinerUploadCommodityRequest:
 *       type: object
 *       required:
 *         - commodity
 *         - pricePerTonne
 *         - quantity
 *         - weight
 *         - warehouse
 *         - request
 *       properties:
 *         commodity:
 *           type: string
 *         pricePerTonne:
 *           type: number
 *         quantity:
 *           type: number
 *         weight:
 *           type: number
 *         warehouse:
 *           type: string
 *         request:
 *           type: string
 */

class MinerRoute implements Routes {
  public path = '/miner';
  public router = Router();
  public minerController = new MinerController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /miner/onboarding:
     *   post:
     *     summary: Onboard a new miner
     *     tags: [Miner]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/MinerOnboardingRequest'
     *     responses:
     *       200:
     *         description: Miner onboarded successfully
     *       400:
     *         description: Invalid input data
     *       401:
     *         description: Unauthorized
     */
    this.router.post(
      `${this.path}/onboarding`,
      authMiddleware,
      ValidationMiddleware(onboardingSchema),
      this.minerController.onboarding
    );

    /**
     * @swagger
     * /miner/update-profile:
     *   put:
     *     summary: Update miner profile
     *     tags: [Miner]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/MinerUpdateProfileRequest'
     *     responses:
     *       200:
     *         description: Profile updated successfully
     *       400:
     *         description: Invalid input data
     *       401:
     *         description: Unauthorized
     */
    this.router.put(
      `${this.path}/update-profile`,
      authMiddleware,
      ValidationMiddleware(updateProfileSchema),
      this.minerController.updateProfile
    );

    /**
     * @swagger
     * /miner/overview:
     *   get:
     *     summary: Get miner overview
     *     tags: [Miner]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Overview fetched successfully
     *       401:
     *         description: Unauthorized
     */
    this.router.get(
      `${this.path}/overview`,
      authMiddleware,
      this.minerController.overview
    );

    /**
     * @swagger
     * /miner/upload-commodity:
     *   post:
     *     summary: Upload a commodity
     *     tags: [Miner]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/MinerUploadCommodityRequest'
     *     responses:
     *       200:
     *         description: Commodity uploaded successfully
     *       400:
     *         description: Invalid input data
     *       401:
     *         description: Unauthorized
     */
    this.router.post(
      `${this.path}/upload-commodity`,
      authMiddleware,
      ValidationMiddleware(uploadCommoditySchema),
      this.minerController.uploadCommodity
    );

    /**
     * @swagger
     * /miner/uploaded-commodities:
     *   get:
     *     summary: Get uploaded commodities
     *     tags: [Miner]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Uploaded commodities fetched successfully
     *       401:
     *         description: Unauthorized
     */
    this.router.get(
      `${this.path}/uploaded-commodities`,
      authMiddleware,
      this.minerController.getUploadedCommodities
    );
  }
}

export default MinerRoute;
