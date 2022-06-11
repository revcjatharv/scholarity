"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv = require('dotenv');
dotenv.config();
const server = require('http').createServer(app_1.default);
const socket = require('socket.io');
const secrets_1 = require("./utilities/secrets");
const logger_1 = __importDefault(require("./utilities/logger"));
const test_data_model_1 = require("./database/models/test.data.model");
const test_list_model_1 = require("./database/models/test.list.model");
const user_test_mapping_model_1 = require("./database/models/user-test-mapping.model");
const user_model_1 = require("./database/models/user.model");
let activeUsers = {};
server
    .listen(secrets_1.APP_PORT, () => {
    logger_1.default.info(`server running on port : ${secrets_1.APP_PORT}`);
    console.log(`server running on port : ${secrets_1.APP_PORT}`);
})
    .on('error', (e) => logger_1.default.error(e));
const io = socket(server, {
    cors: {
        origin: "*",
    }
});
io.on('connection', (socket) => {
    console.log("Made a socket connection");
    socket.on('joinTest', async (testDetails) => {
        console.log("joined test", testDetails);
        socket.join(testDetails.testId);
    });
    socket.on('activeTestUser', async (testDetails) => {
        console.log("Came in active user", testDetails);
        const { userId, testId } = testDetails;
        if (activeUsers.hasOwnProperty(testId)) {
            activeUsers[testId] = [...activeUsers[testId], userId];
        }
        else {
            activeUsers[testId] = [userId];
        }
        activeUsers[testId] = [...new Set(activeUsers[testId])];
        console.log("activeUsers counts", activeUsers[testId].length);
        io.in(testId).emit('getActiveUser', { totalUser: activeUsers[testId].length, testId });
    });
    socket.on('startTest', async (testDetails) => {
        const { testId } = testDetails;
        console.log("startTest test", testId);
        const testList = await test_list_model_1.TestList.findOneAndUpdate({ _id: testId, isTestStarted: false }, { $set: { isTestStarted: true } });
        console.log("testList", testList);
        if (testList) {
            const testListData = await test_data_model_1.TestData.find({ testId });
            for (let index = 1; index <= testList.totalQuestions; index++) {
                setTimeout(async () => {
                    await test_list_model_1.TestList.findOneAndUpdate({ _id: testId, isConducted: false }, { $set: { isConducted: true } });
                    const findUserTest = await user_test_mapping_model_1.UserTest.find({ testId }).populate('userId').populate('testId').sort({ totalMarks: -1 }).limit(250);
                    for (let index = 0; index < findUserTest.length; index++) {
                        const element = findUserTest[index];
                        const userDetail = element.userId;
                        userDetail.wallet.balance = userDetail.wallet.balance + element.winAmount;
                        await user_model_1.User.updateOne({ _id: userDetail.id }, { $set: { wallet: userDetail.wallet } });
                    }
                }, testList.timer * 1000 * testList.totalQuestions);
                if (index === 1) {
                    console.log({ data: testListData[index - 1], questionNumber: index }, " testListData[index-1]", new Date());
                    io.in(testId).emit('testQuestion', { data: testListData[index - 1], questionNumber: index, liveConnection: 2 });
                }
                else {
                    setTimeout(() => {
                        console.log({ data: testListData[index - 1], questionNumber: index }, " testListData[index-1]", new Date());
                        io.in(testId).emit('testQuestion', { data: testListData[index - 1], questionNumber: index, liveConnection: 2 });
                    }, testList.timer * 1000 * index);
                }
            }
            ;
        }
    });
    socket.on('endTest', async (testDetails) => {
        const { testId } = testDetails;
        const testList = await test_list_model_1.TestList.findOneAndUpdate({ _id: testId, isConducted: false }, { $set: { isConducted: true } });
        console.log("end test hasa been called", testList);
        const testListData = await test_data_model_1.TestData.find({ testId });
        socket.emit('testQuestions', { testListData, testList });
    });
});
io.on('disconnect', () => {
    console.log('Connection closed');
});
//# sourceMappingURL=server.js.map