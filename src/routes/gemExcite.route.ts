import { Router } from 'express';

import { Routes } from '@/interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import GemExciteController from '@/controllers/gemExcite.controller';
import ValidationMiddleware from '@/middlewares/validation.middleware';
import {
  gemExciteOnboardingSchema,
  gemExciteAssignUserToRequestSchema,
} from '@/validator/gemExcite.validator';

/**
 * @swagger
 * tags:
 *   name: GEM Excite
 *   description: GEM Excite program management endpoints
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
 *     GemExciteOnboardingRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - area
 *         - agroCommodity
 *       properties:
 *         firstName:
 *           type: string
 *           description: First name of the participant
 *         lastName:
 *           type: string
 *           description: Last name of the participant
 *         area:
 *           type: string
 *           description: Geographic area of operation
 *         agroCommodity:
 *           type: string
 *           description: Agricultural commodity of interest
 *       example:
 *         firstName: "John"
 *         lastName: "Doe"
 *         area: "Western Region"
 *         agroCommodity: "Cocoa"
 *
 *     GemExciteOnboardingResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the participant
 *         userId:
 *           type: string
 *           description: Associated user ID
 *         firstName:
 *           type: string
 *           description: First name of the participant
 *         lastName:
 *           type: string
 *           description: Last name of the participant
 *         area:
 *           type: string
 *           description: Geographic area of operation
 *         agroCommodity:
 *           type: string
 *           description: Agricultural commodity of interest
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the participant was onboarded
 *       example:
 *         id: "gem123"
 *         userId: "user456"
 *         firstName: "John"
 *         lastName: "Doe"
 *         area: "Western Region"
 *         agroCommodity: "Cocoa"
 *         createdAt: "2023-01-15T14:30:00Z"
 *     AssignUserToRequestRequest:
 *       type: object
 *       required:
 *         - users
 *       properties:
 *         users:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - userId
 *               - quantity
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to assign
 *               quantity:
 *                 type: number
 *                 description: Quantity assigned
 *               quantityUnits:
 *                 type: string
 *                 description: Units for the quantity
 *           description: List of users to assign
 *       example:
 *         users:
 *           - userId: "user789"
 *             quantity: 10
 *             quantityUnits: "kg"
 *     AssignUserToRequestResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           description: Assignment result
 *     ClusterUsersResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             type: object
 *           description: List of users in the cluster
 *     ClusterUploadedCommoditiesResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             type: object
 *           description: List of uploaded commodities in the cluster
 */

class GemExciteRoute implements Routes {
  public path = '/gem-excite';
  public router = Router();
  public gemExciteController = new GemExciteController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /gem-excite/onboarding:
     *   post:
     *     summary: Onboard participant to GEM Excite program
     *     description: Register a new participant for the GEM Excite agricultural initiative
     *     tags: [GEM Excite]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/GemExciteOnboardingRequest'
     *     responses:
     *       200:
     *         description: Participant successfully onboarded
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/GemExciteOnboardingResponse'
     *       400:
     *         description: Invalid input data
     *       401:
     *         description: Unauthorized - Authentication required
     *       409:
     *         description: Participant already exists
     */
    this.router.post(
      `${this.path}/onboarding`,
      authMiddleware,
      ValidationMiddleware(gemExciteOnboardingSchema),
      this.gemExciteController.onboarding
    );

    /**
     * @swagger
     * /gem-excite/overview:
     *   get:
     *     summary: Get GEM Excite overview
     *     description: Retrieve an overview for the authenticated GEM Excite user
     *     tags: [GEM Excite]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Overview data
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 data:
     *                   type: object
     *       401:
     *         description: Unauthorized - Authentication required
     */
    this.router.get(
      `${this.path}/overview`,
      authMiddleware,
      this.gemExciteController.overview
    );

    /**
     * @swagger
     * /gem-excite/requests/{requestId}/assign-users:
     *   post:
     *     summary: Assign users to a request
     *     description: Assign one or more users to a GEM Excite request
     *     tags: [GEM Excite]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: requestId
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the request
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AssignUserToRequestRequest'
     *     responses:
     *       200:
     *         description: Users assigned successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AssignUserToRequestResponse'
     *       400:
     *         description: Invalid input data
     *       401:
     *         description: Unauthorized - Authentication required
     */
    this.router.post(
      `${this.path}/requests/:requestId/assign-users`,
      authMiddleware,
      ValidationMiddleware(gemExciteAssignUserToRequestSchema),
      this.gemExciteController.assignUserToRequest
    );

    /**
     * @swagger
     * /gem-excite/cluster/users:
     *   get:
     *     summary: Get users in the same cluster
     *     description: Retrieve all users belonging to the same cluster as the authenticated user
     *     tags: [GEM Excite]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: List of cluster users
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ClusterUsersResponse'
     *       401:
     *         description: Unauthorized - Authentication required
     */
    this.router.get(
      `${this.path}/cluster/users`,
      authMiddleware,
      this.gemExciteController.getClusterUsers
    );

    /**
     * @swagger
     * /gem-excite/cluster/uploaded-commodities:
     *   get:
     *     summary: Get uploaded commodities in the cluster
     *     description: Retrieve all commodities uploaded by users in the same cluster
     *     tags: [GEM Excite]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: List of uploaded commodities in the cluster
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ClusterUploadedCommoditiesResponse'
     *       401:
     *         description: Unauthorized - Authentication required
     */
    this.router.get(
      `${this.path}/cluster/uploaded-commodities`,
      authMiddleware,
      this.gemExciteController.getClusterUploadedCommodities
    );
  }
}

export default GemExciteRoute;
