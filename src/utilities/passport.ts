import passport from 'passport';
import { User } from '../database/models/user.model';
import  passportLocal from 'passport-local';
import { Strategy as GoogleTokenStrategy } from 'passport-custom';
import { OAuth2Client } from 'google-auth-library';



async function authenticateFromGoogle(accessToken:any, clientId:any) {
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
      idToken: accessToken,
      audience: clientId
  });
  return ticket.getPayload();
}

const mobileAppGoogleTokenAuthStrategy:any = new GoogleTokenStrategy(
  async function appleSigninTokenAuth(req, done) {
      try {
          const clientId = '';
          const accessToken = ''
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
      } catch (err) {
          return done(err);
      }
  }
);

mobileAppGoogleTokenAuthStrategy.name = 'google-token';

const LocalStrategy = passportLocal.Strategy;


passport.use(new LocalStrategy({

    // Strategy is based on username & password.  Substitute email for username.
    usernameField: 'user[email]',
    passwordField: 'user[password]'
  },

  (email, password, done) => {

    User
      .findOne({email})
      .then(user => {
        if (!user) {
          return done(null, false, {message: 'Incorrect email.'});
        }
        if (!user.validPassword(password)) {
          return done(null, false, {message: 'Incorrect password.'});
        }
        return done(null, user);
      })
      .catch(done);
}));

passport.use(mobileAppGoogleTokenAuthStrategy)
