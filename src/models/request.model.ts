import { OrderStatus, RequestType } from '@/interfaces/type';
import mongoose, { model, Schema, Document } from 'mongoose';

export interface IRequest extends Document {
  type: string;
  order: mongoose.Types.ObjectId;
  sourceId: mongoose.Types.ObjectId;
  source: string;
  storage: mongoose.Types.ObjectId;
  status: string;
  usersOnRequest: mongoose.Types.ObjectId[];
};

const requestSchema = new Schema<IRequest>(
  {
    type: { type: String, enum: Object.values(RequestType), required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    sourceId: { type: Schema.Types.ObjectId, required:true },
    source: { type: String, enum: ['Warehouse', 'Cluster'], required:false },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.NEWREQUEST,
    },
    usersOnRequest: [
      { type: Schema.Types.ObjectId, ref: 'UsersOnRequest', default: [] },
    ],
  },
  { timestamps: true }
);

requestSchema.pre('validate', function (next) {
  if (this.isNew) {
    if (this.type === RequestType.STOREKEEPER) {
      this.source = 'Warehouse';
      this.status = OrderStatus.SEATED;

    } else {
      this.source = 'Cluster';
    }
  }
  next();
});

const RequestModel = model<IRequest>('Request', requestSchema);
export default RequestModel;
