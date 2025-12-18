import { NextFunction, Request, Response } from 'express';
import WarehouseService from '@/services/warehouse.service';
import {
  getWarehouseDto,
  getWarehousesDto,
} from '@/validator/warehouse.validator';

class WarehouseController {
  public warehouseService = new WarehouseService();

  public getWarehouses = async (
    req: Request<any, any, getWarehousesDto['query']>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = req.query;
      const data = await this.warehouseService.getWarehouses(query);

      res.status(200).json({
        data,
        message: 'Warehouses fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getWarehouse = async (
    req: Request<getWarehouseDto['params']>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { warehouseId } = req.params;
      const data = await this.warehouseService.getWarehouse(warehouseId);

      res.status(200).json({
        data,
        message: 'Warehouse fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default WarehouseController;
