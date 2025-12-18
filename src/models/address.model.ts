import { AddressType } from '@/interfaces/type';
import mongoose, { model, models, Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  type: AddressType;
  address: String;
  country: String;
  state: String;
  city: String;
  phoneNumber: String;
  postalCode: String;
  isPrimary: Boolean;
}

const addressSchema = new Schema<IAddress>({
  type: { type: String, enum: Object.values(AddressType) },
  address: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  phoneNumber: { type: String },
  postalCode: { type: Number, required: true },
  isPrimary: { type: Boolean, default: false },
});

const Address = model<IAddress>('Address', addressSchema);
export default Address;
