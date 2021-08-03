import { NextFunction, Request, Response, Router } from 'express';
import IUserTestModel, { UserTest } from '../database/models/user-test-mapping.model';


const router: Router = Router();


router.post('/getUser', (req: Request, res: Response, next: NextFunction) => {
    const {limit=10,skip=0} = req?.body
    UserTest
      .find().limit(limit).skip(skip).populate('userId').populate('testId').then((UserTest)=>{
          res.send({UserTest})
      })
      .catch(next);
});


router.post('/', (req: Request, res: Response, next: NextFunction) => {

    const userTest: IUserTestModel = new UserTest();
    const {
        userId= '',
        testId= ''
    } = req?.body
    
    userTest.userId = userId
    userTest.testId = testId
  
    return userTest.save()
      .then(() => {
        return res.json({user: userTest.toAuthJSON()});
      })
      .catch(next);
  
  });
  


export const UserTestMappingRoutes: Router = router;
