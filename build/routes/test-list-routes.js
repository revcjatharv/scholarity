"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestListRoutes = void 0;
const express_1 = require("express");
const test_list_model_1 = require("../database/models/test.list.model");
const secrets_1 = require("../utilities/secrets");
const router = express_1.Router();
router.get('/getTestType', (req, res, next) => {
    res.send(Object.assign({}, secrets_1.testType));
});
router.post('/', (req, res, next) => {
    const date = new Date(new Date().toISOString().split('T')[0]);
    const time = new Date().toISOString().split('T')[1].split('.')[0];
    const { testType } = req === null || req === void 0 ? void 0 : req.body;
    console.log(date, time, testType);
    test_list_model_1.TestList
        .find({ date: { $gte: date }, testType }).then((testList) => {
        res.send({ testList });
    })
        .catch(next);
});
router.post('/testList', (req, res, next) => {
    const testList = new test_list_model_1.TestList();
    const { date = new Date(), isConducted = false, testName = '', testDescription = '', testType = '', testTime = '', timer = 20000, maxPrize = 0, minPrize = 0, totalQuestions = 0, entryFee = 0, instruction = '' } = req === null || req === void 0 ? void 0 : req.body;
    testList.date = new Date(date);
    testList.isConducted = isConducted;
    testList.testName = testName;
    testList.testDescription = testDescription;
    testList.testType = testType;
    testList.testTime = testTime;
    testList.maxPrize = maxPrize;
    testList.minPrize = minPrize;
    testList.totalQuestions = totalQuestions;
    testList.entryFee = entryFee;
    testList.timer = timer;
    testList.instruction = instruction;
    return testList.save()
        .then(() => {
        return res.json({ user: testList.toAuthJSON() });
    })
        .catch(next);
});
exports.TestListRoutes = router;
//# sourceMappingURL=test-list-routes.js.map