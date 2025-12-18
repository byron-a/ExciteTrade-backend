import { NextFunction, Request, Response } from 'express';
import ClusterService from '@/services/cluster.service';
import { getClusterDto, getClustersDto, createClusterDto } from '@/validator/cluster.validator';

class ClusterController {
  public clusterService = new ClusterService();

  public getClusters = async (
    req: Request<any, any, getClustersDto['query']>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = req.query;
      // console.log('req query: ',req);
      const data = await this.clusterService.getClusters(query);

      res.status(200).json({
        data,
        message: 'Clusters fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getCluster = async (
    req: Request<getClusterDto['params']>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { clusterId } = req.params;
      const data = await this.clusterService.getCluster(clusterId);

      res.status(200).json({
        data,
        message: 'Fetched cluster successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ClusterController;
