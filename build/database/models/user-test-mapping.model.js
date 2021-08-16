"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTest = void 0;
const mongoose_1 = require("mongoose");
const UserTestSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    testId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'TestList'
    },
    qARounds: {
        type: mongoose_1.Schema.Types.Array
    },
    totalMarks: {
        type: mongoose_1.Schema.Types.Number,
        default: 0
    }
}, { timestamps: true });
UserTestSchema.methods.toAuthJSON = function () {
    return {
        userId: this.userId,
        testId: this.testId,
        qARounds: this.qARounds,
        totalMarks: this.totalMarks
    };
};
exports.UserTest = mongoose_1.model('UserTest', UserTestSchema);
//# sourceMappingURL=user-test-mapping.model.js.map