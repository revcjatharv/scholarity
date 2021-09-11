import { NextFunction, Request, Response, Router } from 'express';
import { User } from '../database/models/user.model';
import IUserTestModel, { UserTest } from '../database/models/user-test-mapping.model';


const router: Router = Router();


router.post('/getTestByUserEmail', async (req: Request, res: Response, next: NextFunction) => {
    const {limit=100,skip=0,userId} = req?.body
    const user = await UserTest
      .find({userId}).limit(limit).skip(skip).populate('userId').populate('testId')
    const testCount = await UserTest.count({userId}).exec()
    return res.send({user,testCount })
});

router.post('/getUserByTestId', async (req: Request, res: Response, next: NextFunction) => {
  const {limit=100,skip=0,testId} = req?.body
  const user  = await UserTest
    .find({testId}).limit(limit).skip(skip).populate('userId').populate('testId')

  const userCount = await UserTest.count({testId}).exec()
  return res.send({user,userCount })
});

router.post('/userTestAvl', async (req: Request, res: Response, next: NextFunction) => {
  const {userId,testId} = req?.body
  const user  = await UserTest
    .find({testId,userId}).populate('userId').populate('testId')
  return res.send({user })
});

router.post('/', (req: Request, res: Response, next: NextFunction) => {

    let userTest:any = {}
    const {
        userId= '',
        testId= ''
    } = req?.body
    
    userTest.userId = userId
    userTest.testId = testId
    console.log("userTest", userTest)
    UserTest.findOneAndUpdate({testId, userId}, userTest ,{upsert: true}).then(response=>{
      if(response){
        return res.send({status: false, msg: 'User has already registred with test.'})
      }
      res.send({status: true, msg: 'Registred for the test succssefully'})
    }).catch(next);
});

router.post('/updateUserMarks', async (req: Request, res: Response, next: NextFunction) => {
  const {qARounds, testId, userId} = req?.body;
  const getUserTestData:IUserTestModel = await UserTest.findOne({testId, userId});
  if(qARounds.isAnsCorrect){
    getUserTestData.totalMarks = getUserTestData.totalMarks + 2;
  } else {
    getUserTestData.totalMarks = getUserTestData.totalMarks - 1 ;
  } 
  getUserTestData.qARounds.push(qARounds);
  await getUserTestData.save()
  return res.send({status: true, msg: 'saved', data: {}})
})

router.post('/getWinner', async (req: Request, res: Response, next: NextFunction) => {
  const {testId} = req?.body;
  const getUserTestData:IUserTestModel[] = await UserTest.find({testId}).populate('userId').populate('testId').sort({totalMarks: 'desc'}).limit(10);
  const winnerUser = getUserTestData[0].userId
  // update all user balance after this
  return res.send({getUserTestData})
})



export const UserTestMappingRoutes: Router = router;
