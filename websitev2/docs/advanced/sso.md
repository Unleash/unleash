---
id: enterprise-authentication
title: Single-Sign-On
---

> This guide only applies to customers on the Enterprise subscription. Check out the [Unleash subscription plans](https://www.getunleash.io/plans) for details.

## Introduction {#introduction}

In this guide we will do a deep dive on the Single-Sign-On (SSO) integrations. Unleash Enterprise supports SAML 2.0, OpenID Connect and Google Authentication. In addition, Unleash Enterprise also supports username/password authentication out of the box, as you get with all the other versions of Unleash.

## Step 1: Sign-in {#step-1-sign-in}

In order to configure SSO Authentication you will need to log in to the Unleash instance with a user that have "Admin" role. If you are self-hosting Unleash then a default user will be automatically created the first time you start unleash:

- username: `admin`
- password: `unleash4all` (or `admin` if you started with Unleash v3).

## Step 2: Configure Authentication provider {#step-2-configure-authentication-provider}


Unleash enterprise supports multiple authentication providers, and we provide in depth guides for each of them. To find them navigate to "Admin menu" => "Single-Sign-on" section.

![sso-config](/img/sso-configure.png)


## Step 3: Configure preferred Single-Sign-On provider {#okta-with-saml-20}

- [OpenID Connect](./sso-open-id-connect.md) 
- [SAML 2.0 - Okta](./sso-saml.md)
- [SAML 2.0 - Keycloak](./sso-saml.md)
- [Google Authentication](./sso-google.md) (deprecated) 

## Step 4: Verify {#step-4-verify}

Logout of Unleash and sign back in again. You should now be presented with the “SSO Authentication Option”. Click the button and follow the sign-in flow. If all goes well you should be successfully signed in to Unleash. If something is not working you can still sign-in with username and password.

![Verify SSO](/img/sign-in.png)
