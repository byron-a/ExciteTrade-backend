import { HttpException } from '@exceptions/HttpException';
import { Miner, IMiner } from '@models/users.model';
import {
  onboardingSchemaDto,
  updateProfileSchemaDto,
  uploadCommodityDto,
} from '@/validator/miner.validator';
import {
  UserRequestStatus,
  UserStatus,
  UserType,
  WarehouseType,
} from '@/interfaces/type';
import Cluster from '@/models/cluster.model';
import UserRequestModel from '@/models/userRequest.model';
import UploadedCommodityModel from '@/models/uploadedCommodity';
import Warehouse from '@/models/warehouse.model';

class MinerService {
  public miner = Miner;
  public cluster = Cluster;
  public userRequest = UserRequestModel;
  public warehouse = Warehouse;
  public uploadedCommodity = UploadedCommodityModel;

  public async onboarding(userData: IMiner, data: onboardingSchemaDto['body']) {
    if (userData.userType !== UserType.MINER)
      throw new HttpException(401, 'Unauthorized user');

    const miner = await this.miner.findById(userData._id);
    if (!miner) throw new HttpException(400, 'Miner does not exist');

    const clusterExist = await this.cluster.findById(data.clusterId);
    if (!clusterExist) throw new HttpException(400, 'Cluster does not exist');

    miner.name.firstName = data.firstName;
    miner.name.lastName = data.lastName;
    const profile = {
      mineName: data.mineName,
      mineLocation: data.mineLocation,
      commodityName: data.commodityName,
      commodityProductionCapacity: data.commodityProductionCapacity,
      cluster: clusterExist.id,
    };
    miner.profile = profile;
    miner.status = UserStatus.ACTIVE;

    const updatedMiner = await miner.save();

    if (!updatedMiner)
      throw new HttpException(400, 'An error occured updating Miner');

    return updatedMiner;
  }

  public async updateProfile(
    userData: IMiner,
    body: updateProfileSchemaDto['body']
  ) {
    if (userData.userType !== UserType.MINER)
      throw new HttpException(401, 'Unauthorized user');

    const miner = await this.miner.findById(userData._id);
    if (!miner) throw new HttpException(400, 'Miner does not exist');

    miner.name.firstName = body.firstName || miner.name.firstName;
    miner.name.lastName = body.lastName || miner.name.lastName;
    miner.profile.mineName = body.mineName || miner.profile.mineName;
    miner.profile.mineLocation =
      body.mineLocation || miner.profile.mineLocation;
    miner.profile.commodityName =
      body.commodityName || miner.profile.commodityName;
    miner.profile.commodityProductionCapacity =
      body.commodityProductionCapacity || body.commodityProductionCapacity;
  }

  public async overview(userData: IMiner) {
    if (userData.userType !== UserType.MINER)
      throw new HttpException(401, 'Unauthorized user');

    const cluster = await this.cluster.findById(userData.profile.cluster);
    if (!cluster) throw new HttpException(400, 'Cluster does not exist');

    const requests = await this.userRequest.find({
      cluster: cluster.id,
      user: userData.id,
    });

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
    };
  }

  public async uploadCommodity(
    userData: IMiner,
    body: uploadCommodityDto['body']
  ) {
    if (userData.userType !== UserType.MINER)
      throw new HttpException(401, 'Unauthorized user');

    const cluster = await this.cluster.findById(userData.profile.cluster);
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

  public async getUploadedCommodities(userData: IMiner) {
    if (userData.userType !== UserType.MINER)
      throw new HttpException(401, 'Unauthorized user');

    const commodities = await this.uploadedCommodity.find({
      user: userData.id,
    });

    return commodities;
  }
}

export default MinerService;
