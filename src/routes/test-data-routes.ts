
import { NextFunction, Request, Response, Router } from 'express';
import { authentication } from '../utilities/authentication';
import ITestDataModel, { TestData } from '../database/models/test.data.model';


const router: Router = Router();


router.post('/testDataById', (req: Request, res: Response, next: NextFunction) => {
    const {testId} = req?.body
    TestData
      .find({testId}).populate('testId').then((tesData)=>{
          res.send({tesData})
      })
      .catch(next);
});


router.post('/', (req: Request, res: Response, next: NextFunction) => {

    const testData: ITestDataModel = new TestData();
    const {
        testId = '',
        question= '',
        options = [],
        answer = ''
    } = req?.body
    
    testData.testId = testId
    testData.question = question
    testData.options = options
    testData.answer = answer
  
    return testData.save()
      .then(() => {
        return res.json({user: testData.toAuthJSON()});
      })
      .catch(next);
  
});
  

export const TestDataRoutes: Router = router;