'use strict';

const unleash = require('unleash-server');
const oidcAuthHook = require('./ogcio/oidc-auth-hook');

const options = {
  authentication: {
    type: "custom",
    customAuthHandler: oidcAuthHook,
  }
};

unleash.start(options);
