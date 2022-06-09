---
id: create_feature_toggle
title: How to create a feature toggle
---

import ApiRequest from '@site/src/components/ApiRequest'

Feature toggles are the foundation of Unleash. They are at the core of everything we do and is a fundamental building block in any feature management system. This guide shows you how to create feature toggles in Unleash including how to add any optional constraints, segments, variants, and more. Links to learn more about the concepts will be scattered throughout the text.

The guide below is split into three sections:
1. [Prerequisites](#prerequisites): you need this before you can create a toggle.
2. [Required steps](#required-steps): all the required steps to create a toggle and activate it in production.
3. [Optional steps](#optional-steps): optional steps you can take to further target and configure your feature toggle and its audience.

## Prerequisites

To be able to create a feature toggle in an Unleash system you will need:
- A running Unleash instance
- A project to hold the toggle
- A user with an **editor** or **admin** role OR a user with the following permissions inside the target project:
  - create feature toggles
  - create/edit variants
  - create activation strategies (for the right environment)
  - update activation strategies (for the right environment)
  - enable/disable toggles (for the right environment)

:::info roles

Refer to [the docs on role-based access control](./rbac.md) for more information about the available roles and their permissions.

:::

## Required steps
### Step 2:  Create a feature. (including impression data)
### Step 3:  Pick an environment.
### Step 4:  Add (and configure) a strategy.
### Step 5:  Enable the toggle.

## Optional steps

### Add constraints and segmentation

### Add variants

6. Add strategy constraints and segmentation
7. Add feature variants.


In this guide you will learn how to create your first feature toggle using Unleash.

## Step 1: Click the “create feature toggle” button {#step-1-click-the-create-feature-toggle-button}

The first time you log-in to your Unleash instance you will see an empty list of feature toggles. In order to create a new feature toggle you have to click the “create feature toggle” button

![Create a feature toggle](/img/create_feature_toggle_button.png)

## Step 2: Create Feature toggle {#step-2-create-feature-toggle}

After clicking the “create feature toggle” button you will be presented with a form for creating a new feature toggle. You will need to define a few fields before you can actually complete the new feature toggle.

- **Name** – Must be unique across all your feature toggle. The name must also follow a URL friendly format. Can not be changed.
- **Description** – A good description makes it easier for other members on your team to understand why this feature toggle exists.
- **Enabled** – Whether the feature toggle should be enabled or disabled. If the feature toggle is disabled, activation strategy configurations will not be evaluated.
- **Activation** strategies – A list of one or more activation strategies. An activation strategy is used to enable the feature toggle to a subset, or all, of your users.

In the example below we have chosen to not set up a strategy, which means that the standard strategy will be applied.

![Create a feature toggle](/img/create_feature_toggle_save.png)

## Step 3: Congratulations, you have now created your first feature toggle! {#step-3-congratulations-you-have-now-created-your-first-feature-toggle}

The toggle is now created and ready to be used. The toggle does not have any metrics because it is not used by any applications, yet!

![Create a feature toggle](/img/create_feature_toggle_list.png)

## Step 4: Enable the feature toggle only for your boss! {#step-4-enable-the-feature-toggle-only-for-your-boss}

The next step is to change the activation strategy to only target your boss. You can use the “userIDs”-strategy for that. Using the configuration shown below will only enable the feature toggle for “boss@company.com” and “me@company.com”. Thus, you can safely test your feature in production, without exposing it to your users.

![Create a feature toggle](/img/create_feature_toggle_userIds.png)

## Summary {#summary}

In this guide you created your first feature toggle and enabled it for everyone. In later guides we will learn how we can reduce the risk by enabling the toggle for a controlled set of users first.
