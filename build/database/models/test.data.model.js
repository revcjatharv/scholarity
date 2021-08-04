"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestData = void 0;
const mongoose_1 = require("mongoose");
const TestDataSchema = new mongoose_1.Schema({
    testId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'TestList'
    },
    question: {
        type: mongoose_1.Schema.Types.String
    },
    options: {
        type: mongoose_1.Schema.Types.Array
    },
    answer: {
        type: mongoose_1.Schema.Types.String
    },
}, { timestamps: true });
TestDataSchema.methods.toAuthJSON = function () {
    return {
        testId: this.testId,
        question: this.question,
        options: this.options,
        answer: this.answer
    };
};
exports.TestData = mongoose_1.model('TestData', TestDataSchema);
//# sourceMappingURL=test.data.model.js.map