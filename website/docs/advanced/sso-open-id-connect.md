---
id: sso-open-id-connect
title: How to add SSO with OpenID Connect
---

> The **Single-Sign-On capability** is only available for customers on the Enterprise subscription. Check out the [Unleash plans](https://www.getunleash.io/plans) for details.

## Introduction {#introduction}

In this guide we will do a deep dive on the Single-Sign-On (SSO) using the OpenID Connect protocol and connect it with Okta as IdP. Unleash supports other identity providers and protocols, have a look at [all available Single-Sign-On options](./sso.md)

## Basic configuration

### Step 1: Sign-in to Unleash {#step-1}

In order to configure SSO you will need to log in to the Unleash instance with a user that have "Admin" role. If you are self-hosting Unleash then a default user will be automatically created the first time you start Unleash:

- username: `admin`
- password: `unleash4all`

### Step 2: Navigate to SSO configuration {#step-2}

Unleash enterprise supports multiple authentication providers, and we provide in depth guides for each of them. To find them navigate to "Admin" => "Single-Sign-On" section.

![admin-authentication](/img/sso-oidc.png)

### Step 3: Okta with OpenID Connect {#step3}

Open a new tab/window in your browser and sign in to your Okta account. We will need to create a new Application which will hold the settings we need for Unleash.

**a) Create new Okta application**

Navigate to “Admin/Applications” and click the “Add Apps” button.

![Okta: Add Apps](/img/okta_add_application-768x345.png)

Then click “Create Application” and choose a new “OIDC - OpenID Connect” application, and choose application type "Web Application" and click create.

![Okta: Create Apps](/img/okta-oidc-create.png)

**b) Configure Application Integration**

Give you application a name. And set the Sign-in redirect URI to:

`https://[region].app.unleash-hosted.com/[instanceName]/auth/oidc/callback`

(In a self-hosted scenario the URL must match your `UNLEASH_URL` configuration)

You can also configure the optional Sign-out redirect URIs: `https://[region].app.unleash-hosted.com/[instanceName]/`

![Okta: Configure OpenID Connect](/img/sso-oidc-okta.png)

Save your new application and your will ge the required details you need to configure the Unleash side of things:

![Okta: Configure OpenID Connect](/img/okta-oidc-details.png)

**c) Configure OpenID Connect provider in Unleash**

Navigate to Unleash and insert the details (Discover URL, Client Id and Client Secret) in to Unleash.

> Pleas note that the `Discover URL` must be a valid URL and must include the `https://` prefix. For example: **https://dev-example-okta.com** is a valid discovery URL.

You may also choose to “Auto-create users”. This will make Unleash automatically create new users on the fly the first time they sign-in to Unleash with the given SSO provider (JIT). If you decide to automatically create users in Unleash you must also provide a list of valid email domains. You must also decide which global Unleash role they will be assigned (Editor role will be the default).

![Unleash: Configure OpenID Connect](/img/sso-oidc-unleash.png)

### Step 4: Verify {#step-4}

Logout of Unleash and sign back in again. You should now be presented with the "Sign in with OpenID Connect" option. Click the button and follow the sign-in flow. If all goes well you should be successfully signed in to Unleash.

(If something is not working you can still sign-in with username and password).

![Verify SSO](/img/sso-oidc-verify.png)

Success!
