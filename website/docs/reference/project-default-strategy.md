---
title: Project default strategy
---

:::info Availability

The project default strategy feature is generally available starting with **Unleash 5.2.0**.

:::

You can define default strategies for each of a project's environments. The default strategy for an environment will be added to a feature when you enable it in an environment **if and only if** the feature has **no active strategies** defined. 

## Limitations

The default project strategy uses the [Gradual Rollout activation strategy](/reference/activation-strategies.md) as it's base.  You can customise to your needs by using constraints or segments (enterprise only)

## Configuration

When in project overview, go to the Project settings tab and click on Default strategy 

![project_settings_default_strategy.png](/img/project_settings_default_strategy.png)

You can customise the default strategy for each of the project's environments by clicking on the edit button

![edit_default_Strategy.png](/img/edit_default_Strategy.png)

This will open up the familiar activation strategy form, where you can add your constraints and/or segments

![activation_Strategy_form.png](/img/activation_Strategy_form.png)
