import e, { NextFunction, Request, Response, Router } from 'express';
import { User } from '../database/models/user.model';
import IUserTestModel, { UserTest } from '../database/models/user-test-mapping.model';
import { Notification } from '../database/models/notification.model';
import { TestList } from '../database/models/test.list.model';
import { firebaseConfig } from "../utilities/firebaseConfig";
const Agenda = require("agenda");


const router: Router = Router();


router.post('/getTestByUserEmail', async (req: Request, res: Response, next: NextFunction) => {
  const { limit = 100, skip = 0, userId } = req?.body
  const user = await UserTest
    .find({ userId }).limit(limit).skip(skip).populate('userId').populate('testId')
  const testCount = await UserTest.count({ userId }).exec()
  return res.send({ user, testCount, maxUserSeat: 1000  })
});

router.post('/getUserByTestId', async (req: Request, res: Response, next: NextFunction) => {
  const { limit = 100, skip = 0, testId } = req?.body
  const user = await UserTest
    .find({ testId }).limit(limit).skip(skip).populate('userId').populate('testId')

  const userCount = await UserTest.count({ testId }).exec()
  return res.send({ user, userCount, maxUserSeat: 1000 })
});

router.post('/userTestAvl', async (req: Request, res: Response, next: NextFunction) => {
  const { userId, testId } = req?.body
  const user = await UserTest
    .find({ testId, userId }).populate('userId').populate('testId')
  return res.send({ user })
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {

  let userTest: any = {}
  const {
    userId = '',
    testId = ''
  } = req?.body

  userTest.userId = userId;
  userTest.testId = testId;
  userTest.qARounds = [];
  userTest.totalMarks = 0;
  userTest.winAmount = 0;
  const user = await User.findById(userId);
  const test = await TestList.findById(testId)

  if (user && user.wallet && user.wallet.balance >= test.entryFee) {
    
    console.log("user is coming here====>",user, "===========",test)
    console.log("userTest", userTest)
    await UserTest.findOneAndUpdate({ testId, userId }, userTest, { upsert: true }).then(async (response) => {
      if (response) {
        return res.send({ status: false, msg: 'User has already registred with test.' })
      }
       user.wallet.balance = user.wallet.balance - test.entryFee

      await User.updateOne({_id: userId}, {$set:{
        wallet: user.wallet
      }})
      return res.send({ status: true, msg: 'Registred for the test succssefully' })
    }).catch(next);
  } else {
    res.send({ status: false, msg: 'Balance is low please recharge your account before enrollment' })
  }
});

router.post('/updateUserMarks', async (req: Request, res: Response, next: NextFunction) => {
  const { qARounds, testId, userId } = req?.body;
  const getUserTestData: IUserTestModel = await UserTest.findOne({ testId, userId });
  if (qARounds.isAnsCorrect) {
    getUserTestData.totalMarks = getUserTestData.totalMarks + 2;
  } else {
    getUserTestData.totalMarks = getUserTestData.totalMarks - 1;
  }
  getUserTestData.qARounds.push(qARounds);
  await getUserTestData.save()
  return res.send({ status: true, msg: 'saved', data: {} })
})

router.post('/sendNotificationToUsersFortest', async (req: Request, res: Response, next: NextFunction) => {
  const mongoConnectionString = 'mongodb://atharv:atharv123@3.7.252.202:27017/scholarity?authSource=admin'
  const agenda = new Agenda({ db: { address: mongoConnectionString } });
  agenda.define('sendNotifications',
    async () => {
      const date = new Date(new Date().toISOString().split('T')[0])
      const testList = await TestList.find({ date })
      const notification_options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
      };
      if (testList && testList.length > 0) {
        for (let i = 0; i < testList.length; i++) {
          const element = testList[i];
          const timeData = element.testTime.split(':')
          const timeNow = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata', hour12: false }).split(',')[1].split(':')
          console.log("test list time ",timeData)
          console.log("time i see now", timeNow)
          
          if (parseInt(timeData[0]) === parseInt(timeNow[0])) {
            console.log(" 0 Came in 5 Min test list ",parseInt(timeData[0]))
            console.log("0 Cam in 5 min now", parseInt(timeNow[0]))
            // 5 MIN 
            const usersInTest = await UserTest.find({testId: element.id}).populate('userId').populate('testId');
            if (parseInt(timeData[1]) - parseInt(timeNow[1]) < 5 && parseInt(timeData[1]) - parseInt(timeNow[1]) > 1) {
              console.log("Came in 5 Min test list ",parseInt(timeData[1]))
              console.log("Cam in 5 min now", parseInt(timeNow[1]))
              for (let k = 0; k < usersInTest.length; k++) {
                const user: any = usersInTest[k];
                // send notification to user and save in notification model
                const message = {
                  notification: {
                    title: "Test Starting Soon",
                    body: "Please be online. Test will be starting soon within 5 minutes"
                  }
                }
                console.log("user.userId.firebaseToken in 5 min",user.userId.firebaseToken)
                if (user && user.userId.firebaseToken) {
                  console.log("In Firebase token")
                  firebaseConfig.admin.messaging().sendToDevice(user.userId.firebaseToken, message, notification_options)
                    .then(async (response: any) => {
                      const notification = new Notification({
                        title: message.notification.title,
                        description: JSON.stringify(message),
                        body: '',
                        link: '',
                        imageLink: '',
                        userId: user.userId.id || user.userId._id,
                      })
                      await notification.save()
                      console.log("Cam in 5 min success", response)

                    })
                    .catch((error: any) => {
                      console.log("Cam in 5 min failure", error)

                    });
                }

              }
            }
            // 1 MIN
            if (parseInt(timeData[1]) - parseInt(timeNow[1]) < 1 && parseInt(timeData[1]) - parseInt(timeNow[1]) > 0) {
              console.log("Came in 1 Min test list ",parseInt(timeData[1]))
              console.log("Cam in 1 min now", parseInt(timeNow[1]))
              for (let k = 0; k < usersInTest.length; k++) {
                const user: any = usersInTest[k];
                // send notification to user and save in notification model
                const message = {
                  notification: {
                    title: "Test Starting Soon",
                    body: "Please be online. Test will be starting soon within a minutes"
                  }
                }
                console.log("user.userId.firebaseToken in 1 min",user.userId.firebaseToken)
                if (user && user.userId.firebaseToken) {
                  firebaseConfig.admin.messaging().sendToDevice(user.userId.firebaseToken, message, notification_options)
                    .then(async (response: any) => {
                      const notification = new Notification({
                        title: message.notification.title,
                        description: JSON.stringify(message),
                        body: '',
                        link: '',
                        imageLink: '',
                        userId: user.userId.id || user.userId._id,
                      })
                      await notification.save()
                      console.log("Cam in 1 min success", response)

                    })
                    .catch((error: any) => {
                      console.log("Cam in 1 min errror", error)
                    });
                }

              }
            }

          }
        }

        console.log('notification sent')
      } else {
        console.log('No test for today')
      }
    }
  );
  await agenda.start();
  agenda.every('1 minutes', 'sendNotifications');
  return res.send('Cron started')
})

router.post('/getWinner', async (req: Request, res: Response, next: NextFunction) => {
  const { testId, userId } = req?.body;
  let getUserTestData: IUserTestModel[]
  let getUserTestDataPerUser = null;

  if (testId) {
    getUserTestData = await UserTest.find({ testId }).populate('userId').populate('testId').sort({ totalMarks: -1 }).limit(250);

    for (let i = 0; i < getUserTestData.length; i++) {
      const element = getUserTestData[i];
      let amount = 0;
      console.log("ELEMENT=======>", element)
      const testData: any = element.testId;
      if (testData.testName.toLowerCase().indexOf('micro') > -1) {
        if (i === 0) {
          amount = 1000
        }
        else if (i === 1) {
          amount = 500
        }
        else if (i === 2) {
          amount = 250
        }
        else if (i >= 3 && i <= 49) {
          amount = 45
        }
        else if (i >= 50 && i <= 149) {
          amount = 25
        }
        else if (i >= 150 && i <= 249) {
          amount = 15
        } else {
          amount = 0
        }

      } else if (testData.testName.toLowerCase().indexOf('mini') > -1) {
        if (i === 0) {
          amount = 2500
        }
        else if (i === 1) {
          amount = 1000
        }
        else if (i === 2) {
          amount = 500
        }
        else if (i >= 3 && i <= 49) {
          amount = 100
        }
        else if (i >= 50 && i <= 149) {
          amount = 50
        }
        else if (i >= 150 && i <= 249) {
          amount = 30
        }
        else {
          amount = 0
        }
      } else if (testData.testName.toLowerCase().indexOf('ultra') > -1) {
        if (i === 0) {
          amount = 5000
        }
        else if (i === 1) {
          amount = 2500
        }
        else if (i === 2) {
          amount = 1000
        }
        else if (i >= 3 && i <= 49) {
          amount = 250
        }
        else if (i >= 50 && i <= 149) {
          amount = 100
        }
        else if (i >= 150 && i <= 249) {
          amount = 75
        }
        else {
          amount = 0
        }
      } else if (testData.testName.toLowerCase().indexOf('epic') > -1) {
        if (i === 0) {
          amount = 15000
        }
        else if (i === 1) {
          amount = 7500
        }
        else if (i === 2) {
          amount = 5000
        }
        else if (i >= 3 && i <= 49) {
          amount = 500
        }
        else if (i >= 50 && i <= 149) {
          amount = 350
        }
        else if (i >= 150 && i <= 249) {
          amount = 200
        }
        else {
          amount = 0
        }
      } else if (testData.testName.toLowerCase().indexOf('jumbo') > -1) {
        if (i === 0) {
          amount = 25000
        }
        else if (i === 1) {
          amount = 12500
        }
        else if (i === 2) {
          amount = 7500
        }
        else if (i >= 3 && i <= 49) {
          amount = 1250
        }
        else if (i >= 50 && i <= 149) {
          amount = 500
        }
        else if (i >= 150 && i <= 249) {
          amount = 350
        }
        else {
          amount = 0
        }
      }
      await UserTest.updateOne({_id: element._id}, {$set: {winAmount: amount, rank : i+1}})
      const userDetail:any = element.userId
      userDetail.wallet.balance = userDetail.wallet.balance+amount
      await User.updateOne({_id: element._id}, {$set: {wallet: userDetail.wallet}})
    }
    getUserTestData = await UserTest.find({ testId }).populate('userId').populate('testId').sort({ totalMarks: -1 }).limit(250);

  }
  if (userId) {
    getUserTestDataPerUser = await UserTest.find({ userId, testId }).populate('userId').populate('testId').sort({ totalMarks: -1 }).limit(250);
    for (let i = 0; i < getUserTestDataPerUser.length; i++) {
      const element = getUserTestData[i];
      let amount = 0;
      const testData: any = element.testId;
      if (testData.testName.toLowerCase().indexOf('micro') > -1) {
        if (i === 0) {
          amount = 1000
        }
        else if (i === 1) {
          amount = 500
        }
        else if (i === 2) {
          amount = 250
        }
        else if (i >= 3 && i <= 49) {
          amount = 45
        }
        else if (i >= 50 && i <= 149) {
          amount = 25
        }
        else if (i >= 150 && i <= 249) {
          amount = 15
        } else {
          amount = 0
        }

      } else if (testData.testName.toLowerCase().indexOf('mini') > -1) {
        if (i === 0) {
          amount = 2500
        }
        else if (i === 1) {
          amount = 1000
        }
        else if (i === 2) {
          amount = 500
        }
        else if (i >= 3 && i <= 49) {
          amount = 100
        }
        else if (i >= 50 && i <= 149) {
          amount = 50
        }
        else if (i >= 150 && i <= 249) {
          amount = 30
        }
        else {
          amount = 0
        }
      } else if (testData.testName.toLowerCase().indexOf('ultra') > -1) {
        if (i === 0) {
          amount = 5000
        }
        else if (i === 1) {
          amount = 2500
        }
        else if (i === 2) {
          amount = 1000
        }
        else if (i >= 3 && i <= 49) {
          amount = 250
        }
        else if (i >= 50 && i <= 149) {
          amount = 100
        }
        else if (i >= 150 && i <= 249) {
          amount = 75
        }
        else {
          amount = 0
        }
      } else if (testData.testName.toLowerCase().indexOf('epic') > -1) {
        if (i === 0) {
          amount = 15000
        }
        else if (i === 1) {
          amount = 7500
        }
        else if (i === 2) {
          amount = 5000
        }
        else if (i >= 3 && i <= 49) {
          amount = 500
        }
        else if (i >= 50 && i <= 149) {
          amount = 350
        }
        else if (i >= 150 && i <= 249) {
          amount = 200
        }
        else {
          amount = 0
        }
      } else if (testData.testName.toLowerCase().indexOf('jumbo') > -1) {
        if (i === 0) {
          amount = 25000
        }
        else if (i === 1) {
          amount = 12500
        }
        else if (i === 2) {
          amount = 7500
        }
        else if (i >= 3 && i <= 49) {
          amount = 1250
        }
        else if (i >= 50 && i <= 149) {
          amount = 500
        }
        else if (i >= 150 && i <= 249) {
          amount = 350
        }
        else {
          amount = 0
        }
      }
      await UserTest.updateOne({_id: element._id}, {$set: {winAmount: amount, rank : i+1}})
      const userDetail:any = element.userId
      userDetail.wallet.balance = userDetail.wallet.balance+amount
      await User.updateOne({_id: element._id}, {$set: {wallet: userDetail.wallet}})
    }
    getUserTestDataPerUser = await UserTest.find({ userId, testId }).populate('userId').populate('testId').sort({ totalMarks: -1 }).limit(250);
  }

  return res.send({ getUserTestData, getUserTestDataPerUser })
})



export const UserTestMappingRoutes: Router = router;
