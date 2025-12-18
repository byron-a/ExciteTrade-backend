import { UserStatus, UserType,ClusterType, RequestStatus } from '@/interfaces/type';
import { model, Schema } from 'mongoose';
import {
  IUser,
  IOfftakerProfile,
  IFarmerProfile,
  IMinerProfile,
  IGemExciteProfile,
  IAdminProfile,
  IGemAdminProfile,
  IGemAdmin,
  IGemExcite,
  IAdmin,
  IFarmer,
  IMiner,
  IOfftaker
} from '@/interfaces/users.interface';
import { ref } from 'process';

//DEFINING SCHEMAS
const userSchema = new Schema<IUser>(
  {
    phoneNumber: {
      type: String,
      validate: {
        validator: function (this: IUser, value: string) {
          if (this.userType === 'Offtaker') {
            return true;
          }
          return !!value;
        },
        message: 'Phone number is required for all user types except Offtaker.',
      },
    },
    name: {
      firstName: { type: String, default:null },
      lastName: { type: String, default:null },
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: {
      type: String,
      required: true,
      enum: Object.values(UserType),
    },
    profileImage: { type: String, default: null },
    language: { type: String },
    country: { type: String },
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING,
    },
    confirmationCode: { type: String },
  },
  { timestamps: true, discriminatorKey: 'userType' }
);

userSchema.virtual('name.fullname').get(function (this: IUser) {
  return this.name.firstName && this.name.lastName
    ? `${this.name.firstName} ${this.name.lastName}`
    : undefined;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = model<IUser>('User', userSchema);

const offtakerSchema = new Schema<IOfftakerProfile>(
  {
    companyName: { type: String },
    companyCountry: { type: String },
    companyVat: { type: Number },
    companyPhoneNumber: { type: String },
    companyAddress: { type: Schema.Types.ObjectId, ref: 'Address' },
    companyActivity: { type: String },
    companyWebsite: { type: String },
    companyPosition: { type: String },
    companyEmployeeCount: { type: String },
    companyProofOfCompany: { type: String },
    companyCertificateOfIncorporation: { type: String },
    companyTaxIdentificationNumber: { type: Number },
    companyVatCertificate: { type: String },
    companyFinancialStatement: { type: String },
    companyRep: {
      firstName: { type: String, min: 2, max: 50 },
      lastName: { type: String, min: 2, max: 50 },
      companyRole: { type: String },
      dateofbirth: { type: String },
      proofOfResidence: { type: String },
      proofOfIdentity: { type: String },
    },
    preferredProducts: [{ type: String }],
    preferredUnitsOfMeasurement: { type: String },
    preferredCurrency: { type: String },
  },
  { _id: false }
);

const gemexciteSchema = new Schema<IGemExciteProfile>(
  {
    area: { type: String, required: true },
    sourcingLocality: { type: String, required: true },
    agroCommodity: { type: String, required: true },
    commodityType: { type: String, required: true },
    clusterType: {
      type: String,
      enum: Object.values(ClusterType),
      default: ClusterType.FARMER,
    },
    isAssignedCluster: {
      assigned: { type: Boolean, default: false },
      clusterName: { type: String, default: null },
      clusterCode: { type: String, default: null },
    },
    ordersInProcess: {
      type: [
        {
          order: { type: Schema.Types.ObjectId, ref:"Order" },
        },
      ],
      default: [],
    },
  },
  { _id: false }
);

const farmerSchema = new Schema<IFarmerProfile>(
  {
    farmName: { type: String, required: true , default:null},
    farmLocation: { type: String, required: true, default:null },
    farmArea: { type: String, required: true, default:null },
    commodityName: { type: String, required: true, default:null },
    commodityProductionCapacity: { type: Number, required: true, default:null },
    commodityType: { type: String, required: true, default:null },
    clusterDetail: {
      clusterId: { type: Schema.Types.ObjectId, default: null },
      clusterCode: { type: String, default: null },
      clusterName: { type: String, default: null },
    },
  },

  { _id: false }
);

const minerSchema = new Schema<IMinerProfile>(
  {
    mineName: { type: String, required: false },
    mineLocation: { type: String, required: false },
    mineArea: { type: String, required: true, default: null },
    commodityName: { type: String, required: false },
    commodityProductionCapacity: { type: Number, required: false },
    commodityType: { type: String, required: true, default: null },
    // cluster: { type: Schema.Types.ObjectId, ref: 'Cluster', required: true },
    clusterDetail: {
      clusterId: { type: Schema.Types.ObjectId, default: null },
      clusterCode: { type: String, default: null },
      clusterName: { type: String, default: null },
    },
  },
  { _id: false }
);



const adminSchema = new Schema<IAdminProfile>(
  {
    access: { type: Boolean, required: true },
  },
  { _id: false }
);

const gemAdminSchema = new Schema<IGemAdminProfile>(
  {
    access: { type: Boolean, required: true },
  },
  { _id: false }
);


export const Offtaker = User.discriminator<IOfftaker>(
  UserType.OFFTAKER,
  new Schema({ profile: offtakerSchema }, { _id: false })
);

export const GemExcite = User.discriminator<IGemExcite>(
  UserType.GEMEXCITE,
  new Schema({ profile: gemexciteSchema}, { _id: false })
);

export const Farmer = User.discriminator<IFarmer>(
  UserType.FARMER,
  new Schema({ profile: farmerSchema }, { _id: false })
);

export const Miner = User.discriminator<IMiner>(
  UserType.MINER,
  new Schema({ profile: minerSchema }, { _id: false })
);

export const Admin = User.discriminator<IAdmin>(
  UserType.ADMIN,
  new Schema({ profile: adminSchema }, { _id: false })
);

export const GemAdmin = User.discriminator<IGemAdmin>(
  UserType.GEMADMIN,
  new Schema({ profile: gemAdminSchema })
);

export default User;
