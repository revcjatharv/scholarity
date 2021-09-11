"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const user_model_1 = require("../database/models/user.model");
const passport_local_1 = __importDefault(require("passport-local"));
const passport_custom_1 = require("passport-custom");
const google_auth_library_1 = require("google-auth-library");
async function authenticateFromGoogle(accessToken, clientId) {
    const client = new google_auth_library_1.OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
        idToken: accessToken,
        audience: clientId
    });
    return ticket.getPayload();
}
const mobileAppGoogleTokenAuthStrategy = new passport_custom_1.Strategy(async function appleSigninTokenAuth(req, done) {
    try {
        const clientId = '';
        const accessToken = '';
        const accessData = await authenticateFromGoogle(accessToken, clientId);
        const userProfileInfo = {
            firstName: accessData.given_name || null,
            lastName: accessData.family_name || null,
            gender: 'MALE',
            birthDate: '',
            email: accessData.email,
            id: accessData.sub || null,
            accessToken
        };
        return done(null, userProfileInfo);
    }
    catch (err) {
        return done(err);
    }
});
mobileAppGoogleTokenAuthStrategy.name = 'google-token';
const LocalStrategy = passport_local_1.default.Strategy;
passport_1.default.use(new LocalStrategy({
    // Strategy is based on username & password.  Substitute email for username.
    usernameField: 'user[email]',
    passwordField: 'user[password]'
}, (email, password, done) => {
    user_model_1.User
        .findOne({ email })
        .then(user => {
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        if (!user.validPassword(password)) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    })
        .catch(done);
}));
passport_1.default.use(mobileAppGoogleTokenAuthStrategy);
//# sourceMappingURL=passport.js.map