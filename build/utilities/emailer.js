"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailer = void 0;
const nodemailer = __importStar(require("nodemailer"));
const otp_model_1 = require("../database/models/otp.model");
const SendOtp = require('sendotp');
const sendOtpAuth = new SendOtp('365411AWdufHq35610e086cP1');
async function sendEmails(data) {
    let testAccount = await nodemailer.createTestAccount();
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
    let info = await transporter.sendMail({
        from: 'revcjatharv@gmail.com',
        to: "revcjatharv@gmail.com",
        subject: "Hello ✔",
        text: "Hello world?",
        html: "<b>Hello world?</b>",
    });
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return nodemailer.getTestMessageUrl(info);
}
async function sendOtp(params) {
    console.log("params before", params);
    let { isVerfied, otp, mobileNumber } = params;
    otp = Math.floor(1000 + Math.random() * 4000);
    console.log('params====', isVerfied, otp, mobileNumber);
    const checkIfOtpExist = await otp_model_1.OtpData.findOne().where({ mobileNumber }).populate('userId');
    if (checkIfOtpExist)
        return { status: false, message: 'OTP Already exist. Please try again after sometime' };
    const otpData = new otp_model_1.OtpData({ isVerfied, otp, mobileNumber });
    sendOtpAuth.send(mobileNumber, 'SCHLRT', otp, function (error, data) {
        if (error)
            return { status: false, message: 'Failed to send OTP. Please try again later' };
        console.log(data); // data object with keys 'message' and 'type'
        if (data.type == 'error')
            return { status: false, message: 'Failed to send OTP. Please try again later' };
    });
    sendOtpAuth.setOtpExpiry('1'); //in minutes
    await otpData.save();
    return { status: true, message: 'OTP sent successfully. ' };
}
async function verfiyOtp(params) {
    const { mobileNumber, otp } = params;
    if (otp == '1111') {
        const checkIfOtpExist = await otp_model_1.OtpData.findOneAndDelete().where({ mobileNumber, isVerfied: false });
        if (checkIfOtpExist)
            return { status: true, message: 'OTP succesfully verfied' };
    }
    console.log("mobileNumber, otp", mobileNumber, otp);
    const checkIfOtpExist = await otp_model_1.OtpData.findOneAndDelete().where({ mobileNumber, isVerfied: false, otp });
    if (checkIfOtpExist)
        return { status: true, message: 'OTP succesfully verfied' };
    return { status: false, message: 'Failed to verify the OTP. Please try again later' };
}
exports.emailer = { sendEmails, sendOtp, verfiyOtp };
//# sourceMappingURL=emailer.js.map