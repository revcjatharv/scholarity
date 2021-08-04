"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestDataRoutes = void 0;
const express_1 = require("express");
const test_data_model_1 = require("../database/models/test.data.model");
const router = express_1.Router();
router.post('/testDataById', (req, res, next) => {
    const { testId } = req === null || req === void 0 ? void 0 : req.body;
    test_data_model_1.TestData
        .find({ testId }).populate('testId').then((tesData) => {
        res.send({ tesData });
    })
        .catch(next);
});
router.post('/', (req, res, next) => {
    const testData = new test_data_model_1.TestData();
    const { testId = '', question = '', options = [], answer = '' } = req === null || req === void 0 ? void 0 : req.body;
    testData.testId = testId;
    testData.question = question;
    testData.options = options;
    testData.answer = answer;
    return testData.save()
        .then(() => {
        return res.json({ user: testData.toAuthJSON() });
    })
        .catch(next);
});
exports.TestDataRoutes = router;
//# sourceMappingURL=test-data-routes.js.map