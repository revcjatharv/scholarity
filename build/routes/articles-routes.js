"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesRoutes = void 0;
const express_1 = require("express");
const authentication_1 = require("../utilities/authentication");
const user_model_1 = require("../database/models/user.model");
const article_model_1 = require("../database/models/article.model");
const comment_model_1 = require("../database/models/comment.model");
const router = express_1.Router();
// Preload article objects on routes with ':article'
router.param('article', function (req, res, next, slug) {
    article_model_1.Article.findOne({ slug: slug })
        .populate('author')
        .then(function (article) {
        if (!article) {
            return res.sendStatus(404);
        }
        req.article = article;
        return next();
    }).catch(next);
});
router.param('comment', function (req, res, next, id) {
    comment_model_1.Comment.findById(id).then(function (comment) {
        if (!comment) {
            return res.sendStatus(404);
        }
        req.comment = comment;
        return next();
    }).catch(next);
});
router.get('/', authentication_1.authentication.optional, function (req, res, next) {
    const query = {};
    let limit = 20;
    let offset = 0;
    if (typeof req.query.limit !== 'undefined') {
        limit = parseInt(req.query.limit);
    }
    if (typeof req.query.offset !== 'undefined') {
        offset = parseInt(req.query.offset);
    }
    if (typeof req.query.tag !== 'undefined') {
        query.tagList = { "$in": [req.query.tag] };
    }
    Promise.all([
        req.query.author ? user_model_1.User.findOne({ username: req.query.author }) : null,
        req.query.favorited ? user_model_1.User.findOne({ username: req.query.favorited }) : null
    ]).then(function (results) {
        const author = results[0];
        const favoriter = results[1];
        if (author) {
            query.author = author._id;
        }
        if (favoriter) {
            query._id = { $in: favoriter.favorites };
        }
        else if (req.query.favorited) {
            query._id = { $in: [] };
        }
        return Promise.all([
            article_model_1.Article.find(query)
                .limit(Number(limit))
                .skip(Number(offset))
                .sort({ createdAt: 'desc' })
                .populate('author')
                .exec(),
            article_model_1.Article.count(query).exec(),
            req.payload ? user_model_1.User.findById(req.payload.id) : null,
        ]).then(function (results) {
            const articles = results[0];
            const articlesCount = results[1];
            const user = results[2];
            return res.json({
                articles: articles.map(function (article) {
                    return article.toJSONFor(user);
                }),
                articlesCount: articlesCount
            });
        });
    }).catch(next);
});
router.get('/feed', authentication_1.authentication.required, function (req, res, next) {
    let limit = 20;
    let offset = 0;
    if (typeof req.query.limit !== 'undefined') {
        limit = parseInt(req.query.limit);
    }
    if (typeof req.query.offset !== 'undefined') {
        offset = parseInt(req.query.offset);
    }
    user_model_1.User.findById(req.payload.id).then(function (user) {
        if (!user) {
            return res.sendStatus(401);
        }
        Promise.all([
            article_model_1.Article.find({ author: { $in: user.following } })
                .limit(Number(limit))
                .skip(Number(offset))
                .populate('author')
                .exec(),
            article_model_1.Article.count({ author: { $in: user.following } })
        ]).then(function (results) {
            const articles = results[0];
            const articlesCount = results[1];
            return res.json({
                articles: articles.map(function (article) {
                    return article.toJSONFor(user);
                }),
                articlesCount: articlesCount
            });
        }).catch(next);
    });
});
router.post('/', authentication_1.authentication.required, function (req, res, next) {
    user_model_1.User.findById(req.payload.id).then(function (user) {
        if (!user) {
            return res.sendStatus(401);
        }
        const article = new article_model_1.Article(req.body.article);
        article.author = user;
        return article.save().then(function () {
            console.log(article.author);
            return res.json({ article: article.toJSONFor(user) });
        });
    }).catch(next);
});
// return a article
router.get('/:article', authentication_1.authentication.optional, function (req, res, next) {
    Promise.all([
        req.payload ? user_model_1.User.findById(req.payload.id) : null,
        req.article.populate('author').execPopulate()
    ]).then(function (results) {
        const user = results[0];
        return res.json({ article: req.article.toJSONFor(user) });
    }).catch(next);
});
// update article
router.put('/:article', authentication_1.authentication.required, function (req, res, next) {
    user_model_1.User.findById(req.payload.id).then(function (user) {
        if (req.article.author._id.toString() === req.payload.id.toString()) {
            if (typeof req.body.article.title !== 'undefined') {
                req.article.title = req.body.article.title;
            }
            if (typeof req.body.article.description !== 'undefined') {
                req.article.description = req.body.article.description;
            }
            if (typeof req.body.article.body !== 'undefined') {
                req.article.body = req.body.article.body;
            }
            if (typeof req.body.article.tagList !== 'undefined') {
                req.article.tagList = req.body.article.tagList;
            }
            req.article.save().then(function (article) {
                return res.json({ article: article.toJSONFor(user) });
            }).catch(next);
        }
        else {
            return res.sendStatus(403);
        }
    });
});
// delete article
router.delete('/:article', authentication_1.authentication.required, function (req, res, next) {
    user_model_1.User.findById(req.payload.id).then(function (user) {
        if (!user) {
            return res.sendStatus(401);
        }
        if (req.article.author._id.toString() === req.payload.id.toString()) {
            return req.article.remove().then(function () {
                return res.sendStatus(204);
            });
        }
        else {
            return res.sendStatus(403);
        }
    }).catch(next);
});
// Favorite an article
router.post('/:article/favorite', authentication_1.authentication.required, function (req, res, next) {
    const articleId = req.article._id;
    user_model_1.User.findById(req.payload.id).then(function (user) {
        if (!user) {
            return res.sendStatus(401);
        }
        return user.favorite(articleId).then(function () {
            return req.article.updateFavoriteCount().then(function (article) {
                return res.json({ article: article.toJSONFor(user) });
            });
        });
    }).catch(next);
});
// Unfavorite an article
router.delete('/:article/favorite', authentication_1.authentication.required, function (req, res, next) {
    const articleId = req.article._id;
    user_model_1.User.findById(req.payload.id).then(function (user) {
        if (!user) {
            return res.sendStatus(401);
        }
        return user.unfavorite(articleId).then(function () {
            return req.article.updateFavoriteCount().then(function (article) {
                return res.json({ article: article.toJSONFor(user) });
            });
        });
    }).catch(next);
});
// return an article's comments
router.get('/:article/comments', authentication_1.authentication.optional, function (req, res, next) {
    Promise.resolve(req.payload ? user_model_1.User.findById(req.payload.id) : null).then(function (user) {
        return req.article.populate({
            path: 'comments',
            populate: {
                path: 'author'
            },
            options: {
                sort: {
                    createdAt: 'desc'
                }
            }
        }).execPopulate().then(function (article) {
            return res.json({
                comments: req.article.comments.map(function (comment) {
                    return comment.toJSONFor(user);
                })
            });
        });
    }).catch(next);
});
// create a new comment
router.post('/:article/comments', authentication_1.authentication.required, function (req, res, next) {
    user_model_1.User.findById(req.payload.id)
        // @ts-ignore
        .then(function (user) {
        if (!user) {
            return res.sendStatus(401);
        }
        const comment = new comment_model_1.Comment(req.body.comment);
        comment.article = req.article;
        comment.author = user;
        return comment.save().then(function () {
            req.article.comments.push(comment);
            return req.article.save().then(function (article) {
                res.json({ comment: comment.toJSONFor(user) });
            });
        });
    }).catch(next);
});
router.delete('/:article/comments/:comment', authentication_1.authentication.required, function (req, res, next) {
    if (req.comment.author.toString() === req.payload.id.toString()) {
        // @ts-ignore
        req.article.comments.remove(req.comment._id);
        req.article.save()
            .then(() => comment_model_1.Comment.find({ _id: req.comment._id }).remove().exec())
            .then(function () {
            res.sendStatus(204);
        });
    }
    else {
        res.sendStatus(403);
    }
});
exports.ArticlesRoutes = router;
//# sourceMappingURL=articles-routes.js.map