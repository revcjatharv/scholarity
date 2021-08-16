import { Document, Model, model, Schema } from 'mongoose';
import { IArticle } from '../../interfaces/article-interface';

export default interface IArticleModel extends IArticle, Document {
  toJSONFor(): any;

  updateFavoriteCount(): Promise<IArticleModel>;
}

const ArticleSchema = new Schema({
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
  type: {
    type: Schema.Types.String
  }
}, {
  timestamps: true
});


ArticleSchema.methods.toJSONFor = function () {
  return {
    title         : this.title,
    description   : this.description,
    body          : this.body,
    link          : this.link,
    imageLink     : this.imageLink,
    type          : this.type,
    createdAt     : this.createdAt,
    updatedAt     : this.updatedAt,
  };

};

export const Article: Model<IArticleModel> = model<IArticleModel>('Article', ArticleSchema);
