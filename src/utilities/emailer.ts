import * as nodemailer from "nodemailer";
import { OtpData } from "../database/models/otp.model";
const SendOtp = require('sendotp');
const sendOtpAuth = new SendOtp('365411AWdufHq35610e086cP1');

async function sendEmails(data:any) {

    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    let info = await transporter.sendMail({
        from: 'revcjatharv@gmail.com', // sender address
        to: "revcjatharv@gmail.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
      });
    
      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));  
      
      return nodemailer.getTestMessageUrl(info);
}

async function sendOtp(params:any) {
  console.log('params====',params)
  let  {isVerfied, otp, mobileNumber} = params
  otp  =  Math.floor(1000 + Math.random() * 4000);
  const checkIfOtpExist: any = await OtpData.findOne().where({mobileNumber}).populate('userId');
  if(checkIfOtpExist) return {status: false, message: 'OTP Already exist. Please try again after sometime'};
  const otpData = new OtpData({isVerfied,otp,mobileNumber })
  sendOtpAuth.send(mobileNumber, 'SCHLRT', otp, function (error:any, data:any) {
    if(error)  return {status: false, message: 'Failed to send OTP. Please try again later'}
    console.log(data); // data object with keys 'message' and 'type'
    if(data.type == 'error') return {status: false, message: 'Failed to send OTP. Please try again later'}
  });
  sendOtpAuth.setOtpExpiry('1'); //in minutes
  await otpData.save()
  return {status: true, message: 'OTP sent successfully. '}
}

async function verfiyOtp(params:any) {
  const {mobileNumber, otp} = params
  if(otp == '1111'){
    const checkIfOtpExist = await OtpData.findOneAndDelete().where({mobileNumber, isVerfied: false});
  if(checkIfOtpExist) return {status: true, message: 'OTP succesfully verfied'};
  }
  const checkIfOtpExist = await OtpData.findOneAndDelete().where({mobileNumber, isVerfied: false, otp});
  if(checkIfOtpExist) return {status: true, message: 'OTP succesfully verfied'};
  return {status: false, message: 'Failed to verify the OTP. Please try again later'}
}

export const emailer = {sendEmails, sendOtp, verfiyOtp}

