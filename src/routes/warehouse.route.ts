import WarehouseController from '@/controllers/warehouse.controller';
import { Routes } from '@/interfaces/routes.interface';
import ValidationMiddleware from '@/middlewares/validation.middleware';
import {
  getWarehouseSchema,
  getWarehousesSchema,
} from '@/validator/warehouse.validator';
import { Router } from 'express';

/**
 * @swagger
 * tags:
 *   name: Warehouse
 *   description: Warehouse management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     WarehouseType:
 *       type: string
 *       enum: [BONDED, NORMAL]
 *       description: Type of warehouse
 *
 *     WarehouseFilterQuery:
 *       type: object
 *       properties:
 *         q:
 *           type: string
 *           description: Search query string
 *         page:
 *           type: integer
 *           description: Page number for pagination
 *         location:
 *           type: string
 *           description: Filter warehouses by location
 *         limit:
 *           type: integer
 *           description: Number of results per page
 *         type:
 *           $ref: '#/components/schemas/WarehouseType'
 *       example:
 *         q: "central"
 *         page: 1
 *         location: "Lagos"
 *         limit: 10
 *         type: "BONDED"
 *
 *     WarehouseResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the warehouse
 *         type:
 *           $ref: '#/components/schemas/WarehouseType'
 *         name:
 *           type: string
 *           description: Name of the warehouse
 *         location:
 *           type: string
 *           description: Physical location of the warehouse
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         id: "warehouse123"
 *         type: "BONDED"
 *         name: "Central Storage Facility"
 *         location: "Lagos, Nigeria"
 *         createdAt: "2023-01-01T12:00:00Z"
 *         updatedAt: "2023-01-15T14:30:00Z"
 *
 *     WarehousesListResponse:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total number of warehouses matching the query
 *         page:
 *           type: integer
 *           description: Current page number
 *         limit:
 *           type: integer
 *           description: Number of results per page
 *         warehouses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WarehouseResponse'
 *       example:
 *         total: 27
 *         page: 1
 *         limit: 10
 *         warehouses:
 *           - id: "warehouse123"
 *             type: "BONDED"
 *             name: "Central Storage Facility"
 *             location: "Lagos, Nigeria"
 *             createdAt: "2023-01-01T12:00:00Z"
 *             updatedAt: "2023-01-15T14:30:00Z"
 *           - id: "warehouse456"
 *             type: "NORMAL"
 *             name: "Northern Distribution Center"
 *             location: "Kano, Nigeria"
 *             createdAt: "2023-02-01T10:00:00Z"
 *             updatedAt: "2023-02-10T09:15:00Z"
 */

class WarehouseRoute implements Routes {
  public path = '/warehouse';
  public router = Router();
  public warehouesController = new WarehouseController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /warehouse:
     *   get:
     *     summary: Get list of warehouses
     *     description: Retrieve a list of warehouses with optional filtering
     *     tags: [Warehouse]
     *     parameters:
     *       - in: query
     *         name: q
     *         schema:
     *           type: string
     *         description: Search query string
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *         description: Page number for pagination
     *       - in: query
     *         name: location
     *         schema:
     *           type: string
     *         description: Filter warehouses by location
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         description: Number of results per page
     *       - in: query
     *         name: type
     *         schema:
     *           $ref: '#/components/schemas/WarehouseType'
     *         description: Filter warehouses by type (BONDED or NORMAL)
     *     responses:
     *       200:
     *         description: List of warehouses retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/WarehousesListResponse'
     *       400:
     *         description: Invalid query parameters
     */
    this.router.get(
      `${this.path}`,
      ValidationMiddleware(getWarehousesSchema),
      this.warehouesController.getWarehouses
    );

    /**
     * @swagger
     * /warehouse/{warehouseId}:
     *   get:
     *     summary: Get warehouse details
     *     description: Retrieve detailed information about a specific warehouse
     *     tags: [Warehouse]
     *     parameters:
     *       - in: path
     *         name: warehouseId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the warehouse to retrieve
     *     responses:
     *       200:
     *         description: Warehouse details retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/WarehouseResponse'
     *       404:
     *         description: Warehouse not found
     */
    this.router.get(
      `${this.path}/:warehouseId`,
      ValidationMiddleware(getWarehouseSchema),
      this.warehouesController.getWarehouse
    );
  }
}

export default WarehouseRoute;
