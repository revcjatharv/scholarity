"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTestMappingRoutes = void 0;
const express_1 = require("express");
const user_model_1 = require("../database/models/user.model");
const user_test_mapping_model_1 = require("../database/models/user-test-mapping.model");
const notification_model_1 = require("../database/models/notification.model");
const test_list_model_1 = require("../database/models/test.list.model");
const firebaseConfig_1 = require("../utilities/firebaseConfig");
const Agenda = require("agenda");
const router = express_1.Router();
router.post('/getTestByUserEmail', async (req, res, next) => {
    const { limit = 100, skip = 0, userId } = req === null || req === void 0 ? void 0 : req.body;
    const user = await user_test_mapping_model_1.UserTest
        .find({ userId }).limit(limit).skip(skip).populate('userId').populate('testId');
    const testCount = await user_test_mapping_model_1.UserTest.count({ userId }).exec();
    return res.send({ user, testCount, maxUserSeat: 1000 });
});
router.post('/getUserByTestId', async (req, res, next) => {
    const { limit = 100, skip = 0, testId } = req === null || req === void 0 ? void 0 : req.body;
    const user = await user_test_mapping_model_1.UserTest
        .find({ testId }).limit(limit).skip(skip).populate('userId').populate('testId');
    const userCount = await user_test_mapping_model_1.UserTest.count({ testId }).exec();
    return res.send({ user, userCount, maxUserSeat: 1000 });
});
router.post('/userTestAvl', async (req, res, next) => {
    const { userId, testId } = req === null || req === void 0 ? void 0 : req.body;
    const user = await user_test_mapping_model_1.UserTest
        .find({ testId, userId }).populate('userId').populate('testId');
    return res.send({ user });
});
router.post('/', async (req, res, next) => {
    let userTest = {};
    const { userId = '', testId = '' } = req === null || req === void 0 ? void 0 : req.body;
    userTest.userId = userId;
    userTest.testId = testId;
    userTest.qARounds = [];
    userTest.totalMarks = 0;
    userTest.winAmount = 0;
    const user = await user_model_1.User.findById(userId);
    const test = await test_list_model_1.TestList.findById(testId);
    let indianDate = new Date().toLocaleString("en-Us", { timeZone: 'Asia/Kolkata' });
    indianDate = indianDate.split(',');
    let date = indianDate[0];
    let time = indianDate[1].split(' ')[1];
    if (user && user.wallet && user.wallet.balance >= test.entryFee) {
        console.log("user is coming here====>", user, "===========", test);
        console.log("userTest", userTest);
        await user_test_mapping_model_1.UserTest.findOneAndUpdate({ testId, userId }, userTest, { upsert: true }).then(async (response) => {
            if (response) {
                return res.send({ status: false, msg: 'User has already registred with test.' });
            }
            user.wallet.balance = user.wallet.balance - test.entryFee;
            await user_model_1.User.updateOne({ _id: userId }, { $set: {
                    wallet: user.wallet
                } });
            return res.send({ status: true, msg: 'Registred for the test succssefully' });
        }).catch(next);
    }
    else {
        res.send({ status: false, msg: 'Balance is low please recharge your account before enrollment' });
    }
});
router.post('/updateUserMarks', async (req, res, next) => {
    const { qARounds, testId, userId } = req === null || req === void 0 ? void 0 : req.body;
    const getUserTestData = await user_test_mapping_model_1.UserTest.findOne({ testId, userId });
    if (qARounds.isAnsCorrect) {
        getUserTestData.totalMarks = getUserTestData.totalMarks + 2;
    }
    else {
        getUserTestData.totalMarks = getUserTestData.totalMarks - 1;
    }
    getUserTestData.qARounds.push(qARounds);
    await getUserTestData.save();
    return res.send({ status: true, msg: 'saved', data: {} });
});
router.post('/sendNotificationToUsersFortest', async (req, res, next) => {
    const mongoConnectionString = 'mongodb://atharv:atharv123@3.7.252.202:27017/scholarity?authSource=admin';
    const agenda = new Agenda({ db: { address: mongoConnectionString } });
    agenda.define('sendNotifications', async () => {
        const date = new Date(new Date().toISOString().split('T')[0]);
        const testList = await test_list_model_1.TestList.find({ date });
        const notification_options = {
            priority: "high",
            timeToLive: 60 * 60 * 24
        };
        if (testList && testList.length > 0) {
            for (let i = 0; i < testList.length; i++) {
                const element = testList[i];
                const timeData = element.testTime.split(':');
                const timeNow = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata', hour12: false }).split(',')[1].split(':');
                console.log("test list time ", timeData);
                console.log("time i see now", timeNow);
                if (parseInt(timeData[0]) === parseInt(timeNow[0])) {
                    console.log(" 0 Came in 5 Min test list ", parseInt(timeData[0]));
                    console.log("0 Cam in 5 min now", parseInt(timeNow[0]));
                    // 5 MIN 
                    const usersInTest = await user_test_mapping_model_1.UserTest.find({ testId: element.id }).populate('userId').populate('testId');
                    if (parseInt(timeData[1]) - parseInt(timeNow[1]) < 5 && parseInt(timeData[1]) - parseInt(timeNow[1]) > 1) {
                        console.log("Came in 5 Min test list ", parseInt(timeData[1]));
                        console.log("Cam in 5 min now", parseInt(timeNow[1]));
                        for (let k = 0; k < usersInTest.length; k++) {
                            const user = usersInTest[k];
                            // send notification to user and save in notification model
                            const message = {
                                notification: {
                                    title: "Test Starting Soon",
                                    body: "Please be online. Test will be starting soon within 5 minutes"
                                }
                            };
                            console.log("user.userId.firebaseToken in 5 min", user.userId.firebaseToken);
                            if (user && user.userId.firebaseToken) {
                                console.log("In Firebase token");
                                firebaseConfig_1.firebaseConfig.admin.messaging().sendToDevice(user.userId.firebaseToken, message, notification_options)
                                    .then(async (response) => {
                                    const notification = new notification_model_1.Notification({
                                        title: message.notification.title,
                                        description: JSON.stringify(message),
                                        body: '',
                                        link: '',
                                        imageLink: '',
                                        userId: user.userId.id || user.userId._id,
                                    });
                                    await notification.save();
                                    console.log("Cam in 5 min success", response);
                                })
                                    .catch((error) => {
                                    console.log("Cam in 5 min failure", error);
                                });
                            }
                        }
                    }
                    // 1 MIN
                    if (parseInt(timeData[1]) - parseInt(timeNow[1]) < 1 && parseInt(timeData[1]) - parseInt(timeNow[1]) > 0) {
                        console.log("Came in 1 Min test list ", parseInt(timeData[1]));
                        console.log("Cam in 1 min now", parseInt(timeNow[1]));
                        for (let k = 0; k < usersInTest.length; k++) {
                            const user = usersInTest[k];
                            // send notification to user and save in notification model
                            const message = {
                                notification: {
                                    title: "Test Starting Soon",
                                    body: "Please be online. Test will be starting soon within a minutes"
                                }
                            };
                            console.log("user.userId.firebaseToken in 1 min", user.userId.firebaseToken);
                            if (user && user.userId.firebaseToken) {
                                firebaseConfig_1.firebaseConfig.admin.messaging().sendToDevice(user.userId.firebaseToken, message, notification_options)
                                    .then(async (response) => {
                                    const notification = new notification_model_1.Notification({
                                        title: message.notification.title,
                                        description: JSON.stringify(message),
                                        body: '',
                                        link: '',
                                        imageLink: '',
                                        userId: user.userId.id || user.userId._id,
                                    });
                                    await notification.save();
                                    console.log("Cam in 1 min success", response);
                                })
                                    .catch((error) => {
                                    console.log("Cam in 1 min errror", error);
                                });
                            }
                        }
                    }
                }
            }
            console.log('notification sent');
        }
        else {
            console.log('No test for today');
        }
    });
    await agenda.start();
    agenda.every('1 minutes', 'sendNotifications');
    return res.send('Cron started');
});
router.post('/deletePastTest', async (req, res, next) => {
    const mongoConnectionString = 'mongodb://atharv:atharv123@3.7.252.202:27017/scholarity?authSource=admin';
    const agenda = new Agenda({ db: { address: mongoConnectionString } });
    agenda.define('deletePastTest', async (job, done) => {
        const date = new Date(new Date().toISOString().split('T')[0]);
        const timeNow = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata', hour12: false }).split(',')[1].split(':');
        const testList = await test_list_model_1.TestList.find({ date });
        for (let index = 0; index < testList.length; index++) {
            const element = testList[index];
            const timeTest = element.testTime.split(':');
            if (timeTest[0] < timeNow[0]) {
                await test_list_model_1.TestList.findOneAndUpdate({ _id: element.id }, { $set: { isConducted: true } });
            }
            if (timeNow[0] === timeTest[0] && timeTest[1] < timeNow[1]) {
                await test_list_model_1.TestList.findOneAndUpdate({ _id: element.id }, { $set: { isConducted: true } });
            }
            if (timeNow[0] === timeTest[0] && timeTest[1] === timeNow[1] && timeTest[2] < timeNow[2]) {
                await test_list_model_1.TestList.findOneAndUpdate({ _id: element.id }, { $set: { isConducted: true } });
            }
        }
        done();
    });
    await agenda.start();
    agenda.every('1 minutes', 'deletePastTest');
    return res.send('Cron started');
});
router.post('/getWinner', async (req, res, next) => {
    const { testId, userId } = req === null || req === void 0 ? void 0 : req.body;
    let getUserTestData;
    let getUserTestDataPerUser = null;
    if (testId) {
        getUserTestData = await user_test_mapping_model_1.UserTest.find({ testId }).populate('userId').populate('testId').sort({ totalMarks: -1 }).limit(250);
        for (let i = 0; i < getUserTestData.length; i++) {
            const element = getUserTestData[i];
            let amount = 0;
            const testData = element.testId;
            if (testData.testName.toLowerCase().indexOf('micro') > -1) {
                if (i === 0) {
                    amount = 1000;
                }
                else if (i === 1) {
                    amount = 500;
                }
                else if (i === 2) {
                    amount = 250;
                }
                else if (i >= 3 && i <= 49) {
                    amount = 45;
                }
                else if (i >= 50 && i <= 149) {
                    amount = 25;
                }
                else if (i >= 150 && i <= 249) {
                    amount = 15;
                }
                else {
                    amount = 0;
                }
            }
            else if (testData.testName.toLowerCase().indexOf('mini') > -1) {
                if (i === 0) {
                    amount = 2500;
                }
                else if (i === 1) {
                    amount = 1000;
                }
                else if (i === 2) {
                    amount = 500;
                }
                else if (i >= 3 && i <= 49) {
                    amount = 100;
                }
                else if (i >= 50 && i <= 149) {
                    amount = 50;
                }
                else if (i >= 150 && i <= 249) {
                    amount = 30;
                }
                else {
                    amount = 0;
                }
            }
            else if (testData.testName.toLowerCase().indexOf('ultra') > -1) {
                if (i === 0) {
                    amount = 5000;
                }
                else if (i === 1) {
                    amount = 2500;
                }
                else if (i === 2) {
                    amount = 1000;
                }
                else if (i >= 3 && i <= 49) {
                    amount = 250;
                }
                else if (i >= 50 && i <= 149) {
                    amount = 100;
                }
                else if (i >= 150 && i <= 249) {
                    amount = 75;
                }
                else {
                    amount = 0;
                }
            }
            else if (testData.testName.toLowerCase().indexOf('epic') > -1) {
                if (i === 0) {
                    amount = 15000;
                }
                else if (i === 1) {
                    amount = 7500;
                }
                else if (i === 2) {
                    amount = 5000;
                }
                else if (i >= 3 && i <= 49) {
                    amount = 500;
                }
                else if (i >= 50 && i <= 149) {
                    amount = 350;
                }
                else if (i >= 150 && i <= 249) {
                    amount = 200;
                }
                else {
                    amount = 0;
                }
            }
            else if (testData.testName.toLowerCase().indexOf('jumbo') > -1) {
                if (i === 0) {
                    amount = 25000;
                }
                else if (i === 1) {
                    amount = 12500;
                }
                else if (i === 2) {
                    amount = 7500;
                }
                else if (i >= 3 && i <= 49) {
                    amount = 1250;
                }
                else if (i >= 50 && i <= 149) {
                    amount = 500;
                }
                else if (i >= 150 && i <= 249) {
                    amount = 350;
                }
                else {
                    amount = 0;
                }
            }
            await user_test_mapping_model_1.UserTest.updateOne({ _id: element._id }, { $set: { winAmount: amount, rank: i + 1 } });
        }
        getUserTestData = await user_test_mapping_model_1.UserTest.find({ testId }).populate('userId').populate('testId').sort({ totalMarks: -1 }).limit(250);
    }
    if (userId) {
        getUserTestDataPerUser = await user_test_mapping_model_1.UserTest.find({ userId, testId }).populate('userId').populate('testId').sort({ totalMarks: -1 }).limit(250);
        for (let i = 0; i < getUserTestDataPerUser.length; i++) {
            const element = getUserTestData[i];
            let amount = 0;
            const testData = element.testId;
            if (testData.testName.toLowerCase().indexOf('micro') > -1) {
                if (i === 0) {
                    amount = 1000;
                }
                else if (i === 1) {
                    amount = 500;
                }
                else if (i === 2) {
                    amount = 250;
                }
                else if (i >= 3 && i <= 49) {
                    amount = 45;
                }
                else if (i >= 50 && i <= 149) {
                    amount = 25;
                }
                else if (i >= 150 && i <= 249) {
                    amount = 15;
                }
                else {
                    amount = 0;
                }
            }
            else if (testData.testName.toLowerCase().indexOf('mini') > -1) {
                if (i === 0) {
                    amount = 2500;
                }
                else if (i === 1) {
                    amount = 1000;
                }
                else if (i === 2) {
                    amount = 500;
                }
                else if (i >= 3 && i <= 49) {
                    amount = 100;
                }
                else if (i >= 50 && i <= 149) {
                    amount = 50;
                }
                else if (i >= 150 && i <= 249) {
                    amount = 30;
                }
                else {
                    amount = 0;
                }
            }
            else if (testData.testName.toLowerCase().indexOf('ultra') > -1) {
                if (i === 0) {
                    amount = 5000;
                }
                else if (i === 1) {
                    amount = 2500;
                }
                else if (i === 2) {
                    amount = 1000;
                }
                else if (i >= 3 && i <= 49) {
                    amount = 250;
                }
                else if (i >= 50 && i <= 149) {
                    amount = 100;
                }
                else if (i >= 150 && i <= 249) {
                    amount = 75;
                }
                else {
                    amount = 0;
                }
            }
            else if (testData.testName.toLowerCase().indexOf('epic') > -1) {
                if (i === 0) {
                    amount = 15000;
                }
                else if (i === 1) {
                    amount = 7500;
                }
                else if (i === 2) {
                    amount = 5000;
                }
                else if (i >= 3 && i <= 49) {
                    amount = 500;
                }
                else if (i >= 50 && i <= 149) {
                    amount = 350;
                }
                else if (i >= 150 && i <= 249) {
                    amount = 200;
                }
                else {
                    amount = 0;
                }
            }
            else if (testData.testName.toLowerCase().indexOf('jumbo') > -1) {
                if (i === 0) {
                    amount = 25000;
                }
                else if (i === 1) {
                    amount = 12500;
                }
                else if (i === 2) {
                    amount = 7500;
                }
                else if (i >= 3 && i <= 49) {
                    amount = 1250;
                }
                else if (i >= 50 && i <= 149) {
                    amount = 500;
                }
                else if (i >= 150 && i <= 249) {
                    amount = 350;
                }
                else {
                    amount = 0;
                }
            }
            await user_test_mapping_model_1.UserTest.updateOne({ _id: element._id }, { $set: { winAmount: amount, rank: i + 1 } });
        }
        getUserTestDataPerUser = await user_test_mapping_model_1.UserTest.find({ userId, testId }).populate('userId').populate('testId').sort({ totalMarks: -1 }).limit(250);
    }
    return res.send({ getUserTestData, getUserTestDataPerUser });
});
exports.UserTestMappingRoutes = router;
//# sourceMappingURL=user-test-mapping-routes.js.map