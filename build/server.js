"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const secrets_1 = require("./utilities/secrets");
const logger_1 = __importDefault(require("./utilities/logger"));
const test_data_model_1 = require("./database/models/test.data.model");
const test_list_model_1 = require("./database/models/test.list.model");
app_1.default
    .listen(secrets_1.APP_PORT, () => {
    logger_1.default.info(`server running on port : ${secrets_1.APP_PORT}`);
    console.log(`server running on port : ${secrets_1.APP_PORT}`);
})
    .on('error', (e) => logger_1.default.error(e));
const io = require('socket.io').listen(app_1.default);
io.sockets.on('connection', (socket) => {
    socket.on('joinTest', async (testDetails) => {
        socket.join(testDetails.testId);
    });
    socket.on('startTest', async (testDetails) => {
        const { testId } = testDetails;
        const testList = await test_list_model_1.TestList.findOne({ testId, isConducted: false });
        const testListData = await test_data_model_1.TestData.find({ testId });
        for (let index = 1; index <= testList.totalQuestions; index++) {
            setTimeout(() => {
                socket.to(testId).emit('testQuestion', testListData[index - 1]);
            }, testList.timer * index);
        }
        ;
    });
    socket.on('endTest', async (testDetails) => {
        const { testId } = testDetails;
        const testList = await test_list_model_1.TestList.findOne({ testId });
        testList.isConducted = true;
        await testList.save();
        const testListData = await test_data_model_1.TestData.find({ testId });
        socket.emit('testQuestions', { testListData, testList });
    });
});
//# sourceMappingURL=server.js.map