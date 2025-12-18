// import fs from "fs";
// import path from "path";
import { ClusterType, UserType, OrderStatus } from '@/interfaces/type';
import mongoose, { model, Schema, Document } from 'mongoose';

//   const contentPath = path.join(
//     __dirname,
//     '../assets/img/excite-logo.png'
//   );
//   const exciteLogo = fs.readFileSync(
//   contentPath,
//   'utf-8'
// );

type ProducerProps = {
  id?: string;
  name?: string;
  type?: string;
  productionCapacity?: number;
}
export interface ICluster extends Document {
  name: string;
  slug: string;
  type: ClusterType;
  images: string[];
  description: string;
  commodityName: string;
  gemExciteAssigned: {
    assigned: boolean;
    name: string;
    id: string;
  };
  clusterAvailable: number; // in tonnes
  orderRequested: {
    quantity: number;
    order: mongoose.Types.ObjectId;
  }[];
  rating: number;
  details: Record<string, any>; // flexible structure
  createdBy: mongoose.Types.ObjectId;
  location: string;
  clusterCapacity: number;
  producers: ProducerProps[];
  clusterCode: string;
}

const clusterSchema = new Schema<ICluster>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: Object.values(ClusterType),
      default: ClusterType.FARMER,
    },
    description: {
      type: String,
      default: 'This product is Screened and Assured by Excite Trade',
    },
    images: {
      type: [String],
      default: [],
    },
    commodityName: { type: String, required: true },
    gemExciteAssigned: {
        assigned: { type: Boolean, default:false },
        name: { type: String, default:"Not-assigned" },
        id: { type: String, default: null },
    },
    rating: { type: Number, default: 0 },
    details: { type: Schema.Types.Mixed, default: {} },  // Flexible details field
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    producers: {
      type: [
        {
          id:{type:String},
          name: { type: String },
          type: {
            type: String,
            enum: Object.values(UserType),
            validate: {
              validator: function (value: string) {
                const correspondingType = value === 'Farmer' ? ClusterType.FARMER : ClusterType.MINER;
                return this.$parent().type === correspondingType;
              },
              message: 'Producer type must correspond to Clusters of this type',
            },
          },
          productionCapacity: { type: Number, default: 0 },
        },
      ],
      default: [],
      validate: {
        validator: function (producers) {
          const allProducers = producers.map(eachProducer => eachProducer.id);
          const uniqueSet = new Set(allProducers);
          return uniqueSet.size === allProducers.length;
        },
        message:"This Producer already exists in this Cluster"
      }
    },
    clusterCapacity: {
      type: Number,
      required: true,
      default: 0,
    },
    orderRequested: {
      type: [
        {
          quantity: { type: Number },
          order: { type: Schema.Types.ObjectId, ref:"Order" },
        },
      ],
      default: [],
    },
    clusterAvailable: {
      type: Number,
      default: 0
    },
    clusterCode: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

clusterSchema.pre('save', function (next) {

  if (this.producers && this.producers.length > 0) {
    const newCapacity = this.producers.reduce(
      (sum, producer) => sum + producer.productionCapacity,
      0
    );
  // Update
    this.clusterCapacity = newCapacity;
  } else {
    this.clusterCapacity = 0;
  }
  //PRE LOGIC FOR CLUSTER AVAILABLE SPACE;
  if (this.orderRequested && this.orderRequested.length > 0) {
    const totalOrderQuantity = this.orderRequested.reduce((sum, order) => sum + order.quantity, 0);
    const clusterUnusedSpace = this.clusterCapacity - totalOrderQuantity;
  //Update
    this.clusterAvailable = clusterUnusedSpace;
  } else {
    this.clusterAvailable = this.clusterCapacity;
  };
  //AFTER ORDER IS AVAILABLE


  next();
});

const Cluster = model<ICluster>('Cluster', clusterSchema);
export default Cluster;
