"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestList = void 0;
const mongoose_1 = require("mongoose");
const TestListSchema = new mongoose_1.Schema({
    date: {
        type: mongoose_1.Schema.Types.String
    },
    isConducted: {
        type: mongoose_1.Schema.Types.Boolean
    },
    testName: {
        type: mongoose_1.Schema.Types.String
    },
    testDescription: {
        type: mongoose_1.Schema.Types.String
    },
    testTime: {
        type: mongoose_1.Schema.Types.String
    },
    maxPrize: {
        type: mongoose_1.Schema.Types.Number
    },
    minPrize: {
        type: mongoose_1.Schema.Types.Number
    },
    totalQuestions: {
        type: mongoose_1.Schema.Types.Number
    },
    entryFee: {
        type: mongoose_1.Schema.Types.Number
    }
}, { timestamps: true });
TestListSchema.methods.toAuthJSON = function () {
    return {
        date: this.date,
        isConducted: this.isConducted,
        testName: this.testName,
        testDescription: this.testDescription,
        testTime: this.testTime,
        maxPrize: this.maxPrize,
        minPrize: this.minPrize,
        totalQuestions: this.totalQuestions,
        entryFee: this.entryFee,
    };
};
exports.TestList = mongoose_1.model('TestList', TestListSchema);
//# sourceMappingURL=test.list.model.js.map