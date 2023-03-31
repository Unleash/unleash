---
title: How to add SSO with SAML 2.0 Azure
---

:::note Availability

The **Single-Sign-On capability** is only available for customers on the Enterprise subscription. Check out the [Unleash plans](https://www.getunleash.io/plans) for details.

:::

## Introduction {#introduction}

In this guide we will do a deep dive on the Single-Sign-On (SSO) integration with SAML 2.0 and connect it with Azure Active Directory as IdP. Unleash support other identity providers and protocols, have a look at [all available Single-Sign-On options](../reference/sso.md)

## Basic configuration

### Step 1: Sign-in to Unleash {#step-1}

In order to configure SSO you will need to log in to the Unleash instance with a user that have "Admin" role. If you are self-hosting Unleash then a default user will be automatically created the first time you start Unleash:

- username: `admin`
- password: `unleash4all`

### Step 2: Navigate to SSO configuration {#step-2}

In order to configure SSO with SAML with your Unleash enterprise you should navigate to the Single-Sign-On configuration section and choose the "SAML 2.0" tab.

![sso-config](/img/sso-configure-saml.png)

### Step 3: Create an Enterprise Application within Azure AD {#step-3}

Open a new tab/window in your browser and sign in to your Azure AD. Create a new Enterprise Application. 

![Azure: Create Azure AD App](/img/sso-azure-saml-add-enterprise-app.png)

**a) Choose "Create your own application", add a name, and select "Integrate any other application you don't find in the gallery (Non-gallery)", and click "Create"**

![Azure: App Setup 1](/img/sso-azure-saml-create-own-app.png)
![Azure: App Setup 2](/img/sso-azure-saml-name-app.png)

**b) Select "Single sign-on" from the side bar and select the "SAML" option**

![Azure: SSO Setup SAML](/img/sso-azure-saml-saml-choice.png)

**c) Section 1: Basic SAML Configuration**

The "Identifier" is your Unleash URL (typically formatted as: https://**[region]**.app.unleash-hosted.com/**[instanceName]**). 
The "Reply URL" is the Unleash Callback URL, which can be found on the Unleash SSO Configuration page (typically formatted as: https://**[region]**.app.unleash-hosted.com/**[instanceName]**/auth/saml/callback).
Click save. 

![Azure: SSO Setup Overview](/img/sso-azure-saml-azure-details-overview.png)
![Azure: SSO Setup Section 1](/img/sso-azure-saml-section-one.png)

**d) Section 2: Attributes & Claims**

Unleash requires an email to be sent from the SSO provider so make sure to set the "Unique User Identifier" to the "user.mail" source attribute.

In addition you may provide the following attributes:

- firstName
- lastName

_(These will be used to enrich the user data in Unleash, but are not required)._

![Azure: SAML Unique Identifier](/img/sso-azure-saml-unique-id-email-id.png)
![Azure: SAML Attributes](/img/sso-azure-saml-attributes-claim.png)

> Please make sure to replace URLs with the public URL for your Unleash instance. This will require correct region prefix and the instance name. 
>
> The correct format is: https://**[region]**.app.unleash-hosted.com/**[instanceName]**/auth/saml/callback

**e) Get the Azure AD Setup Details**

Make note of the following details necessary for the Unleash SAML configuration.

Unleash will need:
- Azure AD Identifier
- Login URL
- X.509 Certificate (in the Federation Metadata XML)

![Azure: Azure Details for Unleash](/img/sso-azure-saml-azure-details.png)
![Azure: Azure X509 for Unleash](/img/sso-azure-saml-x509cert.png)

### Step 4: Configure SAML 2.0 provider in Unleash {#step-4}

Go back to Unleash Admin Dashboard and navigate to `Admin Menu -> Single-Sign-On -> SAML`. Fill in the values captured in the _"Get the Azure AD Setup Details"_ step.
This is how the Azure details map to Unleash
- Azure AD Identifier > Entity ID (should be formatted as https://sts.windows.net/**{GUID}**)
- Login URL > Single Sign-On URL (should be formatted as https://login.microsoftonline.com/**{GUID}**/saml2)
- Azure Federation Metadata XML (copy the X509Certificate) > X.509 Certificate

You may also choose to “Auto-create users”. This will make Unleash automatically create new users on the fly the first time they sign-in to Unleash with the given SSO provider (JIT). If you decide to automatically create users in Unleash you must also provide a list of valid email domains separated by commas. You must also decide which global Unleash role they will be assigned (Editor role will be the default).

![Unleash: SAML 2.0](/img/sso-azure-saml-unleash-config.png)

### Step 5: Validate {#step-5}

You have now successfully configured Unleash to use SAML 2.0 together with Azure AD as an IdP. Please note that you also must assign users to the application defined in Azure AD to actually be able to log-in to Unleash.

Try signing out of Unleash. If everything is configured correctly you should be presented with the option to sign in with SAML 2.0.

Additionally, Azure gives the option to test logging in with a user at the bottom of the Azure AD SAML setup page. 

![Azure: Test User](/img/sso-azure-saml-test-user.png)

