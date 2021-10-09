import { NextFunction, Request, Response, Router } from 'express';
import { authentication } from '../utilities/authentication';

import ITestModel, { TestList } from '../database/models/test.list.model';
import { testType } from '../utilities/secrets';
import { UserTest } from '../database/models/user-test-mapping.model';
const router: Router = Router();


router.get('/getTestType', (req: Request, res: Response, next: NextFunction) => {
  res.send({...testType})
})

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const date = new Date(new Date().toISOString().split('T')[0])
    const time = new Date().toISOString().split('T')[1].split('.')[0];
    const { testType, userId }:any = req?.body
    console.log(date,time,testType)
    let testList = await TestList.find({date: {$gte: date}, testType})
    let resultsFromUserEnroll:any = await UserTest
    .find({ userId }).populate('userId').populate('testId');
    const newtestList = []
    for (let i = 0; i < testList.length; i++) {
      const element : any= testList[i];
      const isPresent = resultsFromUserEnroll.find((x:any )=> x && x.testId && x.testId.id === element.id)
      const newElem = {...element._doc}
      newElem.hasEnrolled  = isPresent ? true :false
      newtestList.push(newElem)
    }

    return res.send({status: true, data: newtestList})

});


router.post('/testList', (req: Request, res: Response, next: NextFunction) => {

    const testList: ITestModel = new TestList();
    const {
        date= new Date(),
        isConducted= false,
        isTestStarted=false,
        testName= '',
        testDescription= '',
        testType=  '',
        testTime= '',
        timer= 20000,
        maxPrize= 0,
        minPrize= 0,
        totalQuestions= 0,
        entryFee= 0,
        instruction=''
    } = req?.body
    
    testList.date = new Date(date);
    testList.isConducted  = isConducted
    testList.isTestStarted = isTestStarted
    testList.testName  = testName
    testList.testDescription = testDescription
    testList.testType=testType
    testList.testTime= testTime
    testList.maxPrize = maxPrize
    testList.minPrize=minPrize
    testList.totalQuestions = totalQuestions
    testList.entryFee = entryFee
    testList.timer = timer
    testList.instruction = instruction;
  
    return testList.save()
      .then(() => {
        return res.json({user: testList.toAuthJSON()});
      })
      .catch(next);
  
});
  


export const TestListRoutes: Router = router;
