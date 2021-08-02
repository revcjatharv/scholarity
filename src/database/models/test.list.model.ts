import { Document, model, Model, Schema } from "mongoose";
import { ITestList } from "../../interfaces/test-list-interface";

export default interface ITestModel extends ITestList, Document {
    toAuthJSON(): any
}

const TestListSchema = new Schema({
    date: {
        type: Schema.Types.String
    },
    isConducted: {
        type: Schema.Types.Boolean
    },
    testName: {
        type: Schema.Types.String
    },
    testDescription: {
        type: Schema.Types.String
    },
    testTime: {
        type: Schema.Types.String
    },
    maxPrize: {
        type: Schema.Types.Number
    },
    minPrize: {
        type: Schema.Types.Number
    },
    totalQuestions: {
        type: Schema.Types.Number
    },
    entryFee: {
        type: Schema.Types.Number
    }
}, { timestamps: true });

TestListSchema.methods.toAuthJSON = function (): any {
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

export const TestList: Model<ITestModel> = model<ITestModel>('TestList', TestListSchema);
