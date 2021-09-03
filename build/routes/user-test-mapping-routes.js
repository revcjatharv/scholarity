"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTestMappingRoutes = void 0;
const express_1 = require("express");
const user_test_mapping_model_1 = require("../database/models/user-test-mapping.model");
const router = express_1.Router();
router.post('/getTestByUserEmail', async (req, res, next) => {
    const { limit = 100, skip = 0, userId } = req === null || req === void 0 ? void 0 : req.body;
    const user = await user_test_mapping_model_1.UserTest
        .find({ userId }).limit(limit).skip(skip).populate('userId').populate('testId');
    const testCount = await user_test_mapping_model_1.UserTest.count({ userId }).exec();
    return res.send({ user, testCount });
});
router.post('/getUserByTestId', async (req, res, next) => {
    const { limit = 100, skip = 0, testId } = req === null || req === void 0 ? void 0 : req.body;
    const user = await user_test_mapping_model_1.UserTest
        .find({ testId }).limit(limit).skip(skip).populate('userId').populate('testId');
    const userCount = await user_test_mapping_model_1.UserTest.count({ testId }).exec();
    return res.send({ user, userCount });
});
router.post('/', (req, res, next) => {
    let userTest = {};
    const { userId = '', testId = '' } = req === null || req === void 0 ? void 0 : req.body;
    userTest.userId = userId;
    userTest.testId = testId;
    console.log("userTest", userTest);
    user_test_mapping_model_1.UserTest.findOneAndUpdate({ testId, userId }, userTest, { upsert: true }).then(response => {
        if (response) {
            return res.send({ status: false, msg: 'User has already registred with test.' });
        }
        res.send({ status: true, msg: 'Registred for the test succssefully' });
    }).catch(next);
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
router.post('/getWinner', async (req, res, next) => {
    const { testId } = req === null || req === void 0 ? void 0 : req.body;
    const getUserTestData = await user_test_mapping_model_1.UserTest.find({ testId }).populate('userId').populate('testId').sort({ totalMarks: 'desc' }).limit(10);
    const winnerUser = getUserTestData[0].userId;
    // update all user balance after this
    return res.send({ getUserTestData });
});
exports.UserTestMappingRoutes = router;
//# sourceMappingURL=user-test-mapping-routes.js.map