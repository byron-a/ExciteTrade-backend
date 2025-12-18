import mongoose, { Document } from "mongoose";
import { UserType } from '@/interfaces/type';

export interface User {
  _id: string;
  email: string;
  password: string;
};

export interface IUser extends Document {
  phoneNumber: string;
  name: {
    firstName: string;
    lastName: string;
    fullName?: string;
  };
  email: string;
  password: string;
  userType: UserType;
  profileImage?: string;
  language?: string;
  country?: string;
  isVerified: boolean;
  status: string;
  confirmationCode: string;
}

export interface IFarmerProfile {
  farmName: string;
  farmArea: string;
  farmLocation: string;
  commodityName: string;
  commodityProductionCapacity: number;
  commodityType: string;
  clusterDetail?: {
    clusterId: mongoose.Types.ObjectId;
    clusterCode: string;
    clusterName: string;
  }
}

export interface IFarmer extends IUser {
  profile: IFarmerProfile;
}

export interface IMinerProfile {
  mineName: string;
  mineLocation: string;
  mineArea: string;
  commodityName: string;
  commodityProductionCapacity: number;
  commodityType: string;
  clusterDetail?: {
    clusterId: mongoose.Types.ObjectId;
    clusterCode: string;
    clusterName: string;
  };
  // cluster: mongoose.Types.ObjectId;
}

export interface IMiner extends IUser {
  profile: IMinerProfile;
}

export interface IGemExciteProfile {
  area: string;
  sourcingLocality: string;
  agroCommodity: string;
  commodityType: string;
  clusterType: string;
  isAssignedCluster?: {
    assigned: boolean;
    clusterName?: string;
    clusterCode?: string;
  };
  ordersInProcess?: {
    order: mongoose.Types.ObjectId
  }[];
}

export interface IGemExcite extends IUser {
  profile: IGemExciteProfile;
}

export interface IAdminProfile {
  access: boolean;
}

export interface IAdmin extends IUser {
  profile: IAdminProfile;
}

export interface IGemAdminProfile {
  access: boolean;
}
export interface IGemAdmin extends IUser {
  profile: IGemAdminProfile;
}

export interface IOfftakerProfile {
  companyName: string;
  companyCountry: string;
  companyVat?: number;
  companyPhoneNumber: string;
  companyAddress: mongoose.Types.ObjectId;
  companyActivity?: string;
  companyWebsite: string;
  companyPosition: string;
  companyEmployeeCount: string;
  companyProofOfCompany?: string;
  companyCertificateOfIncorporation?: string;
  companyTaxIdentificationNumber?: number;
  companyVatCertificate?: string;
  companyFinancialStatement?: string;
  preferredProducts: string[];
  preferredUnitsOfMeasurement: string;
  preferredCurrency: string;
  companyRep?: {
    firstName: string;
    lastName: string;
    companyRole: string;
    dateofbirth: string;
    proofOfResidence: string;
    proofOfIdentity: string;
  };
}

export interface IOfftaker extends IUser {
  profile: IOfftakerProfile;
}


