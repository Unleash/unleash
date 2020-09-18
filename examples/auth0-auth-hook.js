/* eslint-disable import/no-extraneous-dependencies */

'use strict';

const passport = require('@passport-next/passport');
const Auth0Strategy = require('passport-auth0').Strategy;

// const  { User, AuthenticationRequired } = require('unleash-server');
const { User, AuthenticationRequired } = require('../lib/server-impl.js');

passport.use(
    new Auth0Strategy(
        {
            domain: process.env.AUTH0_DOMAIN,
            clientID: process.env.AUTH0_CLIENT_ID,
            clientSecret: process.env.AUTH0_CLIENT_SECRET,
            callbackURL:
                process.env.AUTH0_CALLBACK_URL ||
                'http://localhost:4242/api/auth/callback',
        },

        (accessToken, refreshToken, extraParams, profile, done) => {
            done(
                null,
                new User({
                    name: `${profile.givenName} ${profile.familyName}`,
                    email: profile.emails[0].value,
                }),
            );
        },
    ),
);

function enableAuth0auth(app) {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));
    app.get(
        '/api/admin/login',
        passport.authenticate('auth0', { scope: ['openid email profile'] }),
    );

    app.get(
        '/api/auth/callback',
        passport.authenticate('auth0', {
            failureRedirect: '/api/admin/error-login',
        }),
        (req, res) => {
            // Successful authentication, redirect to your app.
            res.redirect('/');
        },
    );

    app.use('/api/admin/', (req, res, next) => {
        if (req.user) {
            return next();
        }
        // Instruct unleash-frontend to pop-up auth dialog
        return res
            .status('401')
            .json(
                new AuthenticationRequired({
                    path: '/api/admin/login',
                    type: 'custom',
                    message: `You have to identify yourself in order to use Unleash. 
                        Click the button and follow the instructions.`,
                }),
            )
            .end();
    });
}

module.exports = enableAuth0auth;
