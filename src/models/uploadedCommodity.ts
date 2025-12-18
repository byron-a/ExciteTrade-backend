import { UploadedCommodityStatus } from '@/interfaces/type';
import mongoose, { model, Schema, Document } from 'mongoose';

export interface IUploadedCommodity extends Document {
  cluster: mongoose.Types.ObjectId;
  request: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  status: string;
  commodity: string;
  quantity: number;
  quantityUnits?: string;
  pricePerTonne: number;
  imageUrl: string;
}

const UploadedCommoditySchema = new Schema<IUploadedCommodity>(
  {
    cluster: { type: Schema.Types.ObjectId, ref: 'Cluster', required: true },
    request: { type: Schema.Types.ObjectId, ref: 'Request', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(UploadedCommodityStatus),
      default: UploadedCommodityStatus.PENDING,
    },
    commodity: { type: String, required: true },
    pricePerTonne: { type: Number, required: true },
    quantity: { type: Number, required: true },
    quantityUnits: { type: String, default: 'tonne' },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

const UploadedCommodityModel = model<IUploadedCommodity>(
  'UploadedCommodity',
  UploadedCommoditySchema
);
export default UploadedCommodityModel;
