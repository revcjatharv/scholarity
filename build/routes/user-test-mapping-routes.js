"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTestMappingRoutes = void 0;
const express_1 = require("express");
const user_test_mapping_model_1 = require("../database/models/user-test-mapping.model");
const router = express_1.Router();
router.post('/getUser', (req, res, next) => {
    const { limit = 10, skip = 0 } = req === null || req === void 0 ? void 0 : req.body;
    user_test_mapping_model_1.UserTest
        .find().limit(limit).skip(skip).populate('userId').populate('testId').then((UserTest) => {
        res.send({ UserTest });
    })
        .catch(next);
});
router.post('/', (req, res, next) => {
    const userTest = new user_test_mapping_model_1.UserTest();
    const { userId = '', testId = '' } = req === null || req === void 0 ? void 0 : req.body;
    userTest.userId = userId;
    userTest.testId = testId;
    return userTest.save()
        .then(() => {
        return res.json({ user: userTest.toAuthJSON() });
    })
        .catch(next);
});
exports.UserTestMappingRoutes = router;
//# sourceMappingURL=user-test-mapping-routes.js.map