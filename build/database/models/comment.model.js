"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const mongoose_1 = require("mongoose");
const CommentSchema = new mongoose_1.Schema({
    body: {
        type: mongoose_1.Schema.Types.String
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    article: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Article'
    }
}, { timestamps: true });
CommentSchema.methods.toJSONFor = function (user) {
    return {
        id: this._id,
        body: this.body,
        createdAt: this.createdAt,
        author: this.author.toProfileJSONFor(user)
    };
};
exports.Comment = mongoose_1.model('Comment', CommentSchema);
//# sourceMappingURL=comment.model.js.map