/**
 * OIDC hook for securing an Unleash server
 *
 * The implementation assumes the following environment variables:
 *
 *  - AUTH_APP_ID
 *  - AUTH_APP_SECRET
 *  - AUTH_HOST
 */
require("dotenv").config();
const OpenIDConnectStrategy = require("passport-openidconnect");
const passport = require("passport");

const { AuthenticationRequired } = require("unleash-server");

const { AUTH_APP_ID, AUTH_APP_SECRET, AUTH_HOST, CONTEXT_PATH } = process.env;
const contextPath = CONTEXT_PATH || "";

if (!AUTH_APP_ID || !AUTH_APP_SECRET || !AUTH_HOST) {
  throw new Error("Missing required environment variables for OIDC authentication");
}

function enableOidcOauth(app, config, services) {
  const { baseUriPath } = config.server;
  const { userService } = services;

  passport.use(
    "oidc",
    new OpenIDConnectStrategy(
      {
        issuer: `${AUTH_HOST}/oidc`,
        authorizationURL: `${AUTH_HOST}/oidc/auth`,
        tokenURL: `${AUTH_HOST}/oidc/token`,
        userInfoURL: `${AUTH_HOST}/oidc/me`,
        callbackURL: `${contextPath}/api/auth/callback`,
        clientID: AUTH_APP_ID,
        clientSecret: AUTH_APP_SECRET,
        scope: ["profile", "offline_access", "email"],
      },
      async (_issuer, profile, callback) => {
        const user = await userService.loginUserWithoutPassword(
          profile?.emails?.[0]?.value,
          true,
        );
        callback(null, user);
      },
    ),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  app.get("/api/admin/login", passport.authenticate("oidc"));

  app.get("/api/auth/callback", passport.authenticate("oidc"), (_req, res) => {
    res.redirect(`${contextPath}/`);
  });

  app.use("/api", (req, res, next) => {
    if (req.user) {
      return next();
    }
    // Instruct unleash-frontend to pop-up auth dialog
    return res
      .status(401)
      .json(
        new AuthenticationRequired({
          path: `${contextPath}/api/admin/login`,
          type: "custom",
          message: `You have to identify yourself in order to use Unleash. 
                        Click the button and follow the instructions.`,
        }),
      )
      .end();
  });
}

module.exports = enableOidcOauth;
