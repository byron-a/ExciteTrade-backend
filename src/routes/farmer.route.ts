import FarmerController from '@/controllers/farmer.controller';
import { Routes } from '@/interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import ValidationMiddleware from '@/middlewares/validation.middleware';
import {
  onboardingSchema,
  updateProfileSchema,
  uploadCommoditySchema,
} from '@/validator/farmer.validator';
import { Router } from 'express';

/**
 * @swagger
 * tags:
 *   name: Farmer
 *   description: Farmer related endpoints
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
 *     FarmerOnboardingRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - farmName
 *         - clusterId
 *         - farmLocation
 *         - commodityName
 *         - commodityProductionCapacity
 *       properties:
 *         firstName:
 *           type: string
 *           description: First name of the farmer
 *         lastName:
 *           type: string
 *           description: Last name of the farmer
 *         farmName:
 *           type: string
 *           description: Farmer farm name
 *         clusterId:
 *           type: string
 *           description: Cluster ID
 *         farmLocation:
 *           type: string
 *           description: Location of farmer farm
 *         commodityName:
 *           type: string
 *           description: Commodity farmer produce
 *         commodityProductionCapacity:
 *           type: number
 *           description: Production capacity of farmer farm
 *       example:
 *         firstName: "Jane"
 *         lastName: "Doe"
 *         farmName: "Green Acres"
 *         clusterId: "cluster123"
 *         farmLocation: "North Region"
 *         commodityName: "Maize"
 *         commodityProductionCapacity: 100
 *     FarmerUpdateProfileRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         farmName:
 *           type: string
 *         clusterId:
 *           type: string
 *         farmLocation:
 *           type: string
 *         commodityName:
 *           type: string
 *         commodityProductionCapacity:
 *           type: number
 *     FarmerUploadCommodityRequest:
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

class FarmerRoute implements Routes {
  public path = '/farmer';
  public router = Router();
  public farmerController = new FarmerController();

  constructor() {
    this.initialiizeRoutes();
  }

  private initialiizeRoutes() {
    /**
     * @swagger
     * /farmer/onboarding:
     *   post:
     *     summary: Onboard a new farmer
     *     tags: [Farmer]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/FarmerOnboardingRequest'
     *     responses:
     *       200:
     *         description: Farmer onboarded successfully
     *       400:
     *         description: Invalid input data
     *       401:
     *         description: Unauthorized
     */
    this.router.post(
      `${this.path}/onboarding`,
      authMiddleware,
      ValidationMiddleware(onboardingSchema),
      this.farmerController.onboarding
    );

    /**
     * @swagger
     * /farmer/update-profile:
     *   put:
     *     summary: Update farmer profile
     *     tags: [Farmer]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/FarmerUpdateProfileRequest'
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
      this.farmerController.updateProfile
    );

    /**
     * @swagger
     * /farmer/overview:
     *   get:
     *     summary: Get farmer overview
     *     tags: [Farmer]
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
      this.farmerController.overview
    );

    /**
     * @swagger
     * /farmer/upload-commodity:
     *   post:
     *     summary: Upload a commodity
     *     tags: [Farmer]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/FarmerUploadCommodityRequest'
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
      this.farmerController.uploadCommodity
    );

    /**
     * @swagger
     * /farmer/uploaded-commodities:
     *   get:
     *     summary: Get uploaded commodities
     *     tags: [Farmer]
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
      this.farmerController.getUploadedCommodities
    );
  }
}

export default FarmerRoute;
