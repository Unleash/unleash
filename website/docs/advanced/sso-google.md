---
id: sso-google
title: '[Deprecated] How to add SSO with Google'
---

> Single Sign-on via the Google Authenticator provider is deprecated. We recommend using [OpenID Connect](./sso-open-id-connect.md) instead.

## Introduction {#introduction}

In this guide we will do a deep dive on the Single-Sign-On (SSO) using Google Authentication. Unleash supports other identity providers and protocols, have a look at [all available Single-Sign-On options](./sso.md)

## Basic configuration

### Step 1: Sign-in to Unleash {#step-1}

In order to configure SSO you will need to log in to the Unleash instance with a user that have "Admin" role. If you are self-hosting Unleash then a default user will be automatically created the first time you start Unleash:

- username: `admin`
- password: `unleash4all`

### Step 2: Navigate to SSO configuration {#step-2}

In order to configure SSO with Google with your Unleash enterprise you should navigate to the Single-Sign-On configuration section and choose the "Google" tab.

![sso-config](/img/sso-configure.png)

### Step 3: Google Authentication {#step-3n}

Navigate to https://console.developers.google.com/apis/credentials

1. Click `Create credentials`
2. Choose `Oauth Client Id`
3. Choose Application Type: `web application`
4. Add https://[unleash.hostname.com]/auth/google/callback as an authorized redirect URI.

You will then get a `Client ID` and a `Client Secret` that you will need in the next step.

![Google OAuth: Secret](/img/sso-google-secret.png)

### Step 4: Configure Unleash {#step-4}

Login to Unleash and navigate to `Admin menu -> Single-Sign-on -> Google`.

First insert the Client Id and Client Secret from step 3.

You must also specify the hostname Unleash is running on. If Unleash is running on localhost you should specify the port as well (localhost:4242).

If you want to allow everyone in your organization to access Unleash, and have Unleash auto-create users you can enable this option. You should then also specify which email domains you want to allow logging in to Unleash.

Remember to click “Save” to store your settings.

![Google OAuth: Secret](/img/google_auth_settings.png)

### Step 5: Verify {#step-5}

Logout of Unleash and sign back in again. You should now be presented with the “SSO Authentication Option”. Click the button and follow the sign-in flow. If all goes well you should be successfully signed in to Unleash. If something is not working you can still sign-in with username and password.

![Verify SSO](/img/sign-in-google.png)
