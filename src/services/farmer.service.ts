import { isEmpty } from '@utils/util';
import {
  UserRequestStatus,
  UserStatus,
  UserType,
  WarehouseType,
  CommodityType
} from '@/interfaces/type';
import { Farmer } from '@models/users.model';
import { IFarmer, IFarmerProfile } from '@/interfaces/users.interface';
import { HttpException } from '@exceptions/HttpException';
import {
  onboardingSchemaDto,
  updateProfileSchemaDto,
  uploadCommodityDto,
} from '@/validator/farmer.validator';
import Cluster from '@/models/cluster.model';
import UserRequestModel from '@/models/userRequest.model';
import UploadedCommodityModel from '@/models/uploadedCommodity';
import Warehouse from '@/models/warehouse.model';
import { agricProduce } from '@/utils/platformData';

class FarmerService {
  public farmer = Farmer;
  public cluster = Cluster;
  public userRequest = UserRequestModel;
  public warehouse = Warehouse;
  public uploadedCommodity = UploadedCommodityModel;

  public async onboarding(
    userData: IFarmer,
    data: onboardingSchemaDto['body']
   ) {
    if (userData.userType !== UserType.FARMER)
      throw new HttpException(401, 'Unauthorized user');

    const farmer = await this.farmer.findById(userData._id).exec();
    if (!farmer) throw new HttpException(400, 'Farmer does not exist');
    // console.log("FarmerModel: ",farmer);

    farmer.name.firstName = data.firstName;
    farmer.name.lastName = data.lastName;
    farmer.profile = {

    } as IFarmerProfile

    farmer.profile.farmName = data.farmName,
    farmer.profile.farmArea = data.farmArea,
    farmer.profile.farmLocation = data.farmLocation,
    farmer.profile.commodityName = data.commodityName,
    farmer.profile.commodityProductionCapacity = data.commodityProductionCapacity,
    farmer.profile.commodityType = agricProduce.includes(data.commodityName) ? CommodityType.AGRICPRODUCE : CommodityType.PROCESSEDCOMMODITIES,
    farmer.status = UserStatus.ACTIVE;

    if (data.clusterCode) {
      const clusterExist = await this.cluster.findOne({
        clusterCode: data.clusterCode,
      });
      if (!clusterExist) {
        throw new HttpException(400, 'Cluster does not exist');
      }

      // farmer.profile = {} as IFarmerProfile;

      farmer.profile.clusterDetail = {
        clusterId: clusterExist.id,
        clusterCode: data.clusterCode,
        clusterName: clusterExist.name,
      };
    }

    const updatedFarmer = await farmer.save();

    if (!updatedFarmer) throw new HttpException(400, 'An error occurred updating Farmer');

    return updatedFarmer;
  }

  public async updateProfile(
    userData: IFarmer,
    body: updateProfileSchemaDto['body']
   ) {
    if (userData.userType !== UserType.FARMER)
      throw new HttpException(401, 'Unauthorized user');

    const farmer = await this.farmer.findById(userData._id);
    if (!farmer) throw new HttpException(400, 'Farmer does not exist');

    farmer.name.firstName = body.firstName || farmer.name.firstName;
    farmer.name.lastName = body.lastName || farmer.name.lastName;
    farmer.profile.farmName = body.farmName || farmer.profile.farmName;
    farmer.profile.farmLocation =
      body.farmLocation || farmer.profile.farmLocation;
    farmer.profile.commodityName =
      body.commodityName || farmer.profile.commodityName;
    farmer.profile.commodityProductionCapacity =
      body.commodityProductionCapacity || body.commodityProductionCapacity;

    await farmer.save();
  }

  public async overview(userData: IFarmer) {
    if (userData.userType !== UserType.FARMER)
      throw new HttpException(401, 'Unauthorized user');

    const cluster = await this.cluster.findById(userData.profile.clusterDetail.clusterId);
    if (!cluster) throw new HttpException(400, 'Cluster does not exist');

    const requests = await this.userRequest.find({
      cluster: cluster.id,
      user: userData.id,
    });

     const upLoadedCommodity = requests.filter(
       (req) => req.status === UserRequestStatus.UPLOADED
     ).length;

    const newRequest = requests.filter(
      (req) => req.status === UserRequestStatus.PENDING
    ).length;

    const inProgress = requests.filter(
      (req) => (req.status = UserRequestStatus.INCULTIVATION)
    );

    const delivered = requests.filter(
      (req) => (req.status = UserRequestStatus.DELIVERED)
    );

    return {
      requests,
      newRequest,
      inProgress,
      delivered,
      upLoadedCommodity
    };
  }

  public async uploadCommodity(
    userData: IFarmer,
    body: uploadCommodityDto['body']
   ) {
    if (userData.userType !== UserType.FARMER)
      throw new HttpException(401, 'Unauthorized user');

    const cluster = await this.cluster.findById(userData.profile.clusterDetail.clusterId);
    if (!cluster) throw new HttpException(400, 'Cluster does not exist');

    const request = await this.userRequest.findOne({ request: body.request });
    if (!request) throw new HttpException(400, 'Request does not exist');

    const warehouse = await this.warehouse.findOne({
      id: body.warehouse,
      type: WarehouseType.HOLDING,
    });
    if (!warehouse) throw new HttpException(400, 'Warehouse does not exist');

    const commodity = await this.uploadedCommodity.create({
      ...body,
      user: userData.id,
      cluster: cluster.id,
      warehouse: warehouse.id,
      request: request.request,
    });

    return commodity;
  }

  public async getUploadedCommodities(userData: IFarmer) {
    if (userData.userType !== UserType.FARMER)
      throw new HttpException(401, 'Unauthorized user');

    const commodities = await this.uploadedCommodity.find({
      user: userData.id,
    });

    return commodities;
  }

  public async acceptOrDeclineRequest() {

  }
}

export default FarmerService;
