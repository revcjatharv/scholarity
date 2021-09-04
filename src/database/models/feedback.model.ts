import { Document, Model, model, Schema } from 'mongoose';

export default interface IFeedbackModel extends Document {
  toJSONFor(): any;

  updateFavoriteCount(): Promise<IFeedbackModel>;
}

const FeedbackSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId
  },
  alternateEmail: {
    type: Schema.Types.String
  },
  subject: {
    type: Schema.Types.String
  },
  body: {
    type: Schema.Types.String
  },
  star: {
    type: Schema.Types.Number
  },
  question:{
    type: Schema.Types.String
  },
  answer:{
    type: Schema.Types.String
  },
  type: {
    type: Schema.Types.String
  }
}, {
  timestamps: true
});


FeedbackSchema.methods.toJSONFor = function () {
  return {
  userId: this.userId,
  subject: this.subject,
  body: this.body,
  star: this.star,
  type: this.type,
  alternateEmail: this.alternateEmail,
  question: this.question,
  answer: this.answer
  };

};

export const Feedback: Model<IFeedbackModel> = model<IFeedbackModel>('Feedback', FeedbackSchema);
