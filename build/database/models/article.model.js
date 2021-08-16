"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Article = void 0;
const mongoose_1 = require("mongoose");
const ArticleSchema = new mongoose_1.Schema({
    title: {
        type: mongoose_1.Schema.Types.String
    },
    description: {
        type: mongoose_1.Schema.Types.String
    },
    body: {
        type: mongoose_1.Schema.Types.String
    },
    link: {
        type: mongoose_1.Schema.Types.String
    },
    imageLink: {
        type: mongoose_1.Schema.Types.String
    },
    type: {
        type: mongoose_1.Schema.Types.String
    }
}, {
    timestamps: true
});
ArticleSchema.methods.toJSONFor = function () {
    return {
        title: this.title,
        description: this.description,
        body: this.body,
        link: this.link,
        imageLink: this.imageLink,
        type: this.type,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
};
exports.Article = mongoose_1.model('Article', ArticleSchema);
//# sourceMappingURL=article.model.js.map