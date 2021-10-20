import { Document, model, Model, Schema } from "mongoose";
import { IUserTest } from "../../interfaces/user-test-mapping-interface";

export default interface IUserTestModel extends IUserTest, Document {
    toAuthJSON(): any
}

const UserTestSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref:'User'
    },
    testId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref:'TestList'
    },
    qARounds: {
        type: Schema.Types.Array
    },
    totalMarks: {
        type: Schema.Types.Number,
        default: 0
    },
    winAmount: {
        type: Schema.Types.Number,
        default: 0
    },
    rank: {
        type: Schema.Types.Number,
        default: 0
    }
}, { timestamps: true });

UserTestSchema.methods.toAuthJSON = function (): any {
    return {
        userId: this.userId,
        testId: this.testId,
        qARounds: this.qARounds,
        totalMarks: this.totalMarks,
        winAmount: this.winAmount,
        rank: this.rank
    };
};

export const UserTest: Model<IUserTestModel> = model<IUserTestModel>('UserTest', UserTestSchema);
