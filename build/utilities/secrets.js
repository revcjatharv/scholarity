"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = exports.SESSION_SECRET = exports.JWT_SECRET = exports.LOG_DIRECTORY = exports.APP_PORT = exports.IS_PRODUCTION = exports.ENVIRONMENT = void 0;
const dotenv = __importStar(require("dotenv"));
const _ = __importStar(require("lodash"));
const path = __importStar(require("path"));
dotenv.config({ path: ".env" });
exports.ENVIRONMENT = _.defaultTo(process.env.APP_ENV, "dev");
exports.IS_PRODUCTION = exports.ENVIRONMENT === "production";
exports.APP_PORT = _.defaultTo(parseInt(process.env.APP_PORT), 3000);
exports.LOG_DIRECTORY = _.defaultTo(process.env.LOG_DIRECTORY, path.resolve('logs'));
exports.JWT_SECRET = _.defaultTo(process.env.JWT_SECRET, "secret");
exports.SESSION_SECRET = _.defaultTo(process.env.SESSION_SECRET, "secret");
exports.DB = {
    USER: _.defaultTo(process.env.DB_USER, "root"),
    PASSWORD: _.defaultTo(process.env.DB_USER_PWD, "secret"),
    HOST: _.defaultTo(process.env.DB_HOST, "3.7.252.202"),
    NAME: _.defaultTo(process.env.DB_NAME, "scholarity"),
    PORT: _.defaultTo(parseInt(process.env.DB_PORT), 27017),
};
//# sourceMappingURL=secrets.js.map