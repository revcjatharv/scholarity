"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagRoutes = void 0;
const article_model_1 = require("../database/models/article.model");
const express_1 = require("express");
const router = express_1.Router();
// FIXME: Rewrite to pull from Articles...
router.get('/', (req, res, next) => {
    article_model_1.Article
        .find()
        .distinct('tagList')
        .then((tagsArray) => {
        return res.json({ tags: tagsArray });
    })
        .catch(next);
});
exports.TagRoutes = router;
//# sourceMappingURL=tag-routes.js.map