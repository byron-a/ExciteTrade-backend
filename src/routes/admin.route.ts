import AdminController from '@/controllers/admin.controller';
import { Routes } from '@/interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import ValidationMiddleware from '@/middlewares/validation.middleware';
import {
  createAdminSchema,
  loginAdminSchema,
} from '@/validator/admin.validator';
import {
  createClusterSchema,
  updateClusterSchema,
} from '@/validator/cluster.validator';
import { createWarehouseSchema } from '@/validator/warehouse.validator';
import { Router } from 'express';

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management and operations endpoints
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
 *     CreateAdminRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *           description: First name of the admin
 *         lastName:
 *           type: string
 *           description: Last name of the admin
 *         email:
 *           type: string
 *           description: Email address of the admin
 *         password:
 *           type: string
 *           description: Password for the admin account
 *       example:
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         password: securePassword123
 *
 *     LoginAdminRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: Email address of the admin
 *         password:
 *           type: string
 *           description: Admin account password
 *       example:
 *         email: john.doe@example.com
 *         password: securePassword123
 *
 *     CreateClusterRequest:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - commodityName
 *         - quantityAvailable
 *         - pricePerTonne
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the cluster
 *         description:
 *           type: string
 *           description: Description of the cluster
 *         commodityName:
 *           type: string
 *           description: Name of the commodity
 *         quantityAvailable:
 *           type: number
 *           description: Available quantity
 *         pricePerTonne:
 *           type: number
 *           description: Price per tonne
 *         prevPricePerTonne:
 *           type: number
 *           description: Previous price per tonne
 *       example:
 *         name: Mining Cluster A
 *         description: Gold mining cluster in Nevada
 *         commodityName: Gold
 *         quantityAvailable: 1000
 *         pricePerTonne: 5000
 *         prevPricePerTonne: 4800
 *
 *     UpdateClusterRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Updated name of the cluster
 *         description:
 *           type: string
 *           description: Updated description
 *         commodityName:
 *           type: string
 *           description: Updated commodity name
 *         quantityAvailable:
 *           type: number
 *           description: Updated quantity
 *         pricePerTonne:
 *           type: number
 *           description: Updated price per tonne
 *         prevPricePerTonne:
 *           type: number
 *           description: Updated previous price per tonne
 *
 *     CreateWarehouseRequest:
 *       type: object
 *       required:
 *         - name
 *         - location
 *         - capacity
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the warehouse
 *         location:
 *           type: string
 *           description: Location of the warehouse
 *         capacity:
 *           type: number
 *           description: Storage capacity of the warehouse
 *       example:
 *         name: Central Warehouse
 *         location: Las Vegas, NV
 *         capacity: 10000
 *
 *     UpdateWarehouseRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Updated name of the warehouse
 *         location:
 *           type: string
 *           description: Updated location of the warehouse
 *         capacity:
 *           type: number
 *           description: Updated storage capacity
 *       example:
 *         name: Updated Central Warehouse
 *         location: Reno, NV
 *         capacity: 15000
 */

class AdminRoute implements Routes {
  public path = '/admin';
  public router = Router();
  public adminController = new AdminController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /admin/create:
     *   post:
     *     summary: Create a new admin
     *     tags: [Admin]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateAdminRequest'
     *     responses:
     *       201:
     *         description: Admin created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   $ref: '#/components/schemas/CreateAdminRequest'
     *                 message:
     *                   type: string
     *                   example: Admin created successfully
     *       400:
     *         description: Invalid input data
     */
    this.router.post(
      `${this.path}/create`,
      ValidationMiddleware(createAdminSchema),
      this.adminController.createAdmin
    );

    /**
     * @swagger
     * /admin/login:
     *   post:
     *     summary: Login as admin
     *     tags: [Admin]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginAdminRequest'
     *     responses:
     *       201:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                   properties:
     *                     cookie:
     *                       type: string
     *                     token:
     *                       type: string
     *                     user:
     *                       type: object
     *                 message:
     *                   type: string
     *                   example: Loggedin successfull
     *       400:
     *         description: Invalid credentials
     *       401:
     *         description: Unauthorized
     */
    this.router.post(
      `${this.path}/login`,
      ValidationMiddleware(loginAdminSchema),
      this.adminController.login
    );

    /**
     * @swagger
     * /admin/cluster:
     *   post:
     *     summary: Create a new cluster
     *     tags: [Admin]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateClusterRequest'
     *     responses:
     *       201:
     *         description: Cluster created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   $ref: '#/components/schemas/CreateClusterRequest'
     *                 message:
     *                   type: string
     *                   example: Cluster created successfully
     *       400:
     *         description: Invalid input data
     *       401:
     *         description: Unauthorized
     */
    // this.router.post(
    //   `${this.path}/cluster`,
    //   authMiddleware,
    //   ValidationMiddleware(createClusterSchema),
    //   this.adminController.createCluster
    // );

    /**
     * @swagger
     * /admin/cluster/{clusterId}:
     *   put:
     *     summary: Update an existing cluster
     *     tags: [Admin]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: clusterId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the cluster to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateClusterRequest'
     *     responses:
     *       200:
     *         description: Cluster updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   $ref: '#/components/schemas/UpdateClusterRequest'
     *                 message:
     *                   type: string
     *                   example: Cluster updated successfully
     *       400:
     *         description: Invalid input data or cluster not found
     *       401:
     *         description: Unauthorized
     */
    this.router.put(
      `${this.path}/cluster/:clusterId`,
      authMiddleware,
      ValidationMiddleware(updateClusterSchema),
      this.adminController.updateCluster
    );

    /**
     * @swagger
     * /admin/cluster/{clusterId}/{gemExciteId}:
     *   put:
     *     summary: Add GemExcite to a cluster
     *     tags: [Admin]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: clusterId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the cluster
     *       - in: path
     *         name: gemExciteId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the GemExcite to add
     *     responses:
     *       200:
     *         description: GemExcite added to cluster successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                 message:
     *                   type: string
     *                   example: GemExcite added to cluster successfully
     *       400:
     *         description: Invalid input data or entities not found
     *       401:
     *         description: Unauthorized
     */
    this.router.put(
      `${this.path}/cluster/:clusterId/:gemExciteId`,
      authMiddleware,
      this.adminController.addGemExciteToCluster
    );

    /**
     * @swagger
     * /admin/warehouse:
     *   post:
     *     summary: Create a new warehouse
     *     tags: [Admin]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateWarehouseRequest'
     *     responses:
     *       201:
     *         description: Warehouse created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   $ref: '#/components/schemas/CreateWarehouseRequest'
     *                 message:
     *                   type: string
     *                   example: Warehouse created successfully
     *       400:
     *         description: Invalid input data
     *       401:
     *         description: Unauthorized
     */
    this.router.post(
      `${this.path}/warehouse`,
      authMiddleware,
      ValidationMiddleware(createWarehouseSchema),
      this.adminController.createWarehouse
    );

    /**
     * @swagger
     * /admin/warehouse/{warehouseId}:
     *   put:
     *     summary: Update an existing warehouse
     *     tags: [Admin]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: warehouseId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the warehouse to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateWarehouseRequest'
     *     responses:
     *       200:
     *         description: Warehouse updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                 message:
     *                   type: string
     *                   example: Warehouse updated successfully
     *       400:
     *         description: Invalid input data or warehouse not found
     *       401:
     *         description: Unauthorized
     */
    this.router.put(
      `${this.path}/warehouse/:warehouseId`,
      authMiddleware,
      this.adminController.updateWarehouse
    );

    /**
     * @swagger
     * /admin/warehouse/{warehouseId}/{gemExciteId}:
     *   put:
     *     summary: Add GemExcite to a warehouse
     *     tags: [Admin]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: warehouseId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the warehouse
     *       - in: path
     *         name: gemExciteId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the GemExcite to add
     *     responses:
     *       200:
     *         description: GemExcite added to warehouse successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                 message:
     *                   type: string
     *                   example: GemExcite added to warehouse successfully
     *       400:
     *         description: Invalid input data or entities not found
     *       401:
     *         description: Unauthorized
     */
    this.router.put(
      `${this.path}/warehouse/:warehouseId/:gemExciteId`,
      authMiddleware,
      this.adminController.addGemExciteToCluster
    );

    /**
     * @swagger
     * /admin/warehouse/{warehouseId}:
     *   delete:
     *     summary: Delete a warehouse
     *     tags: [Admin]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: warehouseId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the warehouse to delete
     *     responses:
     *       200:
     *         description: Warehouse deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Warehouse deleted successfully
     *       400:
     *         description: Warehouse not found
     *       401:
     *         description: Unauthorized
     */
    this.router.delete(
      `${this.path}/warehouse/:warehouseId`,
      authMiddleware,
      this.adminController.deleteWarehouse
    );

    /**
     * @swagger
     * /admin/warehouse/{warehouseId}/clusters:
     *   get:
     *     summary: Get clusters in a warehouse
     *     tags: [Admin]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: warehouseId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the warehouse
     *     responses:
     *       200:
     *         description: List of clusters retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                       name:
     *                         type: string
     *                       description:
     *                         type: string
     *                       commodityName:
     *                         type: string
     *                       quantityAvailable:
     *                         type: number
     *                       pricePerTonne:
     *                         type: number
     *                 message:
     *                   type: string
     *                   example: Clusters retrieved successfully
     *       400:
     *         description: Warehouse not found
     *       401:
     *         description: Unauthorized
     */
    this.router.get(
      `${this.path}/warehouse/:warehouseId/clusters`,
      authMiddleware,
      this.adminController.getClustersInWarehouse
    );
  }
}

export default AdminRoute;
