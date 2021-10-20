import { NextFunction, Request, Response, Router } from 'express';
import IUserModel, { User } from '../database/models/user.model';
import { Notification } from '../database/models/notification.model';
import passport from 'passport';
import { authentication } from "../utilities/authentication";
import { emailer } from '../utilities/emailer';
import path from 'path';
import passportMobileAppSocialAuth from '../utilities/fileUploader';


import { firebaseConfig } from "../utilities/firebaseConfig";
import { payment } from '../utilities/payment';
import ITestModel, { TestList } from '../database/models/test.list.model';
import ITestDataModel, { TestData } from '../database/models/test.data.model';
const fs = require('fs')


require('dotenv').config();

const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const bucketName = process.env.BUCKET_NAME
const id = process.env.ID
const secret = process.env.SECRET
const s3 = new aws.S3({
  secretAccessKey: secret,
  accessKeyId: id,
  region: process.env.REGION,
  ACL: process.env.ACL
});
const upload = multer({
  limits: {
      fileSize: 500 * 1024 *1024
  },
  fileFilter: (req:any, file:any, cb:any) => {

      cb(null, {success: true, msg: 'true'});
  },
  storage: multerS3({
      s3,
      acl: 'public-read',
      bucket: bucketName,
      metadata: function metadata(req:any, file:any, cb:any) {
          cb(null, { fieldName: file.fieldname });
      },
      key: function key(req:any, file:any, cb:any) {
          const fileName = file.originalname;
          const fileExtension = path.extname(fileName);
          const fileNameNoExtension = path.basename(fileName, fileExtension);
          const mdfied = `${fileNameNoExtension}${Date.now().toString()}`;
          let subfolder = req.query.contentType || '';
          subfolder = subfolder !== '' ? `${subfolder}/` : '';
          cb(null, `${subfolder}${fileNameNoExtension}-${mdfied}${fileExtension}`);
      }
  })
});


const csvFilter = (req:any, file:any, cb:any) => {
  if (file.mimetype.includes("csv")) {
    cb(null, true);
  } else {
    cb("Please upload only csv file.", false);
  }
};

var storage = multer.diskStorage({
  destination: (req:any, file:any, cb:any) => {
    cb(null, __dirname + "/uploads/");
  },
  filename: (req:any, file:any, cb:any) => {
    console.log(file.originalname);
    cb(null, `${Date.now()}-bezkoder-${file.originalname}`);
  },
});

var uploadFile = multer({ storage: storage, fileFilter: csvFilter });

const router: Router = Router();

/**
 * GET /api/user
 */
router.get('/user', authentication.required, (req: Request, res: Response, next: NextFunction) => {

    User
      .findById(req.payload.id)
      .then((user: IUserModel) => {
          res.status(200).json({user: user.toAuthJSON()});
        }
      )
      .catch(next);

  }
);

router.post('/userByMobileNumber', authentication.required, (req: Request, res: Response, next: NextFunction) => {
  const {mobileNumber} = req.body
  User
    .findOne({mobileNumber})
    .then((user: IUserModel) => {
        res.status(200).json({user: user.toAuthJSON()});
      }
    )
    .catch(next);
}
);



/**
 * PUT /api/user
 */
router.put('/user', authentication.required, (req: Request, res: Response, next: NextFunction) => {

    User
      .findOne({email: req.body.user.email})
      .then((user: IUserModel) => {
        console.log("User====", user)
        if (!user) {
          return res.sendStatus(401);
        }

        if(typeof req?.body?.user?.fullName !== 'undefined'){
          user.fullName = req?.body?.user?.fullName
        }
        if(typeof req?.body?.user?.image !== 'undefined'){
          user.image = req?.body?.user?.image
        }
        if(typeof req?.body?.user?.dob !== 'undefined'){
          user.dob = req?.body?.user?.dob
        }
        // Update only fields that have values:
        // ISSUE: DRY out code?
        // send the field accountNuumber, bankName, ifsc in additionlData
        if(typeof req?.body?.user?.wallet !== 'undefined') {
          user.wallet = req.body.user.wallet
        }

        return user.save().then(() => {
          return res.json({user: user.toAuthJSON()});
        });
      })
      .catch(next);
  }
);


/**
 * POST /api/users
 */
router.post('/users', async (req: Request, res: Response, next: NextFunction) => {

  const user: IUserModel = new User();
  const isUserExist = await User.findOne({email: req.body.user.email})
  if(isUserExist){
    return res.send({status: false, message: 'user already exist with same email id. Please try with new email or ask admin to reset it.'})
  }

  const isMobileNumber = await User.findOne({email: req.body.user.mobileNumber})
  if(isMobileNumber){
    return res.send({status: false, message: 'user already exist with same mobile number. Please try with new number or ask admin to reset it.'})
  }
  user.username = req.body.user.username;
  user.email    = req.body.user.email;
  user.setPassword(req.body.user.password);
  user.bio   = '';
  user.image = req.body.user.image;
  user.dob =  req?.body?.user?.dob || ''
  user.mobileNumber =  req?.body?.user?.mobileNumber || ''
  user.fullName =  req?.body?.user?.fullName || ''
  user.firebaseToken = req.body.user.firebaseToken;
  user.wallet = req?.body?.user?.wallet || {
    balance: 0,
    currency: 'INR',
    platform: 'RAZORPAY',
    additionalData: {}
  }

  return user.save()
    .then(() => {
      return res.json({user: user.toAuthJSON()});
    })
    .catch(next);

});

router.post('/changePassword', (req:Request, res: Response, next: NextFunction)=> {
  const {mobileNumber, password, confirmPassword} = req.body;
  if(password !== confirmPassword){
    return res.send('Password and confirm password does not matches')
  }

  User
  .findOne({mobileNumber})
  .then((user: any) => {

    if (!user) {
      return res.send({status: false,msg: 'User not found with this identity'});
    }

    // Update only fields that have values:
    // ISSUE: DRY out code?
    // send the field accountNuumber, bankName, ifsc in additionlData
    if(typeof password !== 'undefined') {
      user.setPassword(password);
    }

    return user.save().then(() => {
      return res.json({user: user.toAuthJSON()});
    });
  })
  .catch(next);


})

router.post('/sendNotificationPush', async (req:Request, res: Response, next: NextFunction)=> {
  const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
  };
  // Message format 
  // notification: {
  //   title: enter_subject_of_notification_here,
  //   body: enter_message_here
  //       }

  // save notification to INotification model

  const {userId, message } = req?.body
  const user = await User.findById(userId);
  if(user && user.firebaseToken){
    firebaseConfig.admin.messaging().sendToDevice(user.firebaseToken, message, notification_options)
    .then( async (response:any) => {
    const notification = new Notification({
      title         : message.notification.title,
      description   : JSON.stringify(message),
      body          : JSON.stringify(req.body),
      link          : '',
      imageLink     : '',
      userId        : userId,
    })
    await notification.save()
     res.status(200).send({msg:"Notification sent successfully", data: response,status:true})
    })
    .catch( (error:any) => {
        res.status(400).send({msg: 'Failed to send user notification', data: error,status:false})
    });
  } else {
    res.status(400).send({msg: 'User not found', data: {}, status:false})
  }

})

router.post('/getNotificationPerUser', async (req:Request, res: Response, next: NextFunction) => {
  const {userId} = req.body 
  const notification = await Notification.find({userId});
  if(notification && notification.length > 0){
    return res.status(200).send({msg: 'data ', data: notification, status: true})
  } else {
    return res.status(200).send({msg: 'data not found', data: notification, status: false})
  }
})


// ISSUE: How does this work with the trailing (req, res, next)?
/**
 * POST /api/users/login
 */
router.post('/users/login', async (req: Request, res: Response, next: NextFunction) => {
  if(req.body.user.firebaseToken && req.body.user.email){
    const user = await User.findOne({email:req.body.user.email })
    if(user){
      user.firebaseToken  = req.body.user.firebaseToken
    } else {
      return res.status(422).json({status: false, msg: 'User not found. Invalid creds'});
    }
  }
  if (!req.body.user.email) {
    return res.status(422).json({errors: {email: "Can't be blank"}});
  }

  if (!req.body.user.password) {
    return res.status(422).json({errors: {password: "Can't be blank"}});
  }

  passport.authenticate('local', {session: false}, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (user) {
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});

    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);

});

function extractAsCSV(users: any[], balance: number) {

  console.log("inputData>>>>>>>")
  const header = ["\nUsername,Email,MobileNumber,FullName,Balance,AccountDetail,PanImage"];
  const rows = users.map(user =>
     `${user.username},${user.email},${user.mobileNumber},${user.fullName},${balance},${JSON.stringify(user.wallet.additionalData)},${user.panCardImage}`
  );
  return header.concat(rows).join("\n");
}

function writeToCSVFile(users:any[], balance:number) {
  console.log("I am in writeToCSVFile",users)
  const filename = 'output_'+new Date().toISOString().split('T')[0]+'.csv';
  fs.appendFile(filename, extractAsCSV(users, balance), (err:any) => {
    if (err) {
      console.log('Error writing to csv file', err);
    } else {
      console.log(`saved as ${filename}`);
    }
  });
}


router.post('/requestPrizeMoney', async (req: Request, res: Response, next: NextFunction) => {
  const {balance, userId, accountData, panCardImage}  = req?.body;
  if(balance > 30000){
    return res.send({status: false, msg: 'You can not request for money more than 30000'})
  }
  
  if(!panCardImage ||  !userId || !balance || !accountData){
    return res.send({status: false, msg: 'Please review data multiple data missing'})

  }
  const getUser = await User.findById(userId);
  if(getUser.wallet.balance >= balance){
    getUser.wallet.balance =getUser.wallet.balance-balance;
    getUser.panCardImage = panCardImage;
    getUser.wallet.additionalData = accountData
    const saveUser =  await User.findOneAndUpdate({_id: getUser._id},{$set: {panCardImage:panCardImage, wallet: getUser.wallet }});
    // make a csv file 
    // const users = [];
    writeToCSVFile([saveUser], balance)
    res.send({status: true, msg:'User saved with new balance', data: {saveUser}})
  }else{
    return res.send({status: false, msg: 'Please request money less than or equal to what you have in your wallet balance'})
  }

})

router.post('/sendOtp', async(req: Request, res: Response, next: NextFunction) => {
  const response = await emailer.sendOtp(req?.body);
  return res.send({response})
} )

router.post('/verifyOtp', async(req: Request, res: Response, next: NextFunction) => {
  const response = await emailer.verfiyOtp(req?.body);
  return res.send({response})
} )

router.post('/sendEmail', async (req: Request, res: Response, next: NextFunction) => {
  const response  = await emailer.sendEmails(req.body)
  return res.send({response})
})

router.post('/makePayment', async (req: Request, res: Response, next: NextFunction) => {
  const response  = await payment(req.body.amount)
  return res.send({response})
})

router.post('/uploadFiles', upload.single('myFile') ,async (req:any, res: Response, next) => {
  if (!req?.file?.location) {
    return res.send({success: false, msg: 'result failed succesfully', data: null});
}
  res.send({success: true, msg: 'result uploaded succesfully', data: req.file.location});
})

router.post(
  '/login/google/token',
  passportMobileAppSocialAuth('google-token'),
  async (req: Request, res: Response, next: NextFunction) =>{
    res.send({success: true, data: req.user, msg: 'success'})
  }
);

router.post('/uploadTestList',uploadFile.single('myFile'),async (req: any, res: Response, next: NextFunction) => {
  const csvtojson=require("csvtojson");
  let path = __dirname + "/uploads/" + req.file.filename;
  const jsonArray=await csvtojson().fromFile(path);
  console.log("jsonArray",jsonArray)
  for (let index = 0; index < jsonArray.length; index++) {
    const element = jsonArray[index];
    const testList: ITestModel = new TestList({...element});
    await testList.save()
  }

  return res.send({success: true, msg: 'saved test success'});
})

router.post('/uploadTestData',uploadFile.single('myFile'),async (req: any, res: Response, next: NextFunction) => {
  const csvtojson=require("csvtojson");
  let path = __dirname + "/uploads/" + req.file.filename;
  const jsonArray=await csvtojson().fromFile(path);
  console.log("jsonArray",jsonArray)
  for (let index = 0; index < jsonArray.length; index++) {
    const element = jsonArray[index];
    const testListName = await TestList.findOne({testName:element.testName});
    delete element.testName;
    if(testListName) {
      element.options = []
      element.options.push(element['options/0'])
      element.options.push(element['options/1'])
      element.options.push(element['options/2'])
      element.options.push(element['options/3'])
      element.testId=  testListName._id
      const testData: ITestDataModel = new TestData({...element});
      await testData.save()
    }
  }

  return res.send({success: true, msg: 'saved test success'});
})



export const UsersRoutes: Router = router;
