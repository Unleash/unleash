---
title: How set up user group SSO syncing
---

:::info availability

User group syncing was released in Unleash 4.18 and is available for enterprise customers.

:::

This guide takes you through how to configure your [user groups](../reference/rbac#user-groups) to automatically populate users through Single Sign On (SSO). Refer to [setting up Keycloak for user group sync](../../how-to/how-to-setup-sso-keycloak-group-sync) for an end to end example. Note that the steps below require you to be logged in as an admin user.

## Step 1: Navigate to SSO configuration {#step-1}

Navigate to the "Single sign-on" configuration page.

![The Unleash Admin UI with the steps highlighted to navigate to the Single sign-on configuration.](/img/setup-sso-group-sync-1.png)

## Step 2: Enable Group Syncing {#step-2}

Turn on "Enable Group Syncing" and enter a value a for "Group Field JSON Path". Refer to the [User group SSO integration documentation](../reference/rbac.md#user-group-sso-integration) for more information or to the [how-to guide for integrating with Keycloak](how-to-setup-sso-keycloak-group-sync.md) for a practical example.

The value is the JSON path in the token response where your group properties are located, this is up to your SSO provider, a full example for Keycloak can be [found here](../../how-to/how-to-setup-sso-keycloak-group-sync). Once you're happy, save your configuration.

![The Single sign-on configuration page with enable group syncing, group field JSON path and save inputs highlighted.](/img/setup-sso-group-sync-2.png)

## Step 3: Navigate to a group {#step-3}

Navigate to the group you want to sync users for.

![The Unleash Admin UI with the steps highlighted to navigate to groups and a highlighted group card.](/img/setup-sso-group-sync-3.png)

## Step 4: Edit the group configuration {#step-4}

Navigate to edit group.

![The group configuration screen with edit group highlighted.](/img/setup-sso-group-sync-4.png)

## Step 5: Link SSO groups to your group {#step-5}

Link as many SSO groups as you like to your group, these names should match the group name or ID sent by your SSO provider exactly. Save your group configuration, the next time a user belonging to one of these groups logs in, they'll be automatically added to this group.

![The edit group screen with SSO Group input and save highlighted.](/img/setup-sso-group-sync-5.png)
