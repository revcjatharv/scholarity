import passport from 'passport';

export default (provider: string | string[] | passport.Strategy) =>
    async function passportMobileAppSocialAuthMiddleware(req: any, res: any, next: any) {
        return passport.authenticate(
            provider,
            {
                scope: ['email', 'user_birthday', 'user_gender']
            },
            async function passportMobileAppSocialAuthCallback(err, user) {
                if (err) {
                    return next(err);
                }
                try {
                    console.log("THIS IS USER", user)
                    req.user = user
                    // carry on to next route to create token
                    return next(null, user);
                } catch (error) {
                    return next(error);
                }
            }
        )(req, res, next);
    };
