import { isEmpty } from '@utils/util';
import Address from '@/models/address.model';
import { HttpException } from '@exceptions/HttpException';
import {
  AddressType,
  OrderType,
  RequestType,
  UserStatus,
  UserType,
  WarehouseType,
} from '@/interfaces/type';
import { IOfftaker } from '@/interfaces/users.interface';
import { Offtaker } from '@/models/users.model';
import {
  offtakerCheckoutDto,
  offtakerOnboardingDto,
} from '@/validator/offtaker.validator';
import Order, { IOrder } from '@/models/order.model';
import Warehouse from '@/models/warehouse.model';
import Cluster from '@/models/cluster.model';
import RequestModel from '@/models/request.model';
import EmailService from './email.service';
import Notification,{Message} from '@/models/notification.model';

class OfftakerService {
  public offtaker = Offtaker;
  public address = Address;
  public order = Order;
  public cluster = Cluster;
  public warehouse = Warehouse;
  public request = RequestModel;
  public emailService = EmailService;
  public notification = Notification;

  public async onboarding(
    userData: IOfftaker,
    data: offtakerOnboardingDto['body']
   ) {
    if (userData.userType !== UserType.OFFTAKER)
      throw new HttpException(401, 'Unauthorized user');

    const offtaker = await this.offtaker.findById(userData._id);

    if (!offtaker) throw new HttpException(400, 'Offtaker does not exist');

    offtaker.name.firstName = data.firstName;
    offtaker.name.lastName = data.lastName;
    offtaker.phoneNumber = data.phoneNumber;

    const companyAddress = await this.address.create({
      type: AddressType.COMPANY,
      address: data.companyAddress,
      country: data.companyCountry,
      state: data.companyState,
      city: data.companyCity,
      postalCode: data.companyZipCode,
      phoneNumber: data.phoneNumber,
      isPrimary: true,
    });

    const profile = {
      companyName: data.companyName,
      companyPosition: data.companyPosition,
      companyAddress: companyAddress.id,
      companyCountry: data.companyCountry,
      companyPhoneNumber: data.phoneNumber,
      companyEmployeeCount: data.companyEmployeeCount,
      companyWebsite: data.companyWebsite,
      preferredCurrency: data.preferredCurrency,
      preferredProducts: data.preferredProducts,
      preferredUnitsOfMeasurement: data.preferredUnitsOfMeasurement,
    };
    offtaker.profile = profile;
    offtaker.status = UserStatus.ACTIVE;

    const updatedOfftaker = await offtaker.save();

    if (!updatedOfftaker)
      throw new HttpException(400, 'An error occurred updating Offtaker');

    const welcomeMessage: Message = {
      title: `👋 Welcome ${userData.name.fullName}!`,
      message: 'Thanks for registering and welcome to ExciteTrade \n this is where you will find important updates or alerts',
    };
    const startNotifying = await this.notification.create({
      user: userData.id,
      messageContainer: [welcomeMessage]
    });

    if(!startNotifying) throw new HttpException(400, "An Error occurred while creating a Notification channel")

    const upDateAddress = await updatedOfftaker.populate(
      'profile.companyAddress'
    );

    if (!upDateAddress)
      throw new HttpException(400, 'An error occurred updating Offtaker address');

    return upDateAddress;
  };

  public async checkout(
    userData: IOfftaker,
    data: offtakerCheckoutDto['body']
   ) {
    if (userData.userType !== UserType.OFFTAKER)
      throw new HttpException(401, 'Unauthorized user');

    const validWarehouse = await this.warehouse.findOne({
      _id: data.selectedWarehouse.warehouseId,
      type: data.selectedWarehouse.warehouseType,
    });

    if (!validWarehouse)
      throw new HttpException(400, 'Invalid warehouse picked');

    let order: Partial<IOrder>;
    const result = await Promise.all(
      data.orderType === OrderType.PREORDER ?
        data.clusters.map(async (cluster) => {
          const clusterExist = await this.cluster.findById(cluster.clusterId).exec();
          if (!clusterExist)
            throw new HttpException(400, 'A cluster picked is invalid');

          order = {
            offtaker: userData.id,
            cluster: clusterExist.id,
            selectedWarehouse: validWarehouse.id,
            quantity: cluster.quantity,
            orderType: data.orderType,
            estimatedDeliveryDate: data.EDD,
            trackingId: require('crypto').randomBytes(6).toString('hex').toUpperCase(),
          };

          const newOrder4rmCluster = await this.order.create(order);
          if (!newOrder4rmCluster)
            throw new HttpException(400, 'An error occurred creating orders');

          const createRequest = await this.request.create({
            type: RequestType.GEMEXCITE,
            order: newOrder4rmCluster.id,
            sourceId: clusterExist.id,
          });

          if (!createRequest)
            throw new HttpException(400, 'An error occurred Creating Request');

          //UPDATE THE CLUSTERS INVOLVED
          const orderRequestedPerCluster = {
            quantity: cluster.quantity,
            order: newOrder4rmCluster.id,
          };
          clusterExist.orderRequested.push(orderRequestedPerCluster);
          const updatingCluster = await clusterExist.save();
          if (!updatingCluster) throw new HttpException(500, 'An error occurred while updating cluster');

          // NOTIFICATION AND EMAIL LOGIC BELOW
          //NOTIFICATION;
          const checkOutMessage: Message = {
            title: "Order Placed",
            message: `Your order has been sent to the cluster with all the details involved. \nTrack your order with this ID:${newOrder4rmCluster.trackingId}`
          };
          const newNotification = await this.notification.findByIdAndUpdate(userData.id, {
            $push: {
            messageContainer: checkOutMessage
            }
          }).exec();

          if (!newNotification) throw new HttpException(400, "An occurred while sending notification");

          //EMAIL;

        })
        :  //ORDERING FROM STORAGE
        data.storages.map(async (storage) => {
          const storageExist = await this.warehouse.findById(storage.warehouseId).exec();
          if (!storageExist)
            throw new HttpException(400, 'A Storage Warehouse picked is invalid');

          order = {
            offtaker: userData.id,
            storage: storageExist.id,
            selectedWarehouse: validWarehouse.id,
            quantity: storage.quantity,
            orderType: data.orderType,
            estimatedDeliveryDate: data.EDD,
            pricePerTonne: storage.pricePerTonne,
            totalAmount: storage.pricePerTonne * storage.quantity,
            trackingId: require('crypto').randomBytes(6).toString('hex').toUpperCase(),
          };

          const newOrder4rmStorage = await this.order.create(order);
          if (!newOrder4rmStorage)
            throw new HttpException(400, 'An error occurred creating orders');

          const request = await this.request.create({
            type: RequestType.STOREKEEPER,
            order: newOrder4rmStorage.id,
            sourceId: storageExist.id,
          });

          if (!request)
            throw new HttpException(400, 'An error occurred Creating Request');
        })
      //EMAIL AND NOTIFICATION LOGIC

    );

    if (!result) throw new HttpException(400, 'An error occurred');

    return result;
  };

  public async getOrders(userData: IOfftaker) {
    if (userData.userType !== UserType.OFFTAKER)
      throw new HttpException(401, 'Unauthorized user');

    const orders = await this.order.find({ offtaker: userData.id });

    return orders;
  };

  public async getOrder(userData: IOfftaker, orderId: string) {
    if (userData.userType !== UserType.OFFTAKER)
      throw new HttpException(401, 'Unauthorized user');

    const order = await this.order.findById(orderId);
    if (!order) throw new HttpException(400, 'Order does not exist');

    return order;
  };

  public async requestOrder() { };
}

export default OfftakerService;
