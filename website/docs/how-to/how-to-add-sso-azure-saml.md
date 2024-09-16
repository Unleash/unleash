---
title: How to add SSO with SAML 2.0 and Microsoft Entra ID
slug: 'how-to/how-to-add-sso-azure-saml'
description: 'Configure Microsoft Entra ID (formerly known as Azure AD) SSO with SAML 2.0 for your Unleash instance.'
---

import Figure from '@site/src/components/Figure/Figure.tsx'

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing)

:::

This guide walks you through setting up single sign-on (SSO) using SAML 2.0, with [Microsoft Entra ID](https://www.microsoft.com/en-us/security/business/identity-access/microsoft-entra-id) as the identity provider (IdP). Unleash also supports a variety of identity providers and protocols; visit our [reference documentation](../reference/sso.md) to explore other options.

## Prerequisites

To follow along, you'll need:

- An Unleash instance with administrator access.
- Microsoft Entra access for the Azure instance you want to integrate with.

## Create an enterprise application in Microsoft Entra ID

To create a new enterprise application in Microsoft Entra, do the following:
1. In the Microsoft Entra admin center, go to **Identity > Applications > Enterprise applications** and click **New application**.
2. In the Microsoft Entra Gallery, click **Create your own application**.
3. Enter an app name, select the **Integrate any other application you don't find in the gallery** option, and click **Create**.

## Configure SAML SSO for the application

### Add SAML configuration

To configure SSO for the new application, do the following:
1. In the overview page of the application, go to **Manage > Single sign-on** and click **SAML**.
2. In **Basic SAML Configuration**, click **Edit**.
3. Click **Add identifier** and enter the Unleash identifier. For hosted instances, that is `https://<region>.app.unleash-hosted.com/<your_unleash_instance_name>`.
4. Click **Add reply URL** and enter the URL shown in the Unleash Admin UI at **Admin > Single sign-on > SAML 2.0**. For example, `<your_unleash_url>/auth/saml/callback`.
5. Click **Save**.

<Figure caption="Edit the SAML configuration in Microsoft Entra admib center." img="/img/microsoft-entra-admin-center.png" />

### Manage attributes and claims

To confirm attributes and claims for the new application, do the following:
1. In the single sign-on page for your application, go to **Attributes & Claims** and click **Edit**.
2. Go to **Required claim** and click **Unique User Identifier (Name ID)**.
3. For **Name identifier format**, select **Email address**.
4. For **Source**, select **Attribute** and for **Source attribute** select `user.mail`.
5. Click **Save**.

### Save SAML certificate, identifier, and login URL

Save the following information from the single sign-on page for your application:
1. **SAML certificate**: go to **SAML Certificates > Federation Metadata XML** and click **Download**.
   1. Open the file and copy the contents between the `X509Certificate` tag. 
2. **Login URL**: go to **Set up {your-application-name}** and copy and save **Login URL**. For example: `https://login.microsoftonline.com/<your_identifier>/saml2`.
3. **Microsoft Entra Identifier**: go to **Set up {your-application-name}** and copy and save **Microsoft Entra Identifier**. For example: `https://sts.windows.net/<your_identifier>/`

<Figure caption="Save the X509 Certificate from the SAML certificate XML file. The example has been redacted." img="/img/x509cert.png" />

## Configure the SAML 2.0 provider in Unleash

To finalize the configuration, do the following:

1. In the Unleash Admin UI, go to **Admin > Single sign-on> SAML 2.0**.
2. In **Entity ID**, enter your **Microsoft Entra Identifier**.
3. In **Single sign-on URL**, enter your **Login URL**.
4. In **X.509 Certificate**, [enter your **SAML certificate**](#save-saml-certificate-identifier-and-login-url).
5. Optional: To automatically create users for first-time sign-ins, select **Auto-create users**. Select a default root role new users should have, and configure the list of valid email domains.
6. Click **Save**.

<Figure caption="Configure SAML 2.0 in Unleash." img="/img/saml2.0.png" />

## Test your configuration

To test that things are working as expected, log out of Unleash and verify that the login screen gives you the option to sign in with SAML 2.0. You can also test the integration in Microsoft Entra in the single sign-on settings of your application.

## Enable group syncing

Optionally, you can sync groups from Microsoft Entra ID to Unleash to [map them to groups in Unleash](../how-to/how-to-set-up-group-sso-sync.md).

To create the group in Microsoft Entra, do the following:
1. In the Microsoft Entra admin center, go to the single sign-on settings of your application, and select **Attributes & Claims**.
2. Click **Add a group claim** and select **Groups assigned to the application**.
3. In the **Advanced options** click **Customize the name of the group claim**, and enter a name.
4. Click **Save**.

:::info
Microsoft Entra limits the number of groups emitted in a SAML response to 150, including nested groups. If you have users who are present in more than 150 groups, add a filter in the advanced section of group claims to ensure the response only includes the groups you want to send to Unleash.
:::

To enable group syncing in Unleash, do the following:
1. In the Unleash Admin UI, go to **Admin > Single sign-on > SAML 2.0**.
2. Select **Enable Group Syncing** and add the name in your group in Group Field JSON Path.
3. Click **Save**.