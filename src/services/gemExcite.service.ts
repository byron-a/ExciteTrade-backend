import { HttpException } from '@/exceptions/HttpException';
import {
  ClusterType,
  RequestStatus,
  UserRequestStatus,
  UserType,
  OrderStatus
} from '@/interfaces/type';
import Cluster from '@/models/cluster.model';
import RequestModel from '@/models/request.model';
import UsersOnRequestModel from '@/models/userRequest.model';
import Order from '@/models/order.model';
import User, {
  Farmer,
  GemExcite,
  Miner,
} from '@/models/users.model';
import {
  IGemExcite,
  IUser
} from "@/interfaces/users.interface";
import {
  gemExciteAssignUserToRequestSchemaDto,
  gemExciteOnboardingSchemaDto,
} from '@/validator/gemExcite.validator';

class GemExciteService {
  public user = User;
  public farmer = Farmer;
  public miner = Miner;
  public gemExcite = GemExcite;
  public cluster = Cluster;
  public request = RequestModel;
  public usersOnRequest = UsersOnRequestModel;
  public order = Order;

  public async  onboarding(
    userData: IGemExcite,
    data: gemExciteOnboardingSchemaDto['body']
   ) {
    if (userData.userType !== UserType.GEMEXCITE)
      throw new HttpException(401, 'Unauthorized user');

    const gemExcite = await this.gemExcite.findById(userData.id);

    if (!gemExcite) throw new HttpException(400, 'GemExcite does not exist');

    gemExcite.name.firstName = data.firstName;
    gemExcite.name.lastName = data.lastName;
    if (data.email !== gemExcite.email) {
      gemExcite.email = data.email;
    }
    const profile = {
      area: data.area,
      agroCommodity: data.agroCommodity,
      sourcingLocality: data.sourcingLocality,
      commodityType: data.commodityType,
      clusterType: data.commodityType === "solidMinerals" ? ClusterType.MINER : ClusterType.FARMER,
    };
    gemExcite.profile = profile;
    gemExcite.status = 'Active';
    const updatedGemExcite = await gemExcite.save();

    if (!updatedGemExcite)
      throw new HttpException(400, 'An error occurred updating GemExcite');

    return updatedGemExcite;
  };

  public async overview(userData: IGemExcite) {
    if (userData.userType !== UserType.GEMEXCITE)
      throw new HttpException(401, 'Unauthorized user');

    const findGemCluster = await this.cluster.findOne({ clusterCode: userData.profile.isAssignedCluster.clusterCode });

    if (!findGemCluster) {
      throw new HttpException(404, 'Your cluster was not found')
    }

    const request = await this.request.find({
      sourceId: findGemCluster.id,
      source: "Cluster",
      // status: RequestStatus.NEWREQUEST,
    }).populate({
      path: "sourceId",
      refPath: "source"
    } as any).exec();

    const newRequest = request.filter((req) => req.status === OrderStatus.NEWREQUEST).length || 0;
    const inCultivationRequest = request.filter((req) => req.status === OrderStatus.INCULTIVATION).length || 0;
    const harvestedRequest = request.filter(req => req.status === OrderStatus.HARVESTED).length || 0;

    return {
      request,
      newRequest,
      inCultivationRequest,
      harvestedRequest,
    };
  };

  public async asignUserToRequest(
    userData: IGemExcite,
    requestId: string,
    body: gemExciteAssignUserToRequestSchemaDto['body']
   ) {
     if (userData.userType !== UserType.GEMEXCITE)
       throw new HttpException(401, 'Unauthorized user');

     const request = await this.request.findById(requestId);
     if (!request) throw new HttpException(400, 'Request does not exist');

     if (request.status !== OrderStatus.NEWREQUEST)
       throw new HttpException(400, 'Request is not A new Request');

     await Promise.all(
       body.users.map(async (user) => {
         const userExist = await this.user.findById(user.userId);
         if (!userExist) throw new HttpException(400, 'User does not exist');

         const userOnRequest = new this.usersOnRequest({
           user: userExist.id,
           request: request.id,
           quantity: user.quantity,
           quantityUnits: user.quantityUnits,
           status: UserRequestStatus.PENDING,
         });

         const createUserOnRequest = await userOnRequest.save();
         if (!createUserOnRequest)
           throw new HttpException(
             400,
             `Error Creating ${userExist.name.firstName}'s Profile on Request`
           );

         request.usersOnRequest.push(createUserOnRequest.id);
         const saveUserOnRequest = await request.save();
         if (!saveUserOnRequest)
           throw new HttpException(
             400,
             `Error Saving ${userExist.name.firstName} to Request`
           );
         //NOTIFICATION AND EMAIL LOGIC BELOW
       })
     );

     //UPDATING STATUS
     const thisOrder = await this.order
       .findByIdAndUpdate(
         request.order,
         { $set: { status: OrderStatus.PENDING } },
         { new: true, runValidators: true }
       )
       .exec();

     if (!thisOrder) throw new HttpException(404, 'This Order was not found');
     if (thisOrder.status === OrderStatus.NEWREQUEST)
       throw new HttpException(500, 'This Order Status was not Updated');

     //ADDING TO GEMEXCITE ORDER-IN-PROCESS QUEUE
     const gemOrderLength = await this.gemExcite.findByIdAndUpdate(
       userData.id,
       {
         $push: {
           'profile.orderInProcess': {
             order: request.order,
           },
         },
       }
     );

    if(!gemOrderLength) throw new HttpException(500, "Error updating gemExcite order");

     return request;
   };

  public async getClusterUsers(userData: IGemExcite) {
    if (userData.userType !== UserType.GEMEXCITE)
      throw new HttpException(401, 'Unauthorized user');

    const cluster = await this.cluster.findOne({
      clusterCode: userData.profile.isAssignedCluster.clusterCode,
    });
    if (!cluster) throw new HttpException(400, 'Cluster does not exist');

    let users: IUser[];

    if (cluster.type === ClusterType.FARMER) {
      users = await this.farmer.find({ 'profile.cluster': cluster.id });
    } else {
      users = await this.miner.find({ 'profile.cluster': cluster.id });
    }

    return users;
  };

  public async getClusterUploadedCommodities(userData: IGemExcite) {
    if (userData.userType !== UserType.GEMEXCITE)
      throw new HttpException(401, 'Unauthorized user');

    const cluster = await this.cluster.findOne({
      clusterCode: userData.profile.isAssignedCluster.clusterCode,
    });
    if (!cluster) throw new HttpException(400, 'Cluster does not exist');

    const requests = await this.usersOnRequest.find({
      cluster: cluster.id,
      status: UserRequestStatus.UPLOADED,
    });

    return requests;
  }
}

export default GemExciteService;
