---
title: How to Setup Entra Provisioning
---

:::info availability

The **Provisioning capability** is only available for customers on the Enterprise subscription. Check out the [Unleash plans](https://www.getunleash.io/plans) for details.

:::

## Unleash Configuration {#unleash-setup}

### Step 1: Navigate to Provisioning configuration {#unleash-setup-step-1}

First you'll need to log in to Unleash as an admin user. Navigate to the Single Sign-On section and select the "SCIM" tab. The SCIM API URL will be shown in this section, you'll need this to configure Entra later.

![Navigate to the SCIM Config](/img/scim-config-1.png)

### Step 2: Enable Provisioning {#unleash-setup-step-2}

Enable SCIM by turning on the toggle and keep the token Unleash provides you for the Entra setup below.

![Enable the SCIM toggle](/img/scim-config-2.png)

## Entra Configuration {#entra-setup}

### Step 1: Navigate to Provisioning in Entra {#entra-setup-step-1}

:::info Note

This guide assumes you already have an SSO application setup for Unleash. If you don't already have an application configured, please see our [guide](../how-to/how-to-add-sso-azure-saml.md) on setting up SSO.

:::

**1) Navigate to "Enterprise Applications"**

![Navigate to Enterprise Applications](/img/scim-entra-config-1.png)

**2) Navigate to your SSO Application**

![Select your Application](/img/scim-entra-config-2.png)

**3) Navigate to provisioning**

![Navigate to the provisioning overview menu item](/img/scim-entra-config-3.png)

### Step 2: Connect Unleash to your Entra Application {#entra-setup-step-2}

**1) Navigate to the Provisioning overview**

**2) Set the Tenant URL**

This the SCIM API URL provided by the Unleash UI in the [configuring Unleash](how-to-setup-provisioning-with-entra#unleash-setup-step-1) section.**

**3) Set the Secret Token**

This was provided by the Unleash UI in the [configuring Unleash](how-to-setup-provisioning-with-entra#unleash-setup-step-2) section.

**4) Save**

![Setting up SCIM credentials](/img/scim-entra-config-4.png)

### Step 3: Configure Provisioning {#entra-setup-step-3}

**1) Expand the mappings tab**

**2) Navigate to "Provision Microsoft Entra ID Users"**

![Navigate to user provisioning setup](/img/scim-entra-config-5.png)

This was provided by the Unleash UI in the [configuring Unleash](how-to-setup-provisioning-with-entra#unleash-setup-step-2) section.

![Connect Unleash](/img/scim-entra-config-5.png)

**3) Remove unneeded properties**

You should remove all unnecessary properties. This ensures that Entra will reach a steady state when synchronizing. The properties that you must retain are:

- userName
- displayName
- emails
- externalId

**4) Update the active property**

You need to set the active property to the following (lowercase the boolean values):

Switch([IsSoftDeleted], , "false", "true", "true", "false")

**5) Update the email property to **

![Update provisioning properties](/img/scim-entra-config-6.png)

**6) Save**

### Step 4: Enable Provisioning {#entra-setup-step-4}

**1) Enable provisioning**

![Enable provisioning](/img/scim-entra-config-7.png)

**2) Enable automatic provisioning**

![Enable provisioning](/img/scim-entra-config-8.png)
