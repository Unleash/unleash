'use strict';

/**
 * Keycloak hook for securing an Unleash server
 *
 * This example assumes that all users authenticating via
 * keycloak should have access. You would probably limit access
 * to users you trust.
 *
 * The implementation assumes the following environement variables:
 *
 *  - AUTH_HOST
 *  - AUTH_REALM
 *  - AUTH_CLIENT_ID
 */

// const  { User, AuthenticationRequired } = require('unleash-server');
const { User, AuthenticationRequired } = require('../lib/server-impl.js');


const KeycloakStrategy = require("@exlinc/keycloak-passport");
const passport = require('passport');

const kcConfig = {
    host: "http://" + process.env.AUTH_HOST,
    realm: process.env.AUTH_REALM,
    clientId: process.env.AUTH_CLIENT_ID,
    contextPath: '', // Use when  Unleash is hosted on an url like /unleash/
    clientSecret: "",
};

passport.use(
    "keycloak",
    new KeycloakStrategy(
        {
            host: kcConfig.host,
            realm: kcConfig.realm,
            clientID: kcConfig.clientId,
            clientSecret: "We don't need that, but is required",
            callbackURL: `${kcConfig.contextPath}/api/auth/callback`,
            authorizationURL: `${kcConfig.host}/auth/realms/hamis/protocol/openid-connect/auth`,
            tokenURL: `${kcConfig.host}/auth/realms/hamis/protocol/openid-connect/token`,
            userInfoURL: `${kcConfig.host}/auth/realms/hamis/protocol/openid-connect/userinfo`
        },

        (accessToken, refreshToken, profile, done) => {
            done(
                null,
                new User({
                    name: profile.fullName,
                    email: profile.email,
                })
            );
        }
    )
);

function enableKeycloakOauth(app) {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));
    app.get('/api/admin/login', passport.authenticate('keycloak'));

    app.get('/api/auth/callback', passport.authenticate('keycloak'), (req, res, next) => {
        res.redirect(`${kcConfig.contextPath}/`);
    });

    app.use('/api/admin/', (req, res, next) => {
        if (req.user) {
            next();
        } else {
            // Instruct unleash-frontend to pop-up auth dialog
            return res
                .status('401')
                .json(
                    new AuthenticationRequired({
                        path: `${kcConfig.contextPath}/api/admin/login`,
                        type: 'custom',
                        message: `You have to identify yourself in order to use Unleash. 
                        Click the button and follow the instructions.`,
                    })
                )
                .end();
        }
    });
}

module.exports = enableKeycloakOauth;
