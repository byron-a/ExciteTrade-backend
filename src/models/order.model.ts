import { OrderStatus, OrderType } from '@/interfaces/type';
import mongoose, { model, Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  offtaker: mongoose.Types.ObjectId;
  cluster: mongoose.Types.ObjectId;
  storage: mongoose.Types.ObjectId;
  selectedWarehouse: mongoose.Types.ObjectId;
  quantity: number;
  orderType: OrderType;
  status: OrderStatus;
  trackingId: string;
  pricePerTonne: number;
  depositPaid: boolean;
  depositAmount: number;
  remainingAmount: number;
  shippingCost: number;
  vat: number;
  totalAmount: number;
  estimatedDeliveryDate: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    offtaker: { type: Schema.Types.ObjectId, ref: 'Offtaker', required: true},
    cluster: { type: Schema.Types.ObjectId, ref: 'Cluster'},
    storage:{ type:Schema.Types.ObjectId, ref:"Warehouse"},
    selectedWarehouse: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    quantity: { type: Number, default: 0 },
    orderType:{
      type: String,
      enum: Object.values(OrderType),
      default: OrderType.PREORDER},
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.NEWREQUEST,
    },
    trackingId:{type:String, unique:true, required:true},
    pricePerTonne: {
      type: Number, required: true
    },
    depositPaid: { type: Boolean, default: false },
    depositAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    vat: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    estimatedDeliveryDate: { type: Date },
  },
  { timestamps: true }
);

orderSchema.pre('validate', function (next) {
  if (this.isNew) {
    if (this.orderType === OrderType.ORDER) {
      this.status = OrderStatus.SEATED;
    }
  };

  next();
})

const Order = model<IOrder>('Order', orderSchema);
export default Order;
