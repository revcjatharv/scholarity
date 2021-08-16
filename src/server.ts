import app from './app';
import { APP_PORT } from "./utilities/secrets";
import logger from "./utilities/logger";
import { UserTest } from './database/models/user-test-mapping.model';
import { TestData } from './database/models/test.data.model';
import { TestList } from './database/models/test.list.model';


app
  .listen(APP_PORT, () => {
    logger.info(`server running on port : ${APP_PORT}`);
    console.log(`server running on port : ${APP_PORT}`);
  })
  .on('error', (e) => logger.error(e));

const io = require('socket.io').listen(app);

io.sockets.on('connection', (socket:any)=>{

  socket.on('joinTest', async (testDetails:any)=>{
    socket.join(testDetails.testId);
  })
  socket.on('startTest', async (testDetails:any) => {
    const {testId} = testDetails
    const testList = await TestList.findOne({testId, isConducted: false})
    const testListData = await TestData.find({testId})
    for (let index = 1; index <= testList.totalQuestions; index++) {
        setTimeout(()=>{
          socket.to(testId).emit('testQuestion', testListData[index-1])
        }, testList.timer*index)
    };
  })

  socket.on('endTest', async (testDetails:any) => {
    const {testId} = testDetails
    const testList = await TestList.findOne({testId});
    testList.isConducted = true;
    await testList.save();
    const testListData = await TestData.find({testId})
    socket.emit('testQuestions', {testListData, testList})
  })


})
