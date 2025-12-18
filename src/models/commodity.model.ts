import mongoose, { model, models, Schema, Document } from 'mongoose';

interface ICommodity extends Document {
  name: string;
  warehouse: mongoose.Types.ObjectId;
  description: string;
  quantityAvailable: number; // in tonnes
  pricePerTonne: number;
  details: Record<string, any>; // flexible structure
}

const commoditySchema = new Schema<ICommodity>(
  {
    name: { type: String, required: true },
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    description: { type: String, required: true },
    quantityAvailable: { type: Number, required: true },
    pricePerTonne: { type: Number, required: true },
    details: { type: Schema.Types.Mixed, default: {} },
    // Flexible details field
  },
  { timestamps: true }
);

const Commodity = model<ICommodity>('Commodity', commoditySchema);
export default Commodity;
