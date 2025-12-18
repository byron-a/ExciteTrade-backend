import { WarehouseType, InventoryType } from '@/interfaces/type';
import mongoose, { model, Schema, Document } from 'mongoose';

export interface IWarehouse extends Document {
  type: WarehouseType;
  name: string;
  location: string;
  createdBy: mongoose.Types.ObjectId;
  capacity: number;
  managerAssigned: string;
  commodities: [];
  order?: mongoose.Types.ObjectId;
}

const warehouseSchema = new Schema<IWarehouse>(
  {
    type: { type: String, enum: Object.values(WarehouseType) },
    name: { type: String, required: true },
    location: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    capacity: { type: Number, default: 0 },
    managerAssigned: { type: String },
    commodities:{
        type: [
          {
          commodity: { type: String }, //COMMODITY NAME
          batchId: { type: String },
          quantity: { type: Number },
          entry: { type: Date },
          clusterName: { type: String },
          inventoryType: { type: String, enum: Object.values(InventoryType)},
          order: { type: Schema.Types.ObjectId, ref:"Order" },
          pricePerTonne: { type: Number, default: 0}
        }
      ],
        default:[]
      },
  },
  { timestamps: true }
);

const Warehouse = model<IWarehouse>('Warehouse', warehouseSchema);
export default Warehouse;
