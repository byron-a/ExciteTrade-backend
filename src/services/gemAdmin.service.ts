import { createClusterDto, updateClusterDto } from "@/validator/cluster.validator";
import { getAllUserDTO, registerStaffDTO } from "@/validator/gemAdmin.validator";
import { HttpException } from "@/exceptions/HttpException";
import Cluster from "@/models/cluster.model";
import User, {GemExcite,Farmer, Miner} from "@/models/users.model";
import ClusterService from "./cluster.service";
import { slugify } from "@/utils/util";
import { IGemAdmin, IGemAdminProfile, IGemExcite, IUser } from '@/interfaces/users.interface';
import { ClusterType, UserType } from '@/interfaces/type';
import { hash } from "bcryptjs";
import AuthService from "./auth.service";
import EmailService from "./email.service";
import { NODE_ENV, ORIGIN, CLIENT_URL } from "@/config";


class GemAdminService {
  public cluster = Cluster;
  public user = User;
  public gemExcite = GemExcite;
  public farmers = Farmer;
  public miners = Miner;
  public clusterService = new ClusterService();
  public authService = new AuthService();
  public emailService = new EmailService();


  public async gemAdminOverview(operatorData: IUser) {

    if (operatorData.userType !== UserType.GEMADMIN) throw new HttpException(401, 'UnAuthorized User');

    const getAllCluster = await this.clusterService.getClusters({});
    const getAllGemExciteStaff = await this.gemExcite.find({}).exec();
    //OTHER LOGIC TO GET WAREHOUSES AND ORDERS

    return {
      clusterCount: getAllCluster.length > 0 ? getAllCluster.length : 0,
      gemExciteCount: getAllGemExciteStaff.length > 0 ? getAllGemExciteStaff.length : 0,
      warehouseCount: 0,
      orders: []
    };

  };

  public async creatingCluster(data: createClusterDto['body'], userData: IUser) {

    if (userData.userType !== UserType.GEMADMIN) throw new HttpException(401, "UnAuthorized User")

    // console.log("creatingCluster:",data);
    const findCluster = await this.cluster.findOne({ location: data.location });
    if (findCluster) {
      if(findCluster.name === data.name) throw new HttpException(302, `A Cluster with this name already Exists!`)
    };

     const allClusters = await this.clusterService.getClusters({});

    //  Recursive function
     const generateClusterCode = () => {
       let code = require('crypto').randomBytes(4).toString('hex').toUpperCase();

       allClusters.map(cluster => {
         if (cluster.clusterCode === code) { console.log("ClusterCode not free")
          return generateClusterCode();
         }
       })
       console.log('ClusterCode is free');
       return  code;
     };

    data.clusterCode = generateClusterCode();

    const slugString = `${data.commodityName} ${data.location} ${data.clusterCode.slice(0,3)}`;
    const newCluster = (await this.cluster.create({...data, slug:slugify(slugString), createdBy: userData.id}))

    return newCluster;
  }

  //@updateToCluster
  // description: - assigns Gem-Excite to a cluster
  // - adds Producers (farmer/miners) to cluster
  // - updates other cluster info.

  public async updateToCluster(userData: IUser, clusterId: updateClusterDto['params']['clusterId'], updateData: updateClusterDto['body']) {
    let update;
    //['gemExciteAssigned'] | updateClusterDto['body']['producers'] | updateClusterDto['body'];

     // Checks who is authorized
    if (userData.userType !== UserType.GEMADMIN) throw new HttpException(401, "UnAuthorized User");
    console.log('check for gemValue')
     // Checks if gemExcite is already assigned before assigning
    if (updateData.gemExciteAssigned?.assigned) {
        let gemExciteInfo = updateData.gemExciteAssigned;
        const verifyIfAssigned = await this.cluster.exists({
          "gemExciteAssigned.id" : gemExciteInfo.id
        }).exec();

        if (verifyIfAssigned) {
          throw new HttpException(
            409,
            `${gemExciteInfo.name} has already been assigned to a Cluster`
          )
      }
      // console.log("verifyIfAssigned: ", verifyIfAssigned)
        update = await this.cluster
         .findByIdAndUpdate(
           clusterId,
           { $set: { gemExciteAssigned: { ...gemExciteInfo } } },
           { new: true, runValidators: true }
        ).exec();

      const gemUpdate = {
        assigned: true,
        clusterCode: update.clusterCode,
        clusterName: update.name
      };
      if (update) {
          await this.gemExcite
            .findByIdAndUpdate(
              gemExciteInfo.id,
              {
                $set: { "profile.isAssignedCluster": gemUpdate   },
              },
              { new: true, runValidators: true }
            )
            .exec();
        }

      return update;
    };

    //Checks for the producer before registering to the cluster
    if (updateData.producers.length > 0) {
      const findCluster = await this.cluster.findById(clusterId).exec();

      if (!findCluster) {
        throw new HttpException(404, 'Cluster not found');
      };
      const selectProducerType = updateData.producers[0].type === "Farmer" ? ClusterType.FARMER : ClusterType.MINER;
      // console.log('I found the cluster')
      if (findCluster.type !== selectProducerType) throw new HttpException(405, `You can't add a ${updateData.producers[0].type.toUpperCase()} in a ${findCluster.type.toUpperCase()} Cluster`);

      findCluster.producers.push({ ...updateData.producers[0] });

      update = await findCluster.save();

      // UPDATE PRODUCER LOGIC
      const producerUpdate = {
        clusterId: clusterId,
        clusterName: update.name,
        clusterCode: update.clusterCode,
      };

      if (update.type === ClusterType.FARMER) {
        await this.farmers.findByIdAndUpdate(
          updateData.producers[0].id,
          {
            $set: {
              'profile.clusterDetail': producerUpdate,
            },
          },
          { new: true, runValidators: true }
        );
        return update;
      } else {
        await this.miners.findByIdAndUpdate(
          updateData.producers[0].id,
          {
            $set: {
              'profile.clusterDetail': producerUpdate,
            },
          },
          { new: true, runValidators: true }
        );
        return update;
      }
      // return update;
    };

    //Updates Primary cluster properties;
    const primaryClusterDetails = {
      name: updateData.name,
      description: updateData.description,
      location: updateData.location,
      commodityName: updateData.commodityName
    };
    // console.log('Other cluster details:',primaryClusterDetails)
    update = await this.cluster.findByIdAndUpdate(clusterId, {$set :{...primaryClusterDetails}}, {new: true, runValidators:true}).exec()

    if (!update) {
      throw new HttpException(404, 'Cluster not found');
    }

    return update;

  };

  public async detachFromCluster(operatorUserData: IUser, clusterCode: string, body: { userType: string, userId: string }) {
    if (operatorUserData.userType !== UserType.GEMADMIN) throw new HttpException(401, "Unauthorized User");

    const findCluster = await this.cluster.findOne({clusterCode}).exec();

    if (!findCluster) throw new HttpException(404, "Cluster not found");

    //DE-CLUSTER GEMEXCITE
    if (body.userType === UserType.GEMEXCITE) {
    findCluster.gemExciteAssigned = {
        assigned: false,
        name: "Not-Assigned",
        id: null,
      };
      const findGem = await this.gemExcite.findById(body.userId).exec();
      if (!findGem) throw new HttpException(404, 'GemExcite not found');
      // console.log("TheGemFound: ",findGem)
      findGem.profile.isAssignedCluster = {
        assigned: false,
        clusterCode: null,
        clusterName: null
      };
      const gem =await findGem.save();
      const update = await findCluster.save();
      return {
        update,
        message: `Gem ${gem.name.fullName} has been Unassigned from ${findCluster.name} Cluster`
      }
    };

    //DE-CLUSTER MINER
    if (body.userType === UserType.MINER) {
      const index = findCluster.producers.findIndex((miner) => miner.type === body.userType && miner.id ===body.userId);
      if(!index) throw new HttpException(404, 'Miner not in this Cluster')
      findCluster.producers.splice(index, 1);

      const findMiner = await this.miners.findById(body.userId).exec();
      if (!findMiner) throw new HttpException(404, 'This Miner is not registered');
      // miner detach logic
      const update = await findCluster.save();

      return {
        update,
        message: `Miner ${findMiner.name.fullName} has been removed from ${findCluster.name} Cluster`,
      };
    };

    //DE-CLUSTER FARMER
    if (body.userType === UserType.FARMER) {
      const index = findCluster.producers.findIndex(
        (farmer) => farmer.type === body.userType && farmer.id === body.userId
      );
      console.log("UserPosition: ",index);
      if (index === (-1)) throw new HttpException(404, 'Farmer not in this Cluster');
      findCluster.producers.splice(index, 1);

      const findFarmer = await this.farmers.findById(body.userId).exec();
      if (!findFarmer) throw new HttpException(404, 'This Farmer is not registered');
      findFarmer.profile.clusterDetail = {
        clusterId: null,
        clusterCode: null,
        clusterName: null,
      };

      const producer = await findFarmer.save();
      const update = await findCluster.save();
      return {
        update,
        message: `Farmer ${producer.name.fullName} has been removed from ${findCluster.name} Cluster`,
      };
    }

  };

  public async deleteCluster(clusterId: string, operatorUserData: IUser) {
    if (operatorUserData.userType !== UserType.GEMADMIN) throw new HttpException(401, 'Unauthorized User');

    const findClusterAndDelete = await this.cluster.findByIdAndDelete(clusterId).exec();

    console.log(findClusterAndDelete);

    return findClusterAndDelete;
  };

  public async getUsers4GemAdmin(query:getAllUserDTO['query'], operatorUserData:IUser) {
     if (operatorUserData.userType !== UserType.GEMADMIN)
       throw new HttpException(401, 'Unauthorized User');

    const desiredUsers:getAllUserDTO['query']['userType'] = ['GemExcite', 'Farmer', 'Miner']

    const findAllUsers = await this.user.find({userType: {$in: desiredUsers}}).exec();

    if (findAllUsers.length < 1) throw new HttpException(404, 'No Users where found!');

    const producers = findAllUsers.filter(
      (user) => user.userType === 'Farmer' || user.userType === 'Miner'
    );
    // const miners = findAllUsers.filter((user) => user.userType === 'Miner');
    const gemExcite = findAllUsers.filter((user) => user.userType === 'GemExcite');

    return {
      producers,
      gemExcite,
    };

  };

  public async registerStaffs(operatorData:IUser, body:registerStaffDTO['body']) {

    if (operatorData.userType !== UserType.GEMADMIN) throw new HttpException(401, 'Unauthorized User');

     const confirmUser: IUser = await this.user.findOne({ email: body.email });
     if (confirmUser)
       throw new HttpException(
         409,
         `This email ${body.email} already exists`
       );

    let staff: IUser;
    switch (body.userType) {
      case "GemExcite":
        staff = await this.gemExcite.create({
          ...body,
          // password: hashPassword,
        })
        break;
      case "StoreKeeper":
        console.log('I am registering a storeKeeper')
        break;
      default:
        throw new HttpException(400, "This UserType can not be registered")
    };

    staff.confirmationCode = this.authService.createToken(staff).token;
    await staff.save();

     this.emailService
      .sendEmail({
        to: staff.email,
        subject: 'Verify your email',
        body: `Click on confirmation link: ${NODE_ENV === 'development' ? ORIGIN : CLIENT_URL}/auth/verify-email/verify/${staff.confirmationCode}`,
      })
      .then((res) => {console.log('verification email has been sent')
        return { ...staff, password: undefined, confirmationCode: undefined };
      })
      .catch((err) => {
        throw new HttpException(400, 'Error sending confirmation mail');
      });

    return { ...staff, password: undefined, confirmationCode: undefined };
  };

  public async unregisterStaffs(id: string, operatorData: IUser) {

    if (operatorData.userType !== UserType.GEMADMIN) throw new HttpException(401, 'Unauthorized User');

    const findStaff = await this.user.findById(id).exec();

    if (!findStaff) throw new HttpException(404, 'This user is not found');

    //deleting or unregistering a gemExcite from the platform
    if (findStaff.userType === UserType.GEMEXCITE) {
      const filteredDeleteAction = await this.gemExcite.findByIdAndDelete(id).exec();

      return filteredDeleteAction;
    };

    //Deleting or unregistering a StoreKeeper from the platform
    if (findStaff.userType === UserType.STOREKEEPER) console.log('storeKeeper')

    //Deleting or unregistering a Farmer from the platform
    if (findStaff.userType === UserType.FARMER) {
      const filteredDeleteAction = await this.farmers.findByIdAndDelete(id).exec();

      return filteredDeleteAction;
    };

    //Deleting or unregistering a Miner from the platform;
    if (findStaff.userType === UserType.MINER) {
      const filteredDeleteAction = await this.miners
        .findByIdAndDelete(id)
        .exec();

      return filteredDeleteAction;
    }

  }
};

export default GemAdminService;
