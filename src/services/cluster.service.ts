import { HttpException } from '@/exceptions/HttpException';
import Cluster from '@/models/cluster.model';
import { getClustersDto, createClusterDto, getClusterDto } from '@/validator/cluster.validator';
import { slugify } from '@/utils/util';

class ClusterService {
  public cluster = Cluster;

  public async getClusters({
    q,
    page,
    order,
    price,
    rating,
    location,
    limit,
    commodity,
  }: getClustersDto['query']) {
    const queryFilter =
      q && q !== 'all' ? { name: { $regex: q, $options: 'i' } } : {};
    const locationFilter = location && location !== 'all' ? { location } : {};
    const commodityFilter =
      commodity && commodity !== 'all' ? { commodity } : {};

    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            // 1-50
            pricePerTonne: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};

    const sortOrder =
      order === 'lowest'
        ? { pricePerTonne: 1 }
        : order === 'highest'
          ? { pricePerTonne: -1 }
          : order === 'toprated'
            ? { rating: -1 }
            : order === 'newest'
              ? { createdAt: -1 }
              : { _id: -1 };

    const clusters = await this.cluster
      .find({
        ...queryFilter,
        ...priceFilter,
        ...ratingFilter,
        ...locationFilter,
        ...commodityFilter,
      })
      // .sort(sortOrder)
      .skip(limit * (page - 1))
      .limit(limit).populate('createdBy')
      .exec();

    return clusters;
  }

  public async getCluster(clusterId: getClusterDto['params']['clusterId']) {
    const cluster = (await this.cluster.findById(clusterId)).populate('createdBy');
    if (!cluster) throw new HttpException(400, 'Cluster does not exist');

    return cluster;
  }
}

export default ClusterService;
