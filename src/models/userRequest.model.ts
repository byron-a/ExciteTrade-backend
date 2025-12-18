import { UserRequestStatus } from '@/interfaces/type';
import mongoose, { model, Schema, Document } from 'mongoose';

export interface IUserRequest extends Document {
  cluster: mongoose.Types.ObjectId;
  request: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  status: string;
  quantity: number;
  quantityUnits?: string;
}

const UsersOnRequestSchema = new Schema<IUserRequest>(
  {
    cluster: { type: Schema.Types.ObjectId, ref: 'Cluster', required: true },
    request: { type: Schema.Types.ObjectId, ref: 'Request', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: Object.values(UserRequestStatus),
      default: UserRequestStatus.PENDING,
    },
    quantity: { type: Number, required: true },
    quantityUnits: { type: String, default: 'tonne' },
  },
  { timestamps: true }
);

const UsersOnRequestModel = model<IUserRequest>('UsersOnRequest', UsersOnRequestSchema);
export default UsersOnRequestModel;
