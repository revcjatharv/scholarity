"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Article = void 0;
const mongoose_1 = require("mongoose");
const user_model_1 = require("./user.model");
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const slugify_1 = __importDefault(require("slugify"));
const ArticleSchema = new mongoose_1.Schema({
    slug: {
        type: mongoose_1.Schema.Types.String,
        lowercase: true,
        unique: true
    },
    title: {
        type: mongoose_1.Schema.Types.String
    },
    description: {
        type: mongoose_1.Schema.Types.String
    },
    body: {
        type: mongoose_1.Schema.Types.String
    },
    tagList: [
        {
            type: mongoose_1.Schema.Types.String
        }
    ],
    favoritesCount: {
        type: mongoose_1.Schema.Types.Number,
        default: 0
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
}, {
    timestamps: true
});
ArticleSchema.methods.slugify = function () {
    this.slug = slugify_1.default(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};
ArticleSchema.plugin(mongoose_unique_validator_1.default, { message: 'is already taken' });
ArticleSchema.pre('validate', (function (next) {
    if (!this.slug) {
        this.slugify();
    }
    next();
}));
ArticleSchema.methods.updateFavoriteCount = function () {
    const article = this;
    return user_model_1.User.count({ favorites: { $in: [article._id] } }).then(function (count) {
        article.favoritesCount = count;
        return article.save();
    });
};
ArticleSchema.methods.toJSONFor = function (user) {
    return {
        slug: this.slug,
        title: this.title,
        description: this.description,
        body: this.body,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        tagList: this.tagList,
        favorited: user ? user.isFavorite(this._id) : false,
        favoritesCount: this.favoritesCount,
        author: this.author.toProfileJSONFor(user)
    };
};
exports.Article = mongoose_1.model('Article', ArticleSchema);
//# sourceMappingURL=article.model.js.map