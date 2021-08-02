import { NextFunction, Request, Response, Router } from 'express';
import { authentication } from '../utilities/authentication';
import ITestModel, { TestList } from '../database/models/test.list.model';


const router: Router = Router();


router.get('/', (req: Request, res: Response, next: NextFunction) => {
    const date = new Date().toISOString().split('T')[0]
    const time = new Date().toISOString().split('T')[1].split('.')[0];
    TestList
      .find({date, testTime:{'$lt': time}}).then((testList)=>{
          res.send({testList})
      })
      .catch(next);
});


router.post('/', (req: Request, res: Response, next: NextFunction) => {

    const testList: ITestModel = new TestList();
    const {
        date= '',
        isConducted= false,
        testName= '',
        testDescription= '',
        testTime= '',
        maxPrize= 0,
        minPrize= 0,
        totalQuestions= 0,
        entryFee= 0
    } = req?.body
    
    testList.date = date;
    testList.isConducted  = isConducted
    testList.testName  = testName
    testList.testDescription = testDescription
    testList.testTime= testTime
    testList.maxPrize = maxPrize
    testList.minPrize=minPrize
    testList.totalQuestions = totalQuestions
    testList.entryFee = entryFee
  
    return testList.save()
      .then(() => {
        return res.json({user: testList.toAuthJSON()});
      })
      .catch(next);
  
  });
  


export const TestListRoutes: Router = router;
