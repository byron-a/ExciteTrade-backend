import { HttpException } from '@/exceptions/HttpException';
import { UserType } from '@/interfaces/type';
import Cluster from '@/models/cluster.model';
import Commodity from '@/models/commodity.model';
import User, { Farmer, GemExcite, Miner, Offtaker } from '@/models/users.model';
import Warehouse from '@/models/warehouse.model';
import { createAdminDto, loginAdminDto } from '@/validator/admin.validator';
import {
  createWarehouseDto,
  updateWarehouseDto,
} from '@/validator/warehouse.validator';
import { compare, hash } from 'bcryptjs';
import AuthService from './auth.service';
import {
  createClusterDto,
  updateClusterDto,
} from '@/validator/cluster.validator';
import { slugify } from '@/utils/util';

class AdminServices {
  public users = User;
  public miner = Miner;
  public farmer = Farmer;
  public cluster = Cluster;
  public offtaker = Offtaker;
  public gemExcite = GemExcite;
  public warehouse = Warehouse;
  // public commodity = Commodity;
  public authService = new AuthService();

  public async createAdmin(body: createAdminDto['body']) {
    const hashedPassword = await hash(body.password, 10);

    const user = await this.users.create({
      ...body,
      userType: UserType.ADMIN,
      password: hashedPassword,
    });

    user.name.firstName = body.firstName;
    user.name.lastName = body.lastName;
    const newUser = await user.save();

    return newUser;
  }

  public async login(body: loginAdminDto['body']) {
    const findAdmin = await this.users.findOne({ email: body.email });

    if (!findAdmin || findAdmin.userType !== UserType.ADMIN)
      throw new HttpException(401, 'Email/Password is incorrect');

    const isPasswordMatching = await compare(body.password, findAdmin.password);
    if (!isPasswordMatching)
      throw new HttpException(401, 'Email/Password is incorrect');

    if (!findAdmin.isVerified) {
      findAdmin.confirmationCode =
        this.authService.createToken(findAdmin).token;

      throw new HttpException(401, 'Email is not verified');
    }

    const tokenData = this.authService.createToken(findAdmin);
    const cookie = this.authService.createCookie(tokenData);

    return { cookie, user: findAdmin, token: tokenData.token };
  }

  // public async createCluster(userData: any, body: createClusterDto['body']) {
  //   if (userData.userType !== UserType.ADMIN)
  //     throw new HttpException(401, 'Unauthorized user');

  //   const warehouseExist = await this.warehouse.findById(body.warehouseId);
  //   if (!warehouseExist)
  //     throw new HttpException(400, 'Warehouse does not exist');

  //   const cluster = this.cluster.create({
  //     ...body,
  //     slug: slugify(body.name),
  //     warehouse: warehouseExist.id,
  //     createdBy: userData.id,
  //   });

  //   return cluster;
  // }

  // public async updateCluster(
  //   userData: any,
  //   clusterId: string,
  //   body: updateClusterDto['body']
  //  ) {
  //   if (userData.userType !== UserType.ADMIN)
  //     throw new HttpException(401, 'Unauthorized user');

  //   const findCluster = await this.cluster.findById(clusterId);
  //   if (!findCluster) throw new HttpException(400, 'Cluster does not exist');

  //   const warehouseExist =
  //     body.warehouseId && findCluster.warehouse.toString() !== body.warehouseId
  //       ? await this.warehouse.findById(body.warehouseId)
  //       : undefined;
  //   if (!warehouseExist && body.warehouseId)
  //     throw new HttpException(400, 'Warehouse does not exist');

  //   findCluster.name = body.name ? body.name : findCluster.name;
  //   findCluster.description = body.description
  //     ? body.description
  //     : findCluster.description;
  //   findCluster.commodityName = body.commodityName
  //     ? body.commodityName
  //     : findCluster.commodityName;
  //   findCluster.quantityAvailable = body.quantityAvailable
  //     ? body.quantityAvailable
  //     : findCluster.quantityAvailable;
  //   findCluster.pricePerTonne = body.pricePerTonne
  //     ? body.pricePerTonne
  //     : findCluster.pricePerTonne;
  //   findCluster.prevPricePerTonne = body.prevPricePerTonne
  //     ? body.prevPricePerTonne
  //     : findCluster.prevPricePerTonne;
  //   findCluster.warehouse = warehouseExist
  //     ? warehouseExist.id
  //     : findCluster.warehouse;

  //   const cluster = await findCluster.save();

  //   return cluster;
  // }

  // public async addGemExciteToCluster(
  //   userData: any,
  //   gemExciteId: string,
  //   clusterId: string
  //  ) {
  //   if (userData.userType !== UserType.ADMIN)
  //     throw new HttpException(401, 'Unauthorized user');

  //   const gemExcite = await this.gemExcite.findById(gemExciteId);
  //   if (!gemExcite) throw new HttpException(400, 'Gem excite does not exist');

  //   const cluster = await this.cluster.findById(clusterId);
  //   if (!cluster) throw new HttpException(400, 'Cluster does not exist');

  //   gemExcite.profile.cluster = cluster.id;
  //   const updatedGemExcite = await gemExcite.save();

  //   cluster.gemExciteAssigned = true;
  //   await cluster.save();

  //   return updatedGemExcite;
  // }

  public async createWarehouse(
    userData: any,
    body: createWarehouseDto['body']
  ) {
    if (userData.userType !== UserType.ADMIN)
      throw new HttpException(401, 'Unauthorized user');

    const warehouse = this.warehouse.create({
      ...body,
    });

    if (!warehouse) throw new HttpException(400, 'Error creating warehouse');

    return warehouse;
  }

  public async updateWarehouse(
    userData: any,
    warehouseId: string,
    body: updateWarehouseDto['body']
  ) {
    if (userData.userType !== UserType.ADMIN)
      throw new HttpException(401, 'Unauthorized user');

    const warehouseExist = await this.warehouse.findById(warehouseId);
    if (!warehouseExist)
      throw new HttpException(400, 'Warehouse does not exist');

    warehouseExist.name = body.name ? body.name : warehouseExist.name;
    warehouseExist.type = body.type ? body.type : warehouseExist.type;
    warehouseExist.location = body.location
      ? body.location
      : warehouseExist.location;
    const updatedWarehouse = await warehouseExist.save();

    if (!updatedWarehouse)
      throw new HttpException(400, 'Error updating warehouse');

    return updatedWarehouse;
  }

  // public async addAdminToWarehouse(
  //   userData: any,
  //   gemExciteId: string,
  //   warehouseId: string
  //  ) {
  //   if (userData.userType !== UserType.ADMIN)
  //     throw new HttpException(401, 'Unauthorized user');

  //   const gemExcite = await this.gemExcite.findById(gemExciteId);
  //   if (!gemExcite)
  //     throw new HttpException(400, 'Warehouse admin does not exist');

  //   if (gemExcite.profile.isWarehouseAdmin)
  //     throw new HttpException(400, 'Gem excite is already a warehouse admin');

  //   const warehouse = await this.warehouse.findById(warehouseId);
  //   if (!warehouse) throw new HttpException(400, 'Cluster does not exist');

  //   gemExcite.profile.isWarehouseAdmin = true;
  //   gemExcite.profile.warehouse = warehouse.id;
  //   const updatedGemExcite = await gemExcite.save();

  //   warehouse.admin = gemExcite.id;
  //   await warehouse.save();

  //   return updatedGemExcite;
  // }

  public async deleteWarehouse(userData: any, warehouseId: string) {
    if (userData.userType !== UserType.ADMIN)
      throw new HttpException(401, 'Unauthorized user');

    const warehouseExist = await this.warehouse.findById(warehouseId);
    if (!warehouseExist)
      throw new HttpException(400, 'Warehouse does not exist');

    const clusters = await this.cluster.find({ warehouse: warehouseId });

    if (clusters.length > 0)
      throw new HttpException(400, 'Clusters are attached to warehouse');

    const deletedWarehouse = await this.warehouse.deleteOne({
      _id: warehouseId,
    });

    return deletedWarehouse;
  }

  public async getClustersInWarehouse(userData: any, warehouseId: string) {
    if (userData.userType !== UserType.ADMIN)
      throw new HttpException(401, 'Unauthorized user');

    const clusters = await this.cluster.find({ warehouse: warehouseId });

    return clusters;
  }
}
export default AdminServices;
