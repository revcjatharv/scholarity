import { Document, Model, model, Schema } from 'mongoose';
import { INotification } from '../../interfaces/notification-interface';

export default interface INotificationModel extends INotification, Document {
  toJSONFor(): any;

}

const NotificationSchema = new Schema({
  title: {
    type: Schema.Types.String
  },
  description: {
    type: Schema.Types.String
  },
  body: {
    type: Schema.Types.String
  },
  link: {
    type: Schema.Types.String
  },
  imageLink: {
    type: Schema.Types.String
  },
  userId: {
    type: Schema.Types.String
  }
}, {
  timestamps: true
});


NotificationSchema.methods.toJSONFor = function () {
  return {
    title         : this.title,
    description   : this.description,
    body          : this.body,
    link          : this.link,
    imageLink     : this.imageLink,
    userId        : this.userId,
    createdAt     : this.createdAt,
    updatedAt     : this.updatedAt,
  };

};

export const Notification : Model<INotificationModel> = model<INotificationModel>('Notification', NotificationSchema);
