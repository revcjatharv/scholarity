"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utilities/logger"));
// Build the connection string
const dbURI = `mongodb://3.7.252.202:27017/scholarity`;
const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    autoIndex: true,
    poolSize: 10,
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
};
logger_1.default.debug(dbURI);
// Create the database connection
mongoose_1.default
    .connect(dbURI, options)
    .then(() => {
    logger_1.default.info('Mongoose connection done');
})
    .catch((e) => {
    logger_1.default.info('Mongoose connection error');
    logger_1.default.error(e);
});
// CONNECTION EVENTS
// When successfully connected
mongoose_1.default.connection.on('connected', () => {
    logger_1.default.info('Mongoose default connection open to ' + dbURI);
});
// If the connection throws an error
mongoose_1.default.connection.on('error', (err) => {
    logger_1.default.error('Mongoose default connection error: ' + err);
});
// When the connection is disconnected
mongoose_1.default.connection.on('disconnected', () => {
    logger_1.default.info('Mongoose default connection disconnected');
});
// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
    mongoose_1.default.connection.close(() => {
        logger_1.default.info('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map