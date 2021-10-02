import { Document, model, Model, Schema } from "mongoose";
import { ITestList } from "../../interfaces/test-list-interface";

export default interface ITestModel extends ITestList, Document {
    toAuthJSON(): any
}

const TestListSchema = new Schema({
    date: {
        type: Schema.Types.Date
    },
    isConducted: {
        type: Schema.Types.Boolean
    },
    isTestStarted: {
        type: Schema.Types.Boolean,
        default: false
    },
    testType: {
        type: Schema.Types.String,
        enum: ['UPSC', 'NEET', 'IIT', 'CA', 'AIIMS', 'GATE', 'NDA']
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
    timer: {
        type: Schema.Types.Number,
        default: 20000
    },
    instruction: {
        type: Schema.Types.String,
    },
    entryFee: {
        type: Schema.Types.Number
    }
}, { timestamps: true });

TestListSchema.methods.toAuthJSON = function (): any {
    return {
        id: this._id,
        date: this.date,
        isConducted: this.isConducted,
        isTestStarted: this.isTestStarted,
        testName: this.testName,
        testDescription: this.testDescription,
        testTime: this.testTime,
        maxPrize: this.maxPrize,
        minPrize: this.minPrize,
        timer: this.timer,
        totalQuestions: this.totalQuestions,
        entryFee: this.entryFee,
    };
};

export const TestList: Model<ITestModel> = model<ITestModel>('TestList', TestListSchema);
