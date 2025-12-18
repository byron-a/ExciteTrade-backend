import { Request } from 'express';
import { User } from '@interfaces/users.interface';
import {
  // IFarmer,
  // IGemExcite,
  // IMiner,
  // IOfftaker,
  IUser,
} from '@/interfaces/users.interface';

export interface DataStoredInToken {
  _id: string | unknown;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser<
  P = Record<string, any>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
  Locals extends Record<string, any> = Record<string, any>, // Locals
  U = IUser,
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: U;
}
