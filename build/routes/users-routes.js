"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRoutes = void 0;
const express_1 = require("express");
const user_model_1 = require("../database/models/user.model");
const passport_1 = __importDefault(require("passport"));
const authentication_1 = require("../utilities/authentication");
const emailer_1 = require("../utilities/emailer");
// import { firebaseConfig } from "../utilities/firebaseConfig";
const payment_1 = require("../utilities/payment");
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
        var _a, _b;
        console.log("User====", user);
        if (!user) {
            return res.sendStatus(401);
        }
        // Update only fields that have values:
        // ISSUE: DRY out code?
        // send the field accountNuumber, bankName, ifsc in additionlData
        if (typeof ((_b = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.wallet) !== 'undefined') {
            user.wallet = req.body.user.wallet;
            return user.save().then(() => {
                return res.json({ user: user.toAuthJSON() });
            });
        }
    })
        .catch(next);
});
/**
 * POST /api/users
 */
router.post('/users', (req, res, next) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const user = new user_model_1.User();
    user.username = req.body.user.username;
    user.email = req.body.user.email;
    user.setPassword(req.body.user.password);
    user.bio = '';
    user.image = '';
    user.dob = ((_b = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.dob) || '';
    user.mobileNumber = ((_d = (_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.mobileNumber) || '';
    user.fullName = ((_f = (_e = req === null || req === void 0 ? void 0 : req.body) === null || _e === void 0 ? void 0 : _e.user) === null || _f === void 0 ? void 0 : _f.fullName) || '';
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
            return res.send('User not found with this identity');
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
// router.post('/sendNotificationPush', (req:Request, res: Response, next: NextFunction)=> {
//   const notification_options = {
//     priority: "high",
//     timeToLive: 60 * 60 * 24
//   };
//   // Message format 
//   // notification: {
//   //   title: enter_subject_of_notification_here,
//   //   body: enter_message_here
//   //       }
//   const {registrationToken, message } = req?.body
//   firebaseConfig.admin.messaging().sendToDevice(registrationToken, message, notification_options)
//   .then( (response:any) => {
//    res.status(200).send("Notification sent successfully")
//   })
//   .catch( (error:any) => {
//       res.status(400).send('Failed to send user notification')
//   });
// })
// ISSUE: How does this work with the trailing (req, res, next)?
/**
 * POST /api/users/login
 */
router.post('/users/login', (req, res, next) => {
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
router.post('/requestPrizeMoney', async (req, res, next) => {
    const { balance, userId, accountData } = req === null || req === void 0 ? void 0 : req.body;
    const getUser = await user_model_1.User.findById(userId);
    if (getUser.wallet.balance > balance) {
        // send the money to a user by razor pay
        // TBD
        getUser.wallet.balance = getUser.wallet.balance - balance;
        const saveUser = await getUser.save();
        const updateUser = await user_model_1.User.findOneAndUpdate({ _id: userId }, { $set: { 'wallet.additionalData': accountData } });
        res.send({ status: true, msg: 'User saved with new balance', data: { saveUser, updateUser } });
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
exports.UsersRoutes = router;
//# sourceMappingURL=users-routes.js.map