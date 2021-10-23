import app from './app';
const dotenv = require('dotenv');
dotenv.config();
const server = require('http').createServer(app);
const socket =  require('socket.io')
import { APP_PORT } from "./utilities/secrets";
import logger from "./utilities/logger";
import { TestData } from './database/models/test.data.model';
import { TestList } from './database/models/test.list.model';
import { UserTest } from './database/models/user-test-mapping.model';
import { User } from './database/models/user.model';
let activeUsers :any = {}

server
  .listen(APP_PORT, () => {
    logger.info(`server running on port : ${APP_PORT}`);
    console.log(`server running on port : ${APP_PORT}`);
  })
  .on('error', (e:any) => logger.error(e));

const io = socket(server, {
  cors:{
    origin: "*",
  }
});

io.on('connection', (socket:any)=>{
  console.log("Made a socket connection")

  socket.on('joinTest', async (testDetails:any)=>{
    console.log("joined test", testDetails)
    socket.join(testDetails.testId);
  })

  socket.on('activeTestUser', async (testDetails:any)=>{
    console.log("Came in active user",testDetails )
    const {userId, testId} = testDetails;
    if(activeUsers.hasOwnProperty(testId)){
      activeUsers[testId] = [...activeUsers[testId], userId]
    }else{
      activeUsers[testId] = [userId]
    }


    activeUsers[testId] = [... new Set(activeUsers[testId])]
    console.log("activeUsers counts",activeUsers[testId].length )

    io.in(testId).emit('getActiveUser', {totalUser: activeUsers[testId].length, testId})
  })


  socket.on('startTest', async (testDetails:any) => {
    const {testId} = testDetails
    console.log("startTest test", testId)

    const testList = await TestList.findOneAndUpdate({_id:testId, isTestStarted: false},{$set:{isTestStarted: true}})
    console.log("testList", testList)
    if(testList){
      const testListData = await TestData.find({testId})
      for (let index = 1; index <= testList.totalQuestions; index++) {
        setTimeout(async () => {
          await TestList.findOneAndUpdate({_id:testId, isConducted: false},{$set:{isConducted: true}})
          const findUserTest = await UserTest.find({ testId }).populate('userId').populate('testId').sort({ totalMarks: -1 }).limit(250);
          for (let index = 0; index < findUserTest.length; index++) {
            const element = findUserTest[index];
            const userDetail:any = element.userId
            userDetail.wallet.balance = userDetail.wallet.balance+element.winAmount
            await User.updateOne({_id: userDetail.id}, {$set: {wallet: userDetail.wallet}})
          }
        }, testList.timer*1000*testList.totalQuestions);
        if(index===1){
          console.log( {data: testListData[index-1], questionNumber: index}, " testListData[index-1]", new Date())
          io.in(testId).emit('testQuestion', {data: testListData[index-1], questionNumber: index, liveConnection: 2});
        } else {
          setTimeout(()=>{
            console.log( {data: testListData[index-1], questionNumber: index}, " testListData[index-1]", new Date())
          io.in(testId).emit('testQuestion', {data: testListData[index-1], questionNumber: index, liveConnection: 2});
          }, testList.timer*1000*index)
        }
  
      };
    }
  })

  socket.on('endTest', async (testDetails:any) => {
    const {testId} = testDetails
    const testList = await TestList.findOneAndUpdate({_id:testId, isConducted: false},{$set:{isConducted: true}})
    console.log("end test hasa been called",testList)
    const testListData = await TestData.find({testId})
    socket.emit('testQuestions', {testListData, testList})
  })
  
})
io.on('disconnect',()=>{
  console.log('Connection closed')
})
