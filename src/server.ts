import app from './app';
const dotenv = require('dotenv');
dotenv.config();
const server = require('http').createServer(app);
const socket =  require('socket.io')
import { APP_PORT } from "./utilities/secrets";
import logger from "./utilities/logger";
import { TestData } from './database/models/test.data.model';
import { TestList } from './database/models/test.list.model';


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
  socket.on('startTest', async (testDetails:any) => {
    const {testId} = testDetails
    console.log("startTest test", testId)

    const testList = await TestList.findOneAndUpdate({_id:testId, isTestStarted: false},{$set:{isTestStarted: true}})
    console.log("testList", testList)
    if(testList){
      const testListData = await TestData.find({testId})
      for (let index = 1; index <= testList.totalQuestions; index++) {
        if(index===1){
          console.log( {data: testListData[index-1], questionNumber: index}, " testListData[index-1]", new Date())
          io.in(testId).emit('testQuestion', {data: testListData[index-1], questionNumber: index});
          // socket.to(testId).broadcast.emit('testQuestion', testListData[index-1])
        } else {
          setTimeout(()=>{
            console.log( {data: testListData[index-1], questionNumber: index}, " testListData[index-1]", new Date())
          io.in(testId).emit('testQuestion', {data: testListData[index-1], questionNumber: index});
            // socket.to(testId).broadcast.emit('testQuestion', testListData[index-1])
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
