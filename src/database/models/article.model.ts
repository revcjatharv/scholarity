import { Document, Model, model, Schema } from 'mongoose';
import { IArticle } from '../../interfaces/article-interface';

export default interface IArticleModel extends IArticle, Document {
  toJSONFor(): any;

  updateFavoriteCount(): Promise<IArticleModel>;
}

const ArticleSchema = new Schema({
  title         : {
    type: Schema.Types.String
  },
  description   : {
    type: Schema.Types.String
  },
  body          : {
    type: Schema.Types.String
  },
  link: {
    type: Schema.Types.String

  },
  tag: {
    type: Schema.Types.String
  },
  source: {
    type: Schema.Types.String
  },
  author        : {
    type: Schema.Types.String,
  },
}, {
  timestamps: true
});


ArticleSchema.methods.toJSONFor = function () {
  return {
    title         : this.title,
    description   : this.description,
    body          : this.body,
    source        : this.source,
    link          : this.link,
    tag           : this.tag,
    createdAt     : this.createdAt,
    updatedAt     : this.updatedAt,
    author        : this.author
  };

};

export const Article: Model<IArticleModel> = model<IArticleModel>('Article', ArticleSchema);
