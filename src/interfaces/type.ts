export enum UserType {
  ADMIN = 'Admin',
  OFFTAKER = 'Offtaker',
  MINER = 'Miner',
  FARMER = 'Farmer',
  GEMEXCITE = 'GemExcite',
  GEMADMIN = "GemAdmin",
  STOREKEEPER = 'StoreKeeper',
}

export enum UserStatus {
  PENDING = 'Pending',
  ACTIVE = 'Active',
  BLOCKED = 'Blocked'
}

export enum AddressType {
  COMPANY = 'company',
  PERSONAL = 'personal',
  DELIVERY = 'delivery',
  BILLING = 'address',
}

export enum ClusterType {
  FARMER = 'farmer',
  MINER = 'miner',
}

export enum WarehouseType {
  BONDED = 'bonded',
  HOLDING = 'holding',
}

export enum InventoryType {
  STORAGE = 'storage',
  PREORDER = 'pre-Order'
}

export enum RequestStatus {
  NEWREQUEST = 'new-request',
  PENDING = 'pending',
  INCULTIVATION = 'in-cultivation',
  HARVESTED = 'harvested',
  QUALITYCHECK = 'quality-check',
  DEPOSITORY = 'depository',
  CANCELLED = 'canceled',
}

export enum UserRequestStatus {
  PENDING = 'pending',
  INCULTIVATION = 'in-cultivation',
  UPLOADED = 'uploaded',
  VALIDATING = 'validating',
  DELIVERED = 'delivered',
}

// export enum StorageRequestStatus {
//   SEATED = 'seated',
//   AVAILABLE = 'available',
//   INTRANSIT = 'in-transit',
//   DELIVERED = 'delivered',
//   CANCELLED = 'canceled',
// }

export enum OrderStatus {
  NEWREQUEST = 'new-request',
  PENDING = 'pending',
  INCULTIVATION = 'in-cultivation',
  HARVESTED = 'harvested',
  QUALITYCHECK = 'quality-check',
  DEPOSITORY = 'depository',
  SEATED = 'seated',
  AVAILABLE = 'available',
  INTRANSIT = 'in-transit',
  DELIVERED = 'delivered',
  CANCELLED = 'canceled',
}

export enum OrderType {
  PREORDER = 'pre-order',
  ORDER = 'order'
}

export enum OrderPaymentStatus {
  COMMITTED = 'committed',
  PAID = 'paid',
  OUTSTANDING = 'outstanding',
  CANCELLED = 'canceled',
}

export enum RequestType {
  FARMER = 'farmer',
  MINER = 'miner',
  GEMEXCITE = 'gemExcite',
  STOREKEEPER= 'storekeeper'
}

export enum UploadedCommodityStatus {
  PENDING = 'pending',
  PASSEDQUALITYCHECK = 'passed-quality-check',
  FAILEDQUALITYCHECK = 'failed-quality-check',
  // INTRANSIT = 'in-transit',
  // PICKEDUP = 'picked-up',
  // DELIVERED = 'delivered',
};

export enum CommodityType {
  AGRICPRODUCE = 'AgricProduce',
  SOLIDMINERALS = 'SolidMinerals',
  PROCESSEDCOMMODITIES= 'ProcessedCommodities'
}
