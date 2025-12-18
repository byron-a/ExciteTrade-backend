import { HttpException } from '@/exceptions/HttpException';
import { WarehouseType } from '@/interfaces/type';
import Cluster from '@/models/cluster.model';
import Warehouse from '@/models/warehouse.model';
import { getWarehousesDto } from '@/validator/warehouse.validator';

class WarehouseService {
  public warehouse = Warehouse;
  public cluster = Cluster;

  public async getWarehouses({
    q,
    type,
    page,
    limit,
    location,
  }: getWarehousesDto['query']) {
    const typeFilter = type ? { type } : {};
    const qFilter = q ? { name: { $regex: q, $options: 'i' } } : {};
    const locationFilter = location
      ? { location: { $regex: location, $options: 'i' } }
      : {};

    const warehouses = this.warehouse
      .find({
        ...typeFilter,
        ...qFilter,
        ...locationFilter,
      })
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();

    return warehouses;
  }

  public async getWarehouse(warehouseId: string) {
    const warehouse = await this.warehouse.findById(warehouseId);

    if (!warehouse) throw new HttpException(400, 'Warehouse does not exist');

    const clusters = await this.cluster.find({ warehouse: warehouseId });

    return { ...warehouse.toObject(), clusters };
  }
}

export default WarehouseService;
