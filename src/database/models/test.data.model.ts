import { Document, model, Model, Schema } from "mongoose";
import { ITestData } from "../../interfaces/test-data-interface";

export default interface ITestDataModel extends ITestData, Document {
    toAuthJSON(): any
}

const TestDataSchema = new Schema({
    testId: {
        type: Schema.Types.ObjectId,
        ref: 'TestList'
    },
    question: {
        type: Schema.Types.String
    },
    options: {
        type: Schema.Types.Array
    },
    answer: {
        type: Schema.Types.String
    },
}, { timestamps: true });

TestDataSchema.methods.toAuthJSON = function (): any {
    return {
        testId: this.testId,
        question: this.question,
        options: this.options,
        answer: this.answer
    };
};
export const TestData: Model<ITestDataModel> = model<ITestDataModel>('TestData', TestDataSchema);
