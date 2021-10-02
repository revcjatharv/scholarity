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
  return res.send({ user, testCount })
});

router.post('/getUserByTestId', async (req: Request, res: Response, next: NextFunction) => {
  const { limit = 100, skip = 0, testId } = req?.body
  const user = await UserTest
    .find({ testId }).limit(limit).skip(skip).populate('userId').populate('testId')

  const userCount = await UserTest.count({ testId }).exec()
  return res.send({ user, userCount })
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

  userTest.userId = userId
  userTest.testId = testId
  const user = await User.findById(userId);
  const test = await TestList.findById(testId)

  if (user && user.wallet && user.wallet.balance >= test.entryFee) {
    user.wallet.balance = user.wallet.balance - test.entryFee
    await user.save()
    console.log("userTest", userTest)
    await UserTest.findOneAndUpdate({ testId, userId }, userTest, { upsert: true }).then(response => {
      if (response) {
        return res.send({ status: false, msg: 'User has already registred with test.' })
      }
      res.send({ status: true, msg: 'Registred for the test succssefully' })
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
          const timeNow = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }).split(',')[1].split(':')
          if (parseInt(timeData[0]) === parseInt(timeNow[0])) {
            // 5 MIN 
            const usersInTest = await UserTest.find().populate('userId').populate('testId');
            if (parseInt(timeData[1]) - parseInt(timeNow[1]) < 5 && parseInt(timeData[1]) - parseInt(timeNow[1]) > 8) {
              for (let k = 0; k < usersInTest.length; k++) {
                const user: any = usersInTest[k];
                // send notification to user and save in notification model
                const message = {
                  notification: {
                    title: "Test Starting Soon",
                    body: "Please be online. Test will be starting soon within 5 minutes"
                  }
                }
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
                      console.log("Cam in 5 min success", response)

                    })
                    .catch((error: any) => {
                      console.log("Cam in 5 min failure", error)

                    });
                }

              }
            }
            // 1 MIN
            if (parseInt(timeData[1]) - parseInt(timeNow[1]) < 1 && parseInt(timeData[1]) - parseInt(timeNow[1]) > 3) {
              for (let k = 0; k < usersInTest.length; k++) {
                const user: any = usersInTest[k];
                // send notification to user and save in notification model
                const message = {
                  notification: {
                    title: "Test Starting Soon",
                    body: "Please be online. Test will be starting soon within a minutes"
                  }
                }
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
    getUserTestData = await UserTest.find({ testId }).populate('userId').populate('testId').sort({ totalMarks: 'asc' }).limit(250);

    for (let i = 0; i < getUserTestData.length; i++) {
      const element = getUserTestData[i];
      const testData: any = element.testId;
      if (testData.testName.indexOf('micro') > -1) {
        if (i === 0) {
          element.winAmount = 1000
        }
        else if (i === 1) {
          element.winAmount = 500
        }
        else if (i === 2) {
          element.winAmount = 250
        }
        else if (i >= 3 && i <= 49) {
          element.winAmount = 45
        }
        else if (i >= 50 && i <= 149) {
          element.winAmount = 25
        }
        else if (i >= 150 && i <= 249) {
          element.winAmount = 15
        } else {
          element.winAmount = 0
        }

      } else if (testData.testName.toLowerCase().indexOf('mini') > -1) {
        if (i === 0) {
          element.winAmount = 2500
        }
        else if (i === 1) {
          element.winAmount = 1000
        }
        else if (i === 2) {
          element.winAmount = 500
        }
        else if (i >= 3 && i <= 49) {
          element.winAmount = 100
        }
        else if (i >= 50 && i <= 149) {
          element.winAmount = 50
        }
        else if (i >= 150 && i <= 249) {
          element.winAmount = 30
        }
        else {
          element.winAmount = 0
        }
      } else if (testData.testName.toLowerCase().indexOf('ultra') > -1) {
        if (i === 0) {
          element.winAmount = 5000
        }
        else if (i === 1) {
          element.winAmount = 2500
        }
        else if (i === 2) {
          element.winAmount = 1000
        }
        else if (i >= 3 && i <= 49) {
          element.winAmount = 250
        }
        else if (i >= 50 && i <= 149) {
          element.winAmount = 100
        }
        else if (i >= 150 && i <= 249) {
          element.winAmount = 75
        }
        else {
          element.winAmount = 0
        }
      } else if (testData.testName.toLowerCase().indexOf('epic') > -1) {
        if (i === 0) {
          element.winAmount = 15000
        }
        else if (i === 1) {
          element.winAmount = 7500
        }
        else if (i === 2) {
          element.winAmount = 5000
        }
        else if (i >= 3 && i <= 49) {
          element.winAmount = 500
        }
        else if (i >= 50 && i <= 149) {
          element.winAmount = 350
        }
        else if (i >= 150 && i <= 249) {
          element.winAmount = 200
        }
        else {
          element.winAmount = 0
        }
      } else if (testData.testName.toLowerCase().indexOf('jumbo') > -1) {
        if (i === 0) {
          element.winAmount = 25000
        }
        else if (i === 1) {
          element.winAmount = 12500
        }
        else if (i === 2) {
          element.winAmount = 7500
        }
        else if (i >= 3 && i <= 49) {
          element.winAmount = 1250
        }
        else if (i >= 50 && i <= 149) {
          element.winAmount = 500
        }
        else if (i >= 150 && i <= 249) {
          element.winAmount = 350
        }
        else {
          element.winAmount = 0
        }
      }
      await element.save()

    }
  }
  if (userId) {
    getUserTestDataPerUser = await UserTest.find({ userId, testId }).populate('userId').populate('testId').sort({ totalMarks: 'asc' }).limit(250);
    for (let i = 0; i < getUserTestDataPerUser.length; i++) {
      const element = getUserTestData[i];
      const testData: any = element.testId;
      if (testData.testName.indexOf('micro') > -1) {
        if (i === 0) {
          element.winAmount = 1000
        }
        else if (i === 1) {
          element.winAmount = 500
        }
        else if (i === 2) {
          element.winAmount = 250
        }
        else if (i >= 3 && i <= 49) {
          element.winAmount = 45
        }
        else if (i >= 50 && i <= 149) {
          element.winAmount = 25
        }
        else if (i >= 150 && i <= 249) {
          element.winAmount = 15
        } else {
          element.winAmount = 0
        }

      } else if (testData.testName.toLowerCase().indexOf('mini') > -1) {
        if (i === 0) {
          element.winAmount = 2500
        }
        else if (i === 1) {
          element.winAmount = 1000
        }
        else if (i === 2) {
          element.winAmount = 500
        }
        else if (i >= 3 && i <= 49) {
          element.winAmount = 100
        }
        else if (i >= 50 && i <= 149) {
          element.winAmount = 50
        }
        else if (i >= 150 && i <= 249) {
          element.winAmount = 30
        }
        else {
          element.winAmount = 0
        }
      } else if (testData.testName.toLowerCase().indexOf('ultra') > -1) {
        if (i === 0) {
          element.winAmount = 5000
        }
        else if (i === 1) {
          element.winAmount = 2500
        }
        else if (i === 2) {
          element.winAmount = 1000
        }
        else if (i >= 3 && i <= 49) {
          element.winAmount = 250
        }
        else if (i >= 50 && i <= 149) {
          element.winAmount = 100
        }
        else if (i >= 150 && i <= 249) {
          element.winAmount = 75
        }
        else {
          element.winAmount = 0
        }
      } else if (testData.testName.toLowerCase().indexOf('epic') > -1) {
        if (i === 0) {
          element.winAmount = 15000
        }
        else if (i === 1) {
          element.winAmount = 7500
        }
        else if (i === 2) {
          element.winAmount = 5000
        }
        else if (i >= 3 && i <= 49) {
          element.winAmount = 500
        }
        else if (i >= 50 && i <= 149) {
          element.winAmount = 350
        }
        else if (i >= 150 && i <= 249) {
          element.winAmount = 200
        }
        else {
          element.winAmount = 0
        }
      } else if (testData.testName.toLowerCase().indexOf('jumbo') > -1) {
        if (i === 0) {
          element.winAmount = 25000
        }
        else if (i === 1) {
          element.winAmount = 12500
        }
        else if (i === 2) {
          element.winAmount = 7500
        }
        else if (i >= 3 && i <= 49) {
          element.winAmount = 1250
        }
        else if (i >= 50 && i <= 149) {
          element.winAmount = 500
        }
        else if (i >= 150 && i <= 249) {
          element.winAmount = 350
        }
        else {
          element.winAmount = 0
        }
      }
      await element.save()
    }
  }
  return res.send({ getUserTestData, getUserTestDataPerUser })
})



export const UserTestMappingRoutes: Router = router;
