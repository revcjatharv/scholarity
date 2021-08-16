import { Document, model, Model, Schema } from "mongoose";
import { IOtp } from "../../interfaces/otp-interface";

export default interface IOtpModel extends IOtp, Document {
    toAuthJSON(): any
}

const OtpSchema = new Schema({
    isVerfied: {
        type: Schema.Types.Boolean,
        default: false
    },
    otp: {
        type: Schema.Types.String,
        required: true,
    },
    mobileNumber: {
        type: Schema.Types.String,
        required: true,
    }
}, { timestamps: true });

OtpSchema.methods.toAuthJSON = function (): any {
    return {
        isVerfied: this.isVerfied,
        otp: this.otp,
        mobileNumber: this.mobileNumber
    };
};
export const OtpData: Model<IOtpModel> = model<IOtpModel>('Otp', OtpSchema);
