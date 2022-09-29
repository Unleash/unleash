---
id: sso-saml
title: How to add SSO with SAML 2.0 Okta
---

> The **Single-Sign-On capability** is only available for customers on the Enterprise subscription. Check out the [Unleash plans](https://www.getunleash.io/plans) for details.

## Introduction {#introduction}

In this guide we will do a deep dive on the Single-Sign-On (SSO) integration with SAML 2.0 and connect it with Okta as IdP. Unleash support other identity providers and protocols, have a look at [all available Single-Sign-On options](./sso.md)

## Basic configuration

### Step 1: Sign-in to Unleash {#step-1}

In order to configure SSO you will need to log in to the Unleash instance with a user that have "Admin" role. If you are self-hosting Unleash then a default user will be automatically created the first time you start Unleash:

- username: `admin`
- password: `unleash4all`

### Step 2: Navigate to SSO configuration {#step-2}

In order to configure SSO with SAML with your Unleash enterprise you should navigate to the Single-Sign-On configuration section and choose the "SAML 2.0" tab.

![sso-config](/img/sso-configure-saml.png)

### Step 3: Create an application in Okta {#step-3}

Open a new tab/window in your browser and sign in to your Okta account. We will need to create a new Application which will hold the settings we need for Unleash.

**a) Navigate to “Admin -> Applications” and click the “Add Application” button.**

![Okta: Add Apps](/img/okta_add_application-768x345.png)

**b) Click “Create New App and choose a new “SAML 2.0” application and _click create_**

![Okta: Create Application](/img/okta_create_new_application-768x467.png)

**c) Configure SAML 2.0**

Unleash expects an email to be sent from the SSO provider so make sure Name ID format is set to email. Also you must give the IdP Initiated SSO URL Name, we have chosen to call it “unleash-enterprise”. This gives us the Sign-on URL we will need in our Unleash configuration later.

In addition you may provide the following attributes:

- firstName
- lastName

_(These will be used to enrich the user data in Unleash)._

![Okta: Configure SAML](/img/okta_configure_saml2.0-768x832.png)

> Please make sure to replace URLs with the public URL for your Unleash instance. This will require correct region prefix and the instance name. The example above uses region="us" and instance-name="ushosted".
>
> The correct format is: https://**[region]**.app.unleash-hosted.com/**[instanceName]**/auth/saml/callback

**d) Get the Okta Setup Instructions**

Click the “View Setup Instructions” to get the necessary configuration required for Unleash.

![Okta: Setup Instructions](/img/okta_setup-instructions-768x731.png)

### Step 4: Configure SAML 2.0 provider in Unleash {#step-4}

Go back to Unleash Admin Dashboard and navigate to `Admin Menu -> Single-Sign-On -> SAML`. Fill in the values captured in the _"Get the Okta Setup Instructions"_ step.

You may also choose to “Auto-create users”. This will make Unleash automatically create new users on the fly the first time they sign-in to Unleash with the given SSO provider (JIT). If you decide to automatically create users in Unleash you must also provide a list of valid email domains. You must also decide which global Unleash role they will be assigned (Editor role will be the default).

![Unleash: SAML 2.0](/img/sso-saml-unleash.png)

### Step 5: Validate {#step-5}

You have now successfully configured Unleash to use SAML 2.0 together with Okta as an IdP. Please note that you also must assign users to the application defined in Okta to actually be able to log-in to Unleash.

Try signing out of Unleash. If everything is configured correctly you should be presented with the option to sign in with SAML 2.0.

## Single-Sign-Out

> Available from `Unleash Enterprise 4.1.0`

You may also configure Unleash to to perform Single-Sign-Out. By enabling single-sign-out Unleash will redirect the user back to IdP as part of the sign-out process. You may optionally also sign the sign-out request (required by multiple IdP's such as Okta).

### Step 1: Generate private key & public certificate

_(This step is only required if you intend to sign the sign-out requests)._

Before you can configure single-sign-out support with Okta you are required to generate a Private Key together with a public certificate for that key. We recommend to use SHA256 certificates.

To create a public certificate and private key pair, use the proceeding commands. They work in Linux® and Mac® terminals.

```bash
openssl genrsa -out private.pem 2048
openssl req -new -x509 -sha256 -key private.pem -out cert.pem -days 1095
```

Answer the promoted questions, and when you complete all the steps you should end up with two files:

- `private.pem` - Private certificate, required by Unleash in order to sign requests.
- `cert.pem` - Public certificate, required by the IdP in order to validate requests from Unleash.

### Step 2: Configure sign-out url in Okta

Login in to Okta and navigate to your Applications. Select the "Unleash" application you created, click on "General" and then "Edit SAML Settings".

![SAML 2.0 Okta edit](/img/sso-saml-okta-edit.png)

<br /><br />

**Next, navigate to "Configure SAML" and click "show Advanced Settings" and check the `Enable Single Logout` option. **

<br /><br />

![SAML 2.0 Okta sing-out config](/img/sso-saml-okta-signout.png)

<br /><br />

> Please make sure to replace URLs with the public URL for your Unleash instance. This will require correct region prefix and the instance name. The example above uses region="us" and instance-name="ushosted".
>
> The correct format is: https://**[region]**.app.unleash-hosted.com/**[instanceName]**/auth/saml/logout/done

You need to fill out the following options:

- Single Logout Url: https://**[region]**.app.unleash-hosted.com/**[instanceName]**/auth/saml/logout/done
- SP Issuer: https://**[region]**.app.unleash-hosted.com/**[instanceName]**

Next upload the public Certificate you generated in the previous step (`cert.pem`) and save the Okta SAML settings. Upon completion of this step you should be provided with the ability to view setup instructions and now you should be provided with a "Identity Provider Single Logout URL"

![SAML 2.0 Okta sing-out url](/img/sso-saml-okta-signout-url.png)

### Step 3: Configure Single-Sign-Out in Unleash

Go back to Unleash Admin Dashboard and navigate to `Admin Menu -> Single-Sign-On -> SAML`. Fill in the values captured in the "Single Logout URL" from Okta.

In the "Service Provide X.509 Certificate" field you should insert the value of your private key (`private-pem`). This is required in order to make Unleash able to sign logout requests.

![SAML 2.0 Okta sing-out config](/img/sso-saml-okta-signout-unleash.png)

After you save these settings users will now be redirected to your IdP (Okta) and back to Unleash again after successfully signing out.
