"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const server = require('http').createServer(app_1.default);
const socket = require('socket.io');
const secrets_1 = require("./utilities/secrets");
const logger_1 = __importDefault(require("./utilities/logger"));
const test_data_model_1 = require("./database/models/test.data.model");
const test_list_model_1 = require("./database/models/test.list.model");
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
    socket.on('startTest', async (testDetails) => {
        const { testId } = testDetails;
        console.log("startTest test", testId);
        const testList = await test_list_model_1.TestList.findOne({ _id: testId, isConducted: false });
        const testListData = await test_data_model_1.TestData.find({ testId });
        console.log("testList", testList);
        for (let index = 1; index <= testList.totalQuestions; index++) {
            if (index === 1) {
                console.log(testListData[index - 1], " testListData[index-1]", new Date());
                socket.to(testId).emit('testQuestion', testListData[index - 1]);
            }
            else {
                setTimeout(() => {
                    console.log(testListData[index - 1], " testListData[index-1]", new Date());
                    socket.to(testId).emit('testQuestion', testListData[index - 1]);
                }, testList.timer * 1000 * index);
            }
        }
        ;
    });
    socket.on('endTest', async (testDetails) => {
        const { testId } = testDetails;
        const testList = await test_list_model_1.TestList.findOne({ testId });
        testList.isConducted = true;
        await testList.save();
        console.log("end test hasa been called", testList);
        const testListData = await test_data_model_1.TestData.find({ testId });
        socket.emit('testQuestions', { testListData, testList });
    });
});
io.on('disconnect', () => {
    console.log('Connection closed');
});
//# sourceMappingURL=server.js.map