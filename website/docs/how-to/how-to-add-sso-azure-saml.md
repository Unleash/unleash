---
title: How to add SSO with SAML 2.0 Azure
---

import Figure from '@site/src/components/Figure/Figure.tsx'

:::info Availability

The **Single-Sign-On capability** is only available for customers on the Enterprise subscription. Check out the [Unleash plans](https://www.getunleash.io/plans) for details.

:::

## Introduction {#introduction}

This guides shows you how to use [Unleash's Single-Sign-On (SSO) integration](../reference/sso.md) with SAML 2.0 and how to connect it to Azure Active Directory as an ID provider (IdP).

## Basic configuration

### Prerequisites

This guide expects you to already have:

- Administrator access to the Unleash instance you want to configure
- Azure AD access for your Azure instance

### Step 1: Create an Enterprise Application within Azure AD {#step-1}

**a) Sign in to your Azure AD and create a new Enterprise Application**.

<Figure caption="In the Azure directory overview, use the add button and select the enterprise application option." img="/img/sso-azure-saml-add-enterprise-app.png"/>

**b) In the Azure AD gallery, select the option to create your own application.**

![The Azure AD gallery. The "create your own application" button is highlighted.](/img/sso-azure-saml-create-own-app.png)

**c) Next, provide the application with a name. When asked what you're looking to do with the application, select the "Integrate any other application you don't find in the gallery (Non-gallery)" option.**

![Azure application creation form. The name is set to "UnleashSSO" and the "non-gallery" option is selected.](/img/sso-azure-saml-name-app.png)

### Step 2: Configure SSO via SAML in Azure AD {#step-2}

**a) On the single sign-on page ("single sign-on" in the side bar), select the "SAML" option**

![Azure: SSO method selection page](/img/sso-azure-saml-saml-choice.png)

**b) Section 1: Basic SAML Configuration {#basic-saml-configuration}**

When configuring SSO with SAML, you'll need to add an **identifier** and a **reply URL**.
The **identifier** is your Unleash URL. (For hosted instances, that's usually `https://<region>.app.unleash-hosted.com/<instanceName>`).

The **reply URL** is the Unleash callback URL. The Unleash callback URL is available on the Unleash SSO configuration page, and is typically your Unleash URL followed by `/auth/saml/callback`.

![Azure: The basic SAML configuration form with example values filled out for the required fields.](/img/sso-azure-saml-section-one.png)

**c) Section 2: Attributes & Claims {#attributes-and-claims}**

1. Set the "name identifier format" to "Email address".
2. Select "attribute" as the source.
3. Enter "user.mail" in the source attribute field.

Optionally, you can also provide a first name and a last name. If provided, these will be used to enrich the data in Unleash.

![Azure: The manage claim form with email configuration filled out](/img/sso-azure-saml-unique-id-email-id.png)
![Azure: The list of claims used by the SAML setup, including the optional claims for given name and surname](/img/sso-azure-saml-attributes-claim.png)

:::info URLs and formats

Make sure to replace URLs with the public URL for your Unleash instance. This will require correct region prefix and the instance name.

The correct format is: https://**[region]**.app.unleash-hosted.com/**[instanceName]**/auth/saml/callback

:::

**d) Sections 3 and 4: Azure AD setup details {#azure-details}**

You will need some details from section 3 and 4 of the SAML setup form to configure the integration within Unleash. These details are:
- Azure AD Identifier (from section 4)
- Login URL (from section 4)
- X.509 Certificate (in the Federation Metadata XML from section 3)

<Figure caption="Section 3 contains a download link for the Federation Metadata XML file. Section 4 lists the Azure AD identifier and the login URL" img="/img/sso-azure-saml-azure-details.png"/>
<Figure caption="Within the Federation Metadata XML file, find the `X509Certificate` tag. You'll need the content within that tag." img="/img/sso-azure-saml-x509cert.png"/>

### Step 3: Configure SAML 2.0 provider in Unleash {#step-3}

In order to configure SSO with SAML with your Unleash enterprise you should navigate to the Single-Sign-On configuration section and choose the "SAML 2.0" tab.

![Unleash: sso-config screen](/img/sso-configure-saml.png)

Use the values from the [previous section](#azure-details) to fill out the form:
1. In the entity ID field, add the **Azure AD identifier**. It should look a little like this `https://sts.windows.net/**[identifier]**`.
2. In the single sign-on URL field, add the **login URL**. It should look something like `https://login.microsoftonline.com/**[identifier]**/saml2`
3. In the X.509 certificate field, add the content of the `X509Certificate` tag from the **federation metadata XML**.

Optionally, you may also choose to “Auto-create users”. This will make Unleash automatically create new users on the fly the first time they sign-in to Unleash with the given SSO provider (JIT). If you decide to automatically create users in Unleash you must also provide a list of valid email domains separated by commas. You must also decide which global Unleash role they will be assigned. Without this enabled you will need to manually add users to Unleash before SSO will work for their accounts and Unleash.

![Unleash: SAML 2.0 filled out with entity ID, Single Sign-On URL, and X.509 certificate and auto-creating users for users with the '@getunleash.ai' and '@getunleash.io' emaiil domains.](/img/sso-azure-saml-unleash-config.png)

### Validate {#validation}

If everything is set up correctly, you should now be able to sign in with the SAML 2.0 option. You can verify that this works by logging out of Unleash: the login screen should give you the option to sign in with SAML 2.0.

You can also test the integration in Azure by using the "test single sign on" step in the SAML setup wizard.

<Figure caption="The SAML setup wizard contains a step that lets you test your SAML 2.0 integration. You can use this to verify that everything is configured correctly within Azure." img="/img/sso-azure-saml-test-user.png"/>

### Group Syncing {#group-syncing}

Optionally, you can sync groups from Azure AD to Unleash to [map them to groups in Unleash](../how-to/how-to-set-up-group-sso-sync.md).

**a) Add a group claim in Azure**
In section 2 (Attributes and claims) of the Azure SAML set-up, select the option to "Add a group claim".

Check the box to "Customize the name of the group claim" and update the "Name" to something simple, such as "groups".

Azure AD only supports sending a maximum of 150 groups in the SAML response. If you're using Azure AD and have users that are present in more than 150 groups, you'll need to add a filter in this section to the group claim to ensure that only the groups you want to sync are sent to Unleash.

![Azure: section 2, attributes and claims, adding a group claim with the name 'group'](/img/sso-azure-saml-group-setup.png)


**b) Unleash SSO Setup**
In the Unleash Admin SSO section, enable the option to "Enable Group Syncing".

Add the same "Name" you used from the previous section (eg. "groups") as the "Group Field JSON Path".

![Unleash: SAML 2.0 SSO setup, enabled group syncing with the Group Field JSON Path as 'groups'](/img/sso-azure-saml-unleash-group-settings.png)

**Note that Azure only supports sending up to 150 groups.** If you have more groups than this, you can setup a filter in Azure to only send the relevant groups to Unleash.

![Unleash: SAML 2.0 setup, filtering groups by name ](/img/sso-azure-saml-group-filtering.png)