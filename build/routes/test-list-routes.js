"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestListRoutes = void 0;
const express_1 = require("express");
const test_list_model_1 = require("../database/models/test.list.model");
const router = express_1.Router();
router.get('/', (req, res, next) => {
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toISOString().split('T')[1].split('.')[0];
    test_list_model_1.TestList
        .find({ date, testTime: { '$lt': time } }).then((testList) => {
        res.send({ testList });
    })
        .catch(next);
});
router.post('/', (req, res, next) => {
    const testList = new test_list_model_1.TestList();
    const { date = '', isConducted = false, testName = '', testDescription = '', testTime = '', maxPrize = 0, minPrize = 0, totalQuestions = 0, entryFee = 0 } = req === null || req === void 0 ? void 0 : req.body;
    testList.date = date;
    testList.isConducted = isConducted;
    testList.testName = testName;
    testList.testDescription = testDescription;
    testList.testTime = testTime;
    testList.maxPrize = maxPrize;
    testList.minPrize = minPrize;
    testList.totalQuestions = totalQuestions;
    testList.entryFee = entryFee;
    return testList.save()
        .then(() => {
        return res.json({ user: testList.toAuthJSON() });
    })
        .catch(next);
});
exports.TestListRoutes = router;
//# sourceMappingURL=test-list-routes.js.map