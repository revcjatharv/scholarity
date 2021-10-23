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
    let testList = await TestList.find({date: {$gte: date}, testType, isConducted: false})
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

router.post('/getFreetest', async (req: Request, res: Response, next: NextFunction) => {
  const list = [
    "timer" : 25.0,
    "testName" : "Free test",
    "testDescription" : "Its a Free UPSC Test",
    "testType" : "UPSC",
    "totalQuestions" : 10.0,
    "entryFee" : 0.0,
    "instruction" : "<ul>Select the option and click the submit button to successfully submit your answer.<ul><br> 30% TDS applicable to all the prizes more ₹10,<ul><br> Prizes are subject to the user agreement and other terms &amp; conditions. Please read them carefully. <ul><br> Amount of Rewards is subject to change if the total seats are not filled before 30 minutes of the test. Users would be notified accordingly.<ul><br> *Terms &amp; Conditions apply",
    "__v" : 0.0,
  ]

  const questionsAndAnswer: any[] = [
    [      {
      "testName": "Free Mock Test",
      "options": ["1  only", "2 only","Both 1 & 2","None"],
      "question": "Which of the following is correct : 1- Animal fat and Resin was used in making paint 2 -Paint brushes were made out of plant fiber",
      "answer": "Both 1 & 2",
      "__v": 0
    },
    {
      "testName": "Free Mock Test",
      "options": ["Hymns and rituals", "Stories of Rig vedic gods", "Charms and Spells", "Hymns of Rigveda"],
      "question": "What did Yajurveda consist?",
      "answer": "Hymns and rituals",
      "__v": 0
    },
    {
      "testName": "Free Mock Test",
      "options": [3, 4, 5, 2],
      "question": "If you want to travel from Thiruvananthapuram to Raipur what is the minimum number of states that you would need to travel from to reach your destination, including your departure and destination states?",
      "answer": 4,
      "__v": 0
    },
    {
      "testName": "Free Mock Test",
      "options": ["1 and 2 only", "2 and 3 only", "1 and 3 only", "1, 2 and 3"],
      "question": "Wirh reference to India's desert national park, which of the following statements are correct? 1.It's spread over 2 districts 2.There is no human habitation inside the park 3. It's one of the natural habitats of the great Indian bustard.",
      "answer": "1 and 3 only",
      "__v": 0
    },
    {
      "testName": "Free Mock Test",
      "options": ["Right against exploitation", "Right to freedom", "Right to constitutional remedies", "Right to equality"],
      "question": "Which one of the following catagories of fundamental rights incorporates protection against untouchability as a form of discrimination?",
      "answer": "Right to equality",
      "__v": 0
    },
    {
      "testName": "Free Mock Test",
      "options": ["the preamble of the constitution", "a directive principle of state policy", "the seventh schedule", "the conventional practice"],
      "question": "In India, separation of judicary from the executive is enjoined by?",
      "answer": "a directive principle of state policy",
      "__v": 0
    },
    {
      "testName": "Free Mock Test",
      "options": ["to reduce it by ? 10,000", "to increase it by ? 10,000", "to increase it by more than 10,000", "to leave it unchanged"],
      "question": "If you withdraw ? 10,000 in cash from your demand deposite account at your bank, the immediate effect on aggregate money supply in the economy will be?",
      "answer": "to leave it unchanged",
      "__v": 0
    },
    {
      "testName": "Free Mock Test",
      "options": ["1 and 2 only", "2 only", "3 and 4 only", "1, 2 and 3"],
      "question": "Consider the following statements: 1The weightage of food in consumer price index (CPI) is higher that wholeasle price index (WPI) 2. The WPI does not capture changes in the prices of services, which CPI does. 3. RBI has now adopted WPI as its key measure of inflation and to decide on changing the key policy rates. Which statement given above is/are correct?",
      "answer": "1 and 2 only",
      "__v": 0
    },
    {
      "testName": "Free Mock Test",
      "options": ["1, 2 and 3 only", "2, 3 and 4 only", "4 and 5 only", "1 and 5 only"],
      "question": "In rural road construction, the use of which of the following is preferred for ensuring environmental sustainibility or to reduce carbon footprint? 1. Copper slag 2. Cold mix asphalt technology 3. Geotextiles 4. Hot mix asphalt technology 5.Portland cement",
      "answer": "1, 2 and 3 only",
      "__v": 0
    },
    {
      "testName": "Free Mock Test",
      "options": ["1 only","2 and 3 only", "3 only","1, 2 and 3"],
      "question": "Consider the following statements: 1.Coal ash contains arsenic, lead and mercury. 2. Coal-fire power plants release sulphur dioxide and oxides of nitrogen into the environment. 3. High ash content is observed in Indian coal. Which of the following statements given above is/are correct?",
      "answer": "1, 2 and 3",
      "__v": 0
    }]
    ]


  return res.send({list,questionsAndAnswer: questionsAndAnswer })
})
  


export const TestListRoutes: Router = router;
