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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bodyParser = __importStar(require("body-parser"));
const routes_1 = require("./routes");
const error_handling_1 = require("./utilities/error-handling");
const express_session_1 = __importDefault(require("express-session"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const secrets_1 = require("./utilities/secrets");
const cors_1 = __importDefault(require("cors"));
require("./database"); // initialize database
require("./utilities/passport");
const app = express_1.default();
app.use(helmet_1.default());
app.use(compression_1.default());
app.use(bodyParser.json());
app.use(express_session_1.default({
    secret: secrets_1.SESSION_SECRET,
    cookie: {
        maxAge: 60000
    },
    resave: false,
    saveUninitialized: false
}));
app.options('*', cors_1.default());
app.use(cors_1.default({
    origin: "*",
}));
app.use('/api', routes_1.MainRouter);
error_handling_1.loadErrorHandlers(app);
exports.default = app;
//# sourceMappingURL=app.js.map