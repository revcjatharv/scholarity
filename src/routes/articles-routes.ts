import { Request, Response, Router } from 'express';
import { Article } from "../database/models/article.model";
import { Feedback } from "../database/models/feedback.model";

const router: Router = Router();

router.get('/', function (req: Request, res: Response, next) {
  let query: any = {};

  let limit = 20;
  let offset = 0;

  if (typeof req.query.limit !== 'undefined') {
    limit = parseInt(req.query.limit as string);
  }

  if (typeof req.query.offset !== 'undefined') {
    offset = parseInt(req.query.offset as string);
  }

  if (typeof req.query.type !== 'undefined') {
    query = { type: req.query.type }
  }

  return Promise.all([
    Article.find({ ...query })
      .limit(Number(limit))
      .skip(Number(offset))
      .sort({ createdAt: 'desc' })
      .exec(),
    Article.count({ ...query }).exec(),
  ]).then(function (results) {
    const articles = results[0];
    const articlesCount = results[1];
    return res.json({
      articles: articles.map(function (article) {
        return article.toJSONFor();
      }),
      articlesCount: articlesCount
    });
  }).catch(next);
})

router.get('/getArticleType', async function (req: Request, res: Response, next) {
  const types = await Article.distinct('type');
  const HOME_PAGE = types.indexOf('HOME_PAGE');
  if (HOME_PAGE > -1) {
    types.splice(HOME_PAGE, 1);
  }

  const WALLET = types.indexOf('WALLET');
  if (WALLET > -1) {
    types.splice(WALLET, 1);
  }
  return res.send({ types })

})

router.post('/feedback', async (req: Request, res: Response, next) => {
  const { userId, subject, body, star, type, question, answer, alternateEmail } = req.body
  const feedback = new Feedback({
    userId, subject, body, star, type, question, answer, alternateEmail
  })
  const savedFeedback = await feedback.save();
  return res.status(200).send({ savedFeedback })
})

router.get('/feedback', function (req: Request, res: Response, next) {
  let query: any = {};
  let limit = 20;
  let offset = 0;

  if (typeof req.query.limit !== 'undefined') {
    limit = parseInt(req.query.limit as string);
  }

  if (typeof req.query.offset !== 'undefined') {
    offset = parseInt(req.query.offset as string);
  }

  if (typeof req.query.type !== 'undefined') {
    query = { type: req.query.type }
  }

  if (typeof req.query.userId !== 'undefined') {
    query = { userId: req.query.userId, ...query }
  }

  return Promise.all([
    Feedback.find({ ...query })
      .limit(Number(limit))
      .skip(Number(offset))
      .sort({ createdAt: 'asc' })
      .exec(),
    Feedback.count({ ...query }).exec(),
  ]).then(function (results) {
    const feebacks = results[0];
    const feedbacksCount = results[1];
    return res.json({
      articles: feebacks.map(function (feeback) {
        return feeback.toJSONFor();
      }),
      feedbacksCount: feedbacksCount
    });
  }).catch(next);
})

router.post('/docs', function (req: Request, res: Response, next){
  const {type} = req.body;
  let url = ''
  if(type === 'refund') {
    url = 'https://scholaritynew.s3.ap-south-1.amazonaws.com/5_6217249440550356178.html'
  } else if(type === 'tnc'){
    url = 'https://scholaritynew.s3.ap-south-1.amazonaws.com/5_6217249440550356177.html'
  } else if (type=== 'privacy'){
    url = 'https://scholaritynew.s3.ap-south-1.amazonaws.com/Privacy%2BPolicy+(1).pdf'
  }
  return res.send({success: true, data:{url}})
})

router.post('/', function (req: Request, res: Response, next) {
  const article = new Article(req.body.article);
  return article.save().then(function () {
    return res.json({ article: article.toJSONFor() });
  });
});
// return a article
// router.get('/:article', authentication.optional, function (req: Request, res: Response, next) {
//   Promise.all([
//     req.payload ? User.findById(req.payload.id) : null,
//     req.article.populate('author').execPopulate()
//   ]).then(function (results) {
//     const user = results[0];

//     return res.json({article: req.article.toJSONFor(user)});
//   }).catch(next);
// });

// // update article
// router.put('/:article', authentication.required, function (req: Request, res: Response, next) {
//   User.findById(req.payload.id).then(function (user) {
//     if (req.article.author._id.toString() === req.payload.id.toString()) {
//       if (typeof req.body.article.title !== 'undefined') {
//         req.article.title = req.body.article.title;
//       }

//       if (typeof req.body.article.description !== 'undefined') {
//         req.article.description = req.body.article.description;
//       }

//       if (typeof req.body.article.body !== 'undefined') {
//         req.article.body = req.body.article.body;
//       }

//       if (typeof req.body.article.tagList !== 'undefined') {
//         req.article.tagList = req.body.article.tagList
//       }

//       req.article.save().then(function (article) {
//         return res.json({article: article.toJSONFor(user)});
//       }).catch(next);
//     } else {
//       return res.sendStatus(403);
//     }
//   });
// });

// // delete article
// router.delete('/:article', authentication.required, function (req: Request, res: Response, next) {
//   User.findById(req.payload.id).then(function (user) {
//     if (!user) {
//       return res.sendStatus(401);
//     }

//     if (req.article.author._id.toString() === req.payload.id.toString()) {
//       return req.article.remove().then(function () {
//         return res.sendStatus(204);
//       });
//     } else {
//       return res.sendStatus(403);
//     }
//   }).catch(next);
// });

// // Favorite an article
// router.post('/:article/favorite', authentication.required, function (req: Request, res: Response, next) {
//   const articleId = req.article._id;

//   User.findById(req.payload.id).then(function (user) {
//     if (!user) {
//       return res.sendStatus(401);
//     }

//     return user.favorite(articleId).then(function () {
//       return req.article.updateFavoriteCount().then(function (article) {
//         return res.json({article: article.toJSONFor(user)});
//       });
//     });
//   }).catch(next);
// });

// // Unfavorite an article
// router.delete('/:article/favorite', authentication.required, function (req: Request, res: Response, next) {
//   const articleId = req.article._id;

//   User.findById(req.payload.id).then(function (user) {
//     if (!user) {
//       return res.sendStatus(401);
//     }

//     return user.unfavorite(articleId).then(function () {
//       return req.article.updateFavoriteCount().then(function (article) {
//         return res.json({article: article.toJSONFor(user)});
//       });
//     });
//   }).catch(next);
// });

// // return an article's comments
// router.get('/:article/comments', authentication.optional, function (req: Request, res: Response, next) {
//   Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function (user) {
//     return req.article.populate({
//       path    : 'comments',
//       populate: {
//         path: 'author'
//       },
//       options : {
//         sort: {
//           createdAt: 'desc'
//         }
//       }
//     }).execPopulate().then(function (article) {
//       return res.json({
//         comments: req.article.comments.map(function (comment) {
//           return comment.toJSONFor(user);
//         })
//       });
//     });
//   }).catch(next);
// });

// // create a new comment
// router.post('/:article/comments', authentication.required, function (req: Request, res: Response, next) {
//   User.findById(req.payload.id)
//     // @ts-ignore
//     .then(function (user) {
//       if (!user) {
//         return res.sendStatus(401);
//       }

//       const comment     = new Comment(req.body.comment);
//       comment.article = req.article;
//       comment.author  = user;

//       return comment.save().then(function () {
//         req.article.comments.push(comment);

//         return req.article.save().then(function (article) {
//           res.json({comment: comment.toJSONFor(user)});
//         });
//       });
//     }).catch(next);
// });

// router.delete('/:article/comments/:comment', authentication.required, function (req: Request, res: Response, next) {
//   if (req.comment.author.toString() === req.payload.id.toString()) {
//     // @ts-ignore
//     req.article.comments.remove(req.comment._id);
//     req.article.save()
//       .then(() => Comment.find({_id: req.comment._id}).remove().exec())
//       .then(function () {
//         res.sendStatus(204);
//       });
//   } else {
//     res.sendStatus(403);
//   }
// });


export const ArticlesRoutes: Router = router;
