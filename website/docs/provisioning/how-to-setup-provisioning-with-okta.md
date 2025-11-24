---
title: Set up Okta provisioning
pagination_next: provisioning/how-to-setup-provisioning-with-entra
---

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing) | **Version**: `6.1+`

:::

## Unleash Configuration {#unleash-setup}

:::info

Before you begin, ensure that you have a strategy in place to prevent [being locked out of all admin accounts](/support/troubleshooting#got-locked-out-of-an-admin-account-after-configuring-scim).

:::

### Step 1: Navigate to Provisioning configuration {#unleash-setup-step-1}

First you'll need to log in to Unleash as an admin user. Navigate to the Single Sign-On section and select the "SCIM" tab. The SCIM API URL will be shown in this section, you'll need this to configure Okta later.

![Navigate to the SCIM Config](/img/scim-config-1.png)

### Step 2: Enable Provisioning {#unleash-setup-step-2}

Enable SCIM by turning on the toggle and keep the token Unleash provides you for the Okta setup below.

![Enable the SCIM toggle](/img/scim-config-2.png)

## Okta Configuration {#okta-setup}

### Step 1: Create an Application in Okta {#okta-setup-step-1}

:::info Note

If you already have SAML SSO configured for Unleash in Okta you can skip to the [next step](how-to-setup-provisioning-with-okta#okta-setup-step-2). If you're planning on using [SAML for Unleash](/single-sign-on/how-to-add-sso-saml), do that first and skip to the next step. Note that if you're using OIDC SSO in Okta you still need to do this step.

This step will create an empty Sign-On Application that will only be used for SCIM.

:::

**1) Navigate to "Admin -> Applications" and click the "Create App Integration" button.**

![Navigate to Create Application](/img/scim-okta-config-1.png)

**2) Select SWA - Secure Web Authentication**

![Select Secure Web Application](/img/scim-okta-config-2.png)

**3) Fill in your App Name and App's login page URL**

![Setup Application Properties](/img/scim-okta-config-3.png)

### Step 2: Enable Provisioning in your Okta Application {#okta-setup-step-2}

:::info Note

If you already have a SAML application setup for Unleash you'll be modifying that application in this step.

:::

**Enable SCIM provisioning and save.**

![Enable SCIM](/img/scim-okta-config-5.png)

### Step 3: Connect Unleash {#okta-setup-step-3}

**1) Navigate to the Provisioning tab**

**2) Set the Unleash SCIM URL**

This is provided by the Unleash UI in the [configuring Unleash](how-to-setup-provisioning-with-okta#unleash-setup-step-1) section.

**2) Set email as the unique identifier**

**3) Configure actions**

Turn on "Push New Users", "Push Groups" and "Push Profile Updates".

**4) Set authentication mode to "HTTP Header"**

**5) Add your SCIM token**

This was provided by the Unleash UI in the [configuring Unleash](how-to-setup-provisioning-with-okta#unleash-setup-step-2) section.

![Connect Unleash](/img/scim-okta-config-5.png)

### Step 4: Configure Okta Provisioning {#okta-setup-step-4}

Navigate to the "To App" tab. Turn on "Create Users", "Update User Attributes" and "Deactivate Users". Save your configuration.

![Configure Okta Provisioning](/img/scim-okta-config-6.png)

### Step 5: Configure Provisioning Properties {#okta-setup-step-5}

**1) Set email**

Set the email field to map to your login property. This is important and ensures that your SSO integration continues to work.

**2) Remove unneeded properties**

You should remove all unnecessary properties. This ensures that Okta will reach a steady state when synchronizing. The properties that you must retain are:

- Username
- Given name
- Family name
- Email
- Primary email type
- Display name

![Configure Provisioning Attributes](/img/scim-okta-config-7.png)