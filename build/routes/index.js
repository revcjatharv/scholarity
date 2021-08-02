"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainRouter = void 0;
const express_1 = require("express");
const tag_routes_1 = require("./tag-routes");
const users_routes_1 = require("./users-routes");
const profiles_routes_1 = require("./profiles-routes");
const articles_routes_1 = require("./articles-routes");
const router = express_1.Router();
router.use('/tags', tag_routes_1.TagRoutes);
router.use('/', users_routes_1.UsersRoutes);
router.use('/profiles', profiles_routes_1.ProfilesRoutes);
router.use('/articles', articles_routes_1.ArticlesRoutes);
exports.MainRouter = router;
//# sourceMappingURL=index.js.map