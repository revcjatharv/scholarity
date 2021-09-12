import { NextFunction, Request, Response, Router } from 'express';
import IUserModel, { User } from '../database/models/user.model';
import passport from 'passport';
import { authentication } from "../utilities/authentication";
import { emailer } from '../utilities/emailer';
import path from 'path';
import passportMobileAppSocialAuth from '../utilities/fileUploader';


import { firebaseConfig } from "../utilities/firebaseConfig";
import { payment } from '../utilities/payment';
import ITestModel, { TestList } from '../database/models/test.list.model';
import ITestDataModel, { TestData } from '../database/models/test.data.model';


const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const bucketName = 'scholarity'
const id = 'AKIAZ44S7I6G7HANIOSS'
const secret = '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'
const s3 = new aws.S3({
  secretAccessKey: secret,
  accessKeyId: id,
  region: "ap-south-1",
  ACL:'public-read'
});
const upload = multer({
  limits: {
      fileSize: 500 * 1024
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

        // Update only fields that have values:
        // ISSUE: DRY out code?
        // send the field accountNuumber, bankName, ifsc in additionlData
        if(typeof req?.body?.user?.wallet !== 'undefined') {
          user.wallet = req.body.user.wallet
          return user.save().then(() => {
            return res.json({user: user.toAuthJSON()});
          });
        }
      })
      .catch(next);
  }
);


/**
 * POST /api/users
 */
router.post('/users', (req: Request, res: Response, next: NextFunction) => {

  const user: IUserModel = new User();

  user.username = req.body.user.username;
  user.email    = req.body.user.email;
  user.setPassword(req.body.user.password);
  user.bio   = '';
  user.image = '';
  user.dob =  req?.body?.user?.dob || ''
  user.mobileNumber =  req?.body?.user?.mobileNumber || ''
  user.fullName =  req?.body?.user?.fullName || ''
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
      return res.send('User not found with this identity');
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

router.post('/sendNotificationPush', (req:Request, res: Response, next: NextFunction)=> {
  const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
  };
  // Message format 
  // notification: {
  //   title: enter_subject_of_notification_here,
  //   body: enter_message_here
  //       }
  const {registrationToken, message } = req?.body
  firebaseConfig.admin.messaging().sendToDevice(registrationToken, message, notification_options)
  .then( (response:any) => {
   res.status(200).send("Notification sent successfully")
  })
  .catch( (error:any) => {
      res.status(400).send('Failed to send user notification')
  });

})


// ISSUE: How does this work with the trailing (req, res, next)?
/**
 * POST /api/users/login
 */
router.post('/users/login', (req: Request, res: Response, next: NextFunction) => {

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

router.post('/requestPrizeMoney', async (req: Request, res: Response, next: NextFunction) => {
  const {balance, userId, accountData, panCardImage}  = req?.body;
  if(!panCardImage ||  !userId || !balance || !accountData){
    return res.send({status: false, msg: 'Please review data multiple data missing'})

  }
  const getUser = await User.findById(userId);
  if(getUser.wallet.balance > balance){
    // send the money to a user by razor pay
    // TBD
    getUser.wallet.balance =getUser.wallet.balance-balance;
    getUser.panCardImage = panCardImage;
    getUser.wallet.additionalData = accountData
    const saveUser =  await getUser.save();
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
