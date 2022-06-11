"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRoutes = void 0;
const express_1 = require("express");
const user_model_1 = require("../database/models/user.model");
const notification_model_1 = require("../database/models/notification.model");
const passport_1 = __importDefault(require("passport"));
const authentication_1 = require("../utilities/authentication");
const emailer_1 = require("../utilities/emailer");
const path_1 = __importDefault(require("path"));
const fileUploader_1 = __importDefault(require("../utilities/fileUploader"));
const firebaseConfig_1 = require("../utilities/firebaseConfig");
const payment_1 = require("../utilities/payment");
const test_list_model_1 = require("../database/models/test.list.model");
const test_data_model_1 = require("../database/models/test.data.model");
const fs = require('fs');
require('dotenv').config();
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const bucketName = process.env.BUCKET_NAME;
const id = process.env.ID;
const secret = process.env.SECRET;
const s3 = new aws.S3({
    secretAccessKey: secret,
    accessKeyId: id,
    region: process.env.REGION,
    ACL: process.env.ACL
});
const upload = multer({
    limits: {
        fileSize: 500 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        cb(null, { success: true, msg: 'true' });
    },
    storage: multerS3({
        s3,
        acl: 'public-read',
        bucket: bucketName,
        metadata: function metadata(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function key(req, file, cb) {
            const fileName = file.originalname;
            const fileExtension = path_1.default.extname(fileName);
            const fileNameNoExtension = path_1.default.basename(fileName, fileExtension);
            const mdfied = `${fileNameNoExtension}${Date.now().toString()}`;
            let subfolder = req.query.contentType || '';
            subfolder = subfolder !== '' ? `${subfolder}/` : '';
            cb(null, `${subfolder}${fileNameNoExtension}-${mdfied}${fileExtension}`);
        }
    })
});
const csvFilter = (req, file, cb) => {
    if (file.mimetype.includes("csv")) {
        cb(null, true);
    }
    else {
        cb("Please upload only csv file.", false);
    }
};
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + "/uploads/");
    },
    filename: (req, file, cb) => {
        console.log(file.originalname);
        cb(null, `${Date.now()}-bezkoder-${file.originalname}`);
    },
});
var uploadFile = multer({ storage: storage, fileFilter: csvFilter });
const router = express_1.Router();
/**
 * GET /api/user
 */
router.get('/user', authentication_1.authentication.required, (req, res, next) => {
    user_model_1.User
        .findById(req.payload.id)
        .then((user) => {
        res.status(200).json({ user: user.toAuthJSON() });
    })
        .catch(next);
});
router.post('/userByMobileNumber', authentication_1.authentication.required, (req, res, next) => {
    const { mobileNumber } = req.body;
    user_model_1.User
        .findOne({ mobileNumber })
        .then((user) => {
        res.status(200).json({ user: user.toAuthJSON() });
    })
        .catch(next);
});
/**
 * PUT /api/user
 */
router.put('/user', authentication_1.authentication.required, (req, res, next) => {
    user_model_1.User
        .findOne({ email: req.body.user.email })
        .then((user) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        console.log("User====", user);
        if (!user) {
            return res.sendStatus(401);
        }
        if (typeof ((_b = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.fullName) !== 'undefined') {
            user.fullName = (_d = (_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.fullName;
        }
        if (typeof ((_f = (_e = req === null || req === void 0 ? void 0 : req.body) === null || _e === void 0 ? void 0 : _e.user) === null || _f === void 0 ? void 0 : _f.image) !== 'undefined') {
            user.image = (_h = (_g = req === null || req === void 0 ? void 0 : req.body) === null || _g === void 0 ? void 0 : _g.user) === null || _h === void 0 ? void 0 : _h.image;
        }
        if (typeof ((_k = (_j = req === null || req === void 0 ? void 0 : req.body) === null || _j === void 0 ? void 0 : _j.user) === null || _k === void 0 ? void 0 : _k.dob) !== 'undefined') {
            user.dob = (_m = (_l = req === null || req === void 0 ? void 0 : req.body) === null || _l === void 0 ? void 0 : _l.user) === null || _m === void 0 ? void 0 : _m.dob;
        }
        // Update only fields that have values:
        // ISSUE: DRY out code?
        // send the field accountNuumber, bankName, ifsc in additionlData
        if (typeof ((_p = (_o = req === null || req === void 0 ? void 0 : req.body) === null || _o === void 0 ? void 0 : _o.user) === null || _p === void 0 ? void 0 : _p.wallet) !== 'undefined') {
            user.wallet = req.body.user.wallet;
        }
        return user.save().then(() => {
            return res.json({ user: user.toAuthJSON() });
        });
    })
        .catch(next);
});
/**
 * POST /api/users
 */
router.post('/users', async (req, res, next) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const user = new user_model_1.User();
    const isUserExist = await user_model_1.User.findOne({ email: req.body.user.email });
    if (isUserExist) {
        return res.send({ status: false, message: 'user already exist with same email id. Please try with new email or ask admin to reset it.' });
    }
    const isMobileNumber = await user_model_1.User.findOne({ email: req.body.user.mobileNumber });
    if (isMobileNumber) {
        return res.send({ status: false, message: 'user already exist with same mobile number. Please try with new number or ask admin to reset it.' });
    }
    user.email = req.body.user.email;
    user.setPassword(req.body.user.password);
    user.bio = '';
    user.image = req.body.user.image;
    user.dob = ((_b = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.dob) || '';
    user.mobileNumber = ((_d = (_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.mobileNumber) || '';
    user.fullName = ((_f = (_e = req === null || req === void 0 ? void 0 : req.body) === null || _e === void 0 ? void 0 : _e.user) === null || _f === void 0 ? void 0 : _f.fullName) || '';
    user.firebaseToken = req.body.user.firebaseToken;
    user.wallet = ((_h = (_g = req === null || req === void 0 ? void 0 : req.body) === null || _g === void 0 ? void 0 : _g.user) === null || _h === void 0 ? void 0 : _h.wallet) || {
        balance: 0,
        currency: 'INR',
        platform: 'RAZORPAY',
        additionalData: {}
    };
    return user.save()
        .then(() => {
        return res.json({ user: user.toAuthJSON() });
    })
        .catch(next);
});
router.post('/changePassword', (req, res, next) => {
    const { mobileNumber, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.send('Password and confirm password does not matches');
    }
    user_model_1.User
        .findOne({ mobileNumber })
        .then((user) => {
        if (!user) {
            return res.send({ status: false, msg: 'User not found with this identity' });
        }
        // Update only fields that have values:
        // ISSUE: DRY out code?
        // send the field accountNuumber, bankName, ifsc in additionlData
        if (typeof password !== 'undefined') {
            user.setPassword(password);
        }
        return user.save().then(() => {
            return res.json({ user: user.toAuthJSON() });
        });
    })
        .catch(next);
});
router.post('/sendNotificationPush', async (req, res, next) => {
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
    const { userId, message } = req === null || req === void 0 ? void 0 : req.body;
    const user = await user_model_1.User.findById(userId);
    if (user && user.firebaseToken) {
        firebaseConfig_1.firebaseConfig.admin.messaging().sendToDevice(user.firebaseToken, message, notification_options)
            .then(async (response) => {
            const notification = new notification_model_1.Notification({
                title: message.notification.title,
                description: JSON.stringify(message),
                body: JSON.stringify(req.body),
                link: '',
                imageLink: '',
                userId: userId,
            });
            await notification.save();
            res.status(200).send({ msg: "Notification sent successfully", data: response, status: true });
        })
            .catch((error) => {
            res.status(400).send({ msg: 'Failed to send user notification', data: error, status: false });
        });
    }
    else {
        res.status(400).send({ msg: 'User not found', data: {}, status: false });
    }
});
router.post('/getNotificationPerUser', async (req, res, next) => {
    const { userId } = req.body;
    const notification = await notification_model_1.Notification.find({ userId });
    if (notification && notification.length > 0) {
        return res.status(200).send({ msg: 'data ', data: notification, status: true });
    }
    else {
        return res.status(200).send({ msg: 'data not found', data: notification, status: false });
    }
});
// ISSUE: How does this work with the trailing (req, res, next)?
/**
 * POST /api/users/login
 */
router.post('/users/login', async (req, res, next) => {
    if (req.body.user.firebaseToken && req.body.user.email) {
        const user = await user_model_1.User.findOne({ email: req.body.user.email });
        if (user) {
            user.firebaseToken = req.body.user.firebaseToken;
        }
        else {
            return res.status(422).json({ status: false, msg: 'User not found. Invalid creds' });
        }
    }
    if (!req.body.user.email) {
        return res.status(422).json({ errors: { email: "Can't be blank" } });
    }
    if (!req.body.user.password) {
        return res.status(422).json({ errors: { password: "Can't be blank" } });
    }
    passport_1.default.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (user) {
            user.token = user.generateJWT();
            return res.json({ user: user.toAuthJSON() });
        }
        else {
            return res.status(422).json(info);
        }
    })(req, res, next);
});
function extractAsCSV(users, balance) {
    console.log("inputData>>>>>>>");
    const header = ["\nUsername,Email,MobileNumber,FullName,Balance,AccountDetail,PanImage"];
    const rows = users.map(user => `${user.username},${user.email},${user.mobileNumber},${user.fullName},${balance},${JSON.stringify(user.wallet.additionalData)},${user.panCardImage}`);
    return header.concat(rows).join("\n");
}
function writeToCSVFile(users, balance) {
    console.log("I am in writeToCSVFile", users);
    const filename = 'output_' + new Date().toISOString().split('T')[0] + '.csv';
    fs.appendFile(filename, extractAsCSV(users, balance), (err) => {
        if (err) {
            console.log('Error writing to csv file', err);
        }
        else {
            console.log(`saved as ${filename}`);
        }
    });
}
router.post('/requestPrizeMoney', async (req, res, next) => {
    const { balance, userId, accountData, panCardImage } = req === null || req === void 0 ? void 0 : req.body;
    if (balance > 30000) {
        return res.send({ status: false, msg: 'You can not request for money more than 30000' });
    }
    if (!panCardImage || !userId || !balance || !accountData) {
        return res.send({ status: false, msg: 'Please review data multiple data missing' });
    }
    const getUser = await user_model_1.User.findById(userId);
    if (getUser.wallet.balance >= balance) {
        getUser.wallet.balance = getUser.wallet.balance - balance;
        getUser.panCardImage = panCardImage;
        getUser.wallet.additionalData = accountData;
        const saveUser = await user_model_1.User.findOneAndUpdate({ _id: getUser._id }, { $set: { panCardImage: panCardImage, wallet: getUser.wallet } });
        // make a csv file 
        // const users = [];
        writeToCSVFile([saveUser], balance);
        res.send({ status: true, msg: 'User saved with new balance', data: { saveUser } });
    }
    else {
        return res.send({ status: false, msg: 'Please request money less than or equal to what you have in your wallet balance' });
    }
});
router.post('/sendOtp', async (req, res, next) => {
    const response = await emailer_1.emailer.sendOtp(req === null || req === void 0 ? void 0 : req.body);
    return res.send({ response });
});
router.post('/verifyOtp', async (req, res, next) => {
    const response = await emailer_1.emailer.verfiyOtp(req === null || req === void 0 ? void 0 : req.body);
    return res.send({ response });
});
router.post('/sendEmail', async (req, res, next) => {
    const response = await emailer_1.emailer.sendEmails(req.body);
    return res.send({ response });
});
router.post('/makePayment', async (req, res, next) => {
    const response = await payment_1.payment(req.body.amount);
    return res.send({ response });
});
router.post('/uploadFiles', upload.single('myFile'), async (req, res, next) => {
    var _a;
    if (!((_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.location)) {
        return res.send({ success: false, msg: 'result failed succesfully', data: null });
    }
    res.send({ success: true, msg: 'result uploaded succesfully', data: req.file.location });
});
router.post('/login/google/token', fileUploader_1.default('google-token'), async (req, res, next) => {
    res.send({ success: true, data: req.user, msg: 'success' });
});
router.post('/uploadTestList', uploadFile.single('myFile'), async (req, res, next) => {
    const csvtojson = require("csvtojson");
    let path = __dirname + "/uploads/" + req.file.filename;
    const jsonArray = await csvtojson().fromFile(path);
    console.log("jsonArray", jsonArray);
    for (let index = 0; index < jsonArray.length; index++) {
        const element = jsonArray[index];
        const testList = new test_list_model_1.TestList(Object.assign({}, element));
        await testList.save();
    }
    return res.send({ success: true, msg: 'saved test success' });
});
router.post('/uploadTestData', uploadFile.single('myFile'), async (req, res, next) => {
    const csvtojson = require("csvtojson");
    let path = __dirname + "/uploads/" + req.file.filename;
    const jsonArray = await csvtojson().fromFile(path);
    console.log("jsonArray", jsonArray);
    for (let index = 0; index < jsonArray.length; index++) {
        const element = jsonArray[index];
        const testListName = await test_list_model_1.TestList.find({ testName: element.testName });
        delete element.testName;
        for (let innerIndex = 0; innerIndex < testListName.length; innerIndex++) {
            const newElem = testListName[innerIndex];
            if (testListName) {
                element.options = [];
                element.options.push(element['options/0']);
                element.options.push(element['options/1']);
                element.options.push(element['options/2']);
                element.options.push(element['options/3']);
                element.testId = newElem._id;
                const testData = new test_data_model_1.TestData(Object.assign({}, element));
                await testData.save();
            }
        }
    }
    return res.send({ success: true, msg: 'saved test success' });
});
exports.UsersRoutes = router;
//# sourceMappingURL=users-routes.js.map