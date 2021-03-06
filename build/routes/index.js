"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainRouter = void 0;
const express_1 = require("express");
const tag_routes_1 = require("./tag-routes");
const users_routes_1 = require("./users-routes");
const profiles_routes_1 = require("./profiles-routes");
const articles_routes_1 = require("./articles-routes");
const test_data_routes_1 = require("./test-data-routes");
const test_list_routes_1 = require("./test-list-routes");
const user_test_mapping_routes_1 = require("./user-test-mapping-routes");
const router = express_1.Router();
const middleware = (req, res, next) => {
    const { headers } = req;
    if (headers && headers.secure && headers.secure === 'ATHARV') {
        return next();
    }
    return res.status(401).json({ staus: false, msg: 'Failed to autheticate API. Please verify once again', data: {} });
};
// router.use(middleware)
router.use('/tags', tag_routes_1.TagRoutes);
router.use('/', users_routes_1.UsersRoutes);
router.use('/mapping', user_test_mapping_routes_1.UserTestMappingRoutes);
router.use('/testData', test_data_routes_1.TestDataRoutes);
router.use('/testList', test_list_routes_1.TestListRoutes);
router.use('/profiles', profiles_routes_1.ProfilesRoutes);
router.use('/articles', articles_routes_1.ArticlesRoutes);
exports.MainRouter = router;
//# sourceMappingURL=index.js.map