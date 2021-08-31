---
id: sso-google
title: SSO - Google (deprecated)
---

> Single Sign-on via the Google Authenticator provider is deprecated. We recommend using [OpenId Connect](./sso-open-id-connect.md) instead. 

## Introduction {#introduction}

In this guide we will do a deep dive on the Single-Sign-On (SSO) integrations. Unleash Enterprise supports SAML 2.0, OpenID Connect and Google Authentication. In addition, Unleash Enterprise also supports username/password authentication out of the box, as you get with all the other versions of Unleash.

## Step 3c: Google Authentication {#step-3c-google-authentication}

**Step 1: Setup Google OAuth 2.0 Credentials** Go to https://console.developers.google.com/apis/credentials

1. Click “Create credentials“
2. Choose “Oauth Client Id”
3. Choose Application Type: web application
4. Add https://[unleash.hostname.com]/auth/google/callback as an authorized redirect URI.

You will then get a Client ID and a Client Secret that you will need in the next step.

![Google OAuth: Secret](/img/sso-google-secret.png)

**Step 2: Configure Unleash**

Login to Unleash (admin/admin) and navigate to Admin -> Authentication -> Google.

First insert the Client Id and Client Secret from step 1.

You must also specify the hostname Unleash is running on. If Unleash is running on localhost you should specify the port as well (localhost:4242).

If you want to allow everyone to access Unleash, and have Unleash auto-create users you can enable this option. You should then also specify which email domains you want to allow logging in to Unleash.

Remember to click “Save” to store your settings.

![Google OAuth: Secret](/img/google_auth_settings.png)

## Step 4: Verify {#step-4-verify}

Logout of Unleash and sign back in again. You should now be presented with the “SSO Authentication Option”. Click the button and follow the sign-in flow. If all goes well you should be successfully signed in to Unleash. If something is not working you can still sign-in with username and password.

![Verify SSO](/img/sign-in.png)
