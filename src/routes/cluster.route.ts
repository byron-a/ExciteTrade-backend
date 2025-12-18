import ClusterController from '@/controllers/cluster.controller';
import { Routes } from '@/interfaces/routes.interface';
import ValidationMiddleware from '@/middlewares/validation.middleware';
import {
  getClusterSchema,
  getClustersSchema,
  createClusterSchema
} from '@/validator/cluster.validator';
import { Router } from 'express';

/**
 * @swagger
 * tags:
 *   name: Cluster
 *   description: Cluster management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ClusterFilterQuery:
 *       type: object
 *       properties:
 *         q:
 *           type: string
 *           description: Search query string
 *         page:
 *           type: integer
 *           description: Page number for pagination
 *         order:
 *           type: string
 *           enum: [lowest, highest, toprated, newest]
 *           description: Ordering preference for results
 *         price:
 *           type: string
 *           description: Price filter (range or specific value)
 *         rating:
 *           type: string
 *           description: Rating filter (minimum rating)
 *         location:
 *           type: string
 *           description: Location filter
 *         limit:
 *           type: integer
 *           description: Number of results per page
 *         commodity:
 *           type: string
 *           description: Filter by commodity type
 *       example:
 *         q: "premium"
 *         page: 1
 *         order: "lowest"
 *         price: "1000-5000"
 *         rating: "4"
 *         location: "warehouse123"
 *         limit: 10
 *         commodity: "coffee"
 *
 *     ClusterResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the cluster
 *         name:
 *           type: string
 *           description: Name of the cluster
 *         description:
 *           type: string
 *           description: Description of the cluster
 *         commodityName:
 *           type: string
 *           description: Name of the commodity in the cluster
 *         warehouseId:
 *           type: string
 *           description: ID of the warehouse containing the cluster
 *         quantityAvailable:
 *           type: number
 *           description: Available quantity in the cluster
 *         pricePerTonne:
 *           type: number
 *           description: Current price per tonne
 *         prevPricePerTonne:
 *           type: number
 *           description: Previous price per tonne
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         id: "cluster123"
 *         name: "Premium Coffee Cluster"
 *         description: "High-quality Arabica coffee beans from Colombia"
 *         commodityName: "Coffee"
 *         warehouseId: "warehouse456"
 *         quantityAvailable: 1000
 *         pricePerTonne: 5000
 *         prevPricePerTonne: 4800
 *         createdAt: "2023-01-01T12:00:00Z"
 *         updatedAt: "2023-01-15T14:30:00Z"
 *
 *     ClustersListResponse:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total number of clusters matching the query
 *         page:
 *           type: integer
 *           description: Current page number
 *         limit:
 *           type: integer
 *           description: Number of results per page
 *         clusters:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ClusterResponse'
 *       example:
 *         total: 42
 *         page: 1
 *         limit: 10
 *         clusters:
 *           - id: "cluster123"
 *             name: "Premium Coffee Cluster"
 *             description: "High-quality Arabica coffee beans from Colombia"
 *             commodityName: "Coffee"
 *             warehouseId: "warehouse456"
 *             quantityAvailable: 1000
 *             pricePerTonne: 5000
 *             prevPricePerTonne: 4800
 *             createdAt: "2023-01-01T12:00:00Z"
 *             updatedAt: "2023-01-15T14:30:00Z"
 */

class ClusterRoute implements Routes {
  public path = '/cluster';
  public router = Router();
  public clusterController = new ClusterController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /cluster:
     *   get:
     *     summary: Get list of clusters
     *     description: Retrieve a list of clusters with optional filtering
     *     tags: [Cluster]
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
     *         name: order
     *         schema:
     *           type: string
     *           enum: [lowest, highest, toprated, newest]
     *         description: Ordering preference for results
     *       - in: query
     *         name: price
     *         schema:
     *           type: string
     *         description: Price filter (range or specific value)
     *       - in: query
     *         name: rating
     *         schema:
     *           type: string
     *         description: Rating filter (minimum rating)
     *       - in: query
     *         name: location
     *         schema:
     *           type: string
     *         description: Location filter
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         description: Number of results per page
     *       - in: query
     *         name: commodity
     *         schema:
     *           type: string
     *         description: Filter by commodity type
     *     responses:
     *       200:
     *         description: List of clusters retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ClustersListResponse'
     *       400:
     *         description: Invalid query parameters
     */
    this.router.get(
      `${this.path}`,
      ValidationMiddleware(getClustersSchema),
      this.clusterController.getClusters
    );

    /**
     * @swagger
     * /cluster/{clusterId}:
     *   get:
     *     summary: Get cluster details
     *     description: Retrieve detailed information about a specific cluster
     *     tags: [Cluster]
     *     parameters:
     *       - in: path
     *         name: clusterId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the cluster to retrieve
     *     responses:
     *       200:
     *         description: Cluster details retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ClusterResponse'
     *       404:
     *         description: Cluster not found
     */
    this.router.get(
      `${this.path}/:clusterId`,
      ValidationMiddleware(getClusterSchema),
      this.clusterController.getCluster
    );

  }
}

export default ClusterRoute;
