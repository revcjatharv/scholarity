import { NextFunction, Request, Response, Router } from 'express';
import IUserModel, { User } from '../database/models/user.model';
import passport from 'passport';
import { authentication } from "../utilities/authentication";
import { emailer } from '../utilities/emailer';
import { payment } from '../utilities/payment';

const router: Router = Router();

/**
 * GET /api/user
 */
router.get('/user', authentication.required, (req: Request, res: Response, next: NextFunction) => {

    User
      .findById(req.payload.id)
      .then((user: IUserModel) => {
          res.status(200).json({user: user.toAuthJSON()});
        }
      )
      .catch(next);

  }
);


/**
 * PUT /api/user
 */
router.put('/user', authentication.required, (req: Request, res: Response, next: NextFunction) => {

    User
      .findById(req.body.id)
      .then((user: IUserModel) => {

        if (!user && !user.wallet) {
          return res.sendStatus(401);
        }

        // Update only fields that have values:
        // ISSUE: DRY out code?
        // send the field accountNuumber, bankName, ifsc in additionlData
        if(typeof req.body.user.wallet !== 'undefined') {
          user.wallet = req.body.user.wallet
        }

        return user.save().then(() => {
          return res.json({user: user.toAuthJSON()});
        });
      })
      .catch(next);
  }
);


/**
 * POST /api/users
 */
router.post('/users', (req: Request, res: Response, next: NextFunction) => {

  const user: IUserModel = new User();

  user.username = req.body.user.username;
  user.email    = req.body.user.email;
  user.setPassword(req.body.user.password);
  user.bio   = '';
  user.image = '';
  user.dob =  req?.body?.user?.dob || ''
  user.mobileNumber =  req?.body?.user?.mobileNumber || ''
  user.fullName =  req?.body?.user?.fullName || ''
  user.wallet = req?.body?.user?.wallet || {
    balance: 0,
    currency: 'INR',
    platform: 'RAZORPAY',
    additionalData: {}
  }

  return user.save()
    .then(() => {
      return res.json({user: user.toAuthJSON()});
    })
    .catch(next);

});


// ISSUE: How does this work with the trailing (req, res, next)?
/**
 * POST /api/users/login
 */
router.post('/users/login', (req: Request, res: Response, next: NextFunction) => {

  if (!req.body.user.email) {
    return res.status(422).json({errors: {email: "Can't be blank"}});
  }

  if (!req.body.user.password) {
    return res.status(422).json({errors: {password: "Can't be blank"}});
  }

  passport.authenticate('local', {session: false}, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (user) {
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});

    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);

});

router.post('/requestPrizeMoney', async (req: Request, res: Response, next: NextFunction) => {
  const {balance, userId, accountData}  = req?.body;
  const getUser = await User.findById(userId);
  if(getUser.wallet.balance > balance){
    // send the money to a user by razor pay
    // TBD
    getUser.wallet.balance =getUser.wallet.balance-balance;
    const saveUser =  await getUser.save();
    const updateUser = await User.findOneAndUpdate({_id: userId}, {$set: {'wallet.additionalData': accountData}})
    res.send({status: true, msg:'User saved with new balance', data: {saveUser, updateUser}})
  }else{
    return res.send({status: false, msg: 'Please request money less than or equal to what you have in your wallet balance'})
  }

})

router.post('/sendOtp', async(req: Request, res: Response, next: NextFunction) => {
  const response = await emailer.sendOtp(req?.body);
  return res.send({response})
} )

router.post('/verifyOtp', async(req: Request, res: Response, next: NextFunction) => {
  const response = await emailer.verfiyOtp(req?.body);
  return res.send({response})
} )

router.post('/sendEmail', async (req: Request, res: Response, next: NextFunction) => {
  const response  = await emailer.sendEmails(req.body)
  return res.send({response})
})

router.post('/makePayment', async (req: Request, res: Response, next: NextFunction) => {
  const response  = await payment(req.body.amount)
  return res.send({response})
})


export const UsersRoutes: Router = router;
