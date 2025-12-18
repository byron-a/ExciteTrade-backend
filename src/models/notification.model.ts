import mongoose, { model, models, Schema, Document } from 'mongoose';

export interface Message {
  _id?: string;
  title: string;
  message: string;
  read?: boolean;
}
export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  messageContainer: Message[];
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
  };
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messageContainer: {
      type: [
        {
          title: { type: String },
          message: { type: String },
          read: { type: Boolean, default: false },
        }
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const Notification = model<INotification>('Notification', notificationSchema);
export default Notification;
