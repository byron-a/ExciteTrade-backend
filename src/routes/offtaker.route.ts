import OfftakerController from '@/controllers/offtaker.controller';
import { Routes } from '@/interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import ValidationMiddleware from '@/middlewares/validation.middleware';
import {
  getOrderSchema,
  offtakerCheckoutSchema,
  offtakerOnboardingSchema,
} from '@/validator/offtaker.validator';
import { Router } from 'express';

/**
 * @swagger
 * tags:
 *   name: Offtaker
 *   description: Offtaker related endpoints
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
 *     OfftakerOnboardingRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - phoneNumber
 *         - companyName
 *         - companyCountry
 *         - companyRole
 *         - companyEmployeeCount
 *         - companyAddress
 *         - companyState
 *         - companyCity
 *         - companyZipCode
 *         - companyWebsite
 *       properties:
 *         firstName:
 *           type: string
 *           description: First name of the offtaker
 *         lastName:
 *           type: string
 *           description: Last name of the offtaker
 *         phoneNumber:
 *           type: string
 *           description: Phone number of the offtaker
 *         companyName:
 *           type: string
 *           description: Name of the company
 *         companyCountry:
 *           type: string
 *           description: Country where the company is located
 *         companyPosition:
 *           type: string
 *           description: Role of the offtaker in the company
 *         companyEmployeeCount:
 *           type: string
 *           description: Number of employees in the company
 *         companyAddress:
 *           type: string
 *           description: Address of the company
 *         companyState:
 *           type: string
 *           description: State where the company is located
 *         companyCity:
 *           type: string
 *           description: City where the company is located
 *         companyZipCode:
 *           type: string
 *           description: ZIP code of the company's location
 *         companyWebsite:
 *           type: string
 *           description: Website of the company
 *         preferredProducts:
 *           type: array
 *           items:
 *             type: string
 *           description: Preferred products (optional)
 *         preferredUnitsOfMeasurement:
 *           type: string
 *           description: Preferred units of measurement (optional)
 *         preferredCurrency:
 *           type: string
 *           description: Preferred currency (optional)
 *       example:
 *         firstName: John
 *         lastName: Doe
 *         phoneNumber: "+1234567890"
 *         companyName: Example Inc.
 *         companyCountry: USA
 *         companyPosition: Manager
 *         companyEmployeeCount: "50-100"
 *         companyAddress: "123 Business Street"
 *         companyState: California
 *         companyCity: San Francisco
 *         companyZipCode: "94101"
 *         companyWebsite: "https://example.com"
 *         preferredProducts: ["Electronics", "Textiles"]
 *         preferredUnitsOfMeasurement: "tonne"
 *         preferredCurrency: "USD"
 *     OfftakerCheckoutRequest:
 *       type: object
 *       required:
 *         - clusters
 *         - bondedWarehouse
 *       properties:
 *         clusters:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               clusterId:
 *                 type: string
 *                 description: ID of the cluster
 *               quantity:
 *                 type: number
 *                 description: Quantity to purchase
 *           description: List of clusters to purchase
 *         bondedWarehouse:
 *           type: string
 *           description: ID of the bonded warehouse
 *       example:
 *         clusters:
 *           - clusterId: "cluster123"
 *             quantity: 100
 *           - clusterId: "cluster456"
 *             quantity: 50
 *         bondedWarehouse: "warehouse789"
 *
 *     GetOrderRequest:
 *       type: object
 *       required:
 *         - orderId
 *       properties:
 *         orderId:
 *           type: string
 *           description: ID of the order to retrieve
 *       example:
 *         orderId: "order123"
 *
 *     OrderResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Order ID
 *         status:
 *           type: string
 *           description: Current status of the order
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the order was created
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               clusterId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *       example:
 *         id: "order123"
 *         status: "pending"
 *         createdAt: "2023-01-01T12:00:00Z"
 *         items:
 *           - clusterId: "cluster123"
 *             quantity: 100
 *             price: 5000
 *
 *     OrdersListResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/OrderResponse'
 */

class OfftakerRoute implements Routes {
  public path = '/offtaker';
  public router = Router();
  public offtakerController = new OfftakerController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /offtaker/onboarding:
     *   post:
     *     summary: Onboard a new offtaker
     *     tags: [Offtaker]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/OfftakerOnboardingRequest'
     *     responses:
     *       201:
     *         description: Offtaker onboarded successfully
     *       400:
     *         description: Invalid input data
     *       401:
     *         description: Unauthorized
     */
    this.router.post(
      `${this.path}/onboarding`,
      authMiddleware,
      ValidationMiddleware(offtakerOnboardingSchema),
      this.offtakerController.onboarding
    );

    /**
     * @swagger
     * /offtaker/checkout:
     *   post:
     *     summary: Process offtaker checkout
     *     description: Create a new order for the offtaker
     *     tags: [Offtaker]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/OfftakerCheckoutRequest'
     *     responses:
     *       201:
     *         description: Order created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 orderId:
     *                   type: string
     *                 message:
     *                   type: string
     *       400:
     *         description: Invalid input data
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Cluster or warehouse not found
     */
    this.router.post(
      `${this.path}/checkout`,
      authMiddleware,
      ValidationMiddleware(offtakerCheckoutSchema),
      this.offtakerController.checkout
    );

    /**
     * @swagger
     * /offtaker/orders:
     *   get:
     *     summary: Get all orders for the offtaker
     *     description: Retrieves a list of all orders placed by the authenticated offtaker
     *     tags: [Offtaker]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: List of orders retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/OrdersListResponse'
     *       401:
     *         description: Unauthorized
     */
    this.router.get(
      `${this.path}/orders`,
      authMiddleware,
      this.offtakerController.getOrders
    );

    /**
     * @swagger
     * /offtaker/orders/{orderId}:
     *   get:
     *     summary: Get details of a specific order
     *     description: Retrieves detailed information about a specific order
     *     tags: [Offtaker]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: orderId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the order to retrieve
     *     responses:
     *       200:
     *         description: Order details retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/OrderResponse'
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Order not found
     */
    this.router.get(
      `${this.path}/orders/:orderId`,
      authMiddleware,
      ValidationMiddleware(getOrderSchema),
      this.offtakerController.getOrder
    );
  }
}

export default OfftakerRoute;
