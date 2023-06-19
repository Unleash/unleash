---
title: Project default strategy
---

:::info Availability

The project default strategy feature is generally available starting with **Unleash 5.2.0**.

:::

A project's environment's **default strategy** specifies **the activation strategy that will be used when you enable a feature in that environment, if the environment has no defined strategies)**. 

## Limitations

The default project strategy uses the [Gradual Rollout activation strategy](/reference/activation-strategies.md) as it's base.  You can customise to your needs by using constraints or segments (enterprise only)

## Setting up

When in project overview, go to the Project settings tab and click on Default strategy 

![project_settings_default_strategy.png](/img/project_settings_default_strategy.png)

You can customise the default strategy for each of the project's environments by clicking on the edit button

![edit_default_Strategy.png](/img/edit_default_Strategy.png)

This will open up the familiar activation strategy form, where you can add your constraints and/or segments

![activation_Strategy_form.png](/img/activation_Strategy_form.png)
