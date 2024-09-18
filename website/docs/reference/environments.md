---
id: environments
title: Environments
---

:::note Availability

**Version**: `4.3+`

:::

<div style={{position: 'relative', paddingBottom: '56.25%', height: '0'}}>
    <iframe src="https://www.loom.com/embed/95239e875bbc4e09a5c5833e1942e4b0" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: 'absolute', top: '0', left: '0', width: '100%', height: '100%'}}></iframe>
</div>

Environments are a way to organize activation strategy configurations for feature flags. A feature exists in all environments, as the goal is to release it as soon as possible, but it makes sense to configure activation differently depending on the environment. [Open Source](https://www.getunleash.io/pricing) and [Pro](https://www.getunleash.io/pricing) customers have two preconfigured environments, **development** and **production**. [Enterprise](https://www.getunleash.io/pricing) customers can have unlimited environments.

Connected applications use environment-scoped API keys to ensure they download only the relevant feature flag configurations for the environment they are running in. Unleash tracks usage metrics per environment.

![A graph showing how environments work. Each project can have multiple features, and each feature can have different activation strategies in each of its environments.](/img/environments_overview.svg 'A feature flag exists across all environments, but take different activation strategies per environment.')

## Environment types

All environments in Unleash have a **type**. When you create a new environment, you must also assign it a type.

The built-in environment types are:
- Development
- Test
- Pre-production
- Production

The **production** environment type is special: Unleash will show additional confirmation prompts when you change something that could impact users in environments of this type. The built-in "production" environment is a production-type environment.

The other environment types do not currently have any functionality associated with them. This may change in the future.

## Global and project-level environments

Environments exist on a global level, so they are available to all projects within Unleash. However, every [project](./projects.md) might not need to use every environment. That's why you can also choose which of the global environments should be available within a project.

## How to start using environments

If you are on v4.2, you need to have the environment feature enabled (if you are using Unleash Hosted, please reach out on [contact@getunleash.io](mailto:contact@getunleash.io) if you want to start using environments. If you are on v4.3 or later, environments are already enabled for you.

Note that in order to enable an environment for a feature flag, you must first add activation strategies for that environment. You cannot enable an environment without activation strategies.

### Step 1: Enable new environments for your Project

Navigate to the project and choose the “environments” tab.

![A project view showing the Environments tab. The UI displays three environment flags: "default", "development", and "production". The "default" environment is enabled.](/img/environments_configure.png 'Configure environment for this project')

### Step 2: Configure activation strategies for the new environment

From the “feature flag view” you will now be able to configure activation strategies per environment. You can also enable and disable environments here. Remember that an environment must have activation strategies before you can enable it.

![A feature flag strategies tab showing three different environments, of which one is active. The UI displays data about the currently selected environment, ](/img/environments_strategies.png 'Add strategy configuration per environment')

### Step 3: Create environment specific API keys

In order for the SDK to download the feature flag configuration for the correct environment you will need to create an API token for a defined environment.

![An API key creation form. The form's fields are "username", "token type", "project", and, crucially, "environment". The development environment is selected.](/img/environments_api_keys.png 'Create Environment specific API Keys')

## Cloning environments

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing) | **Version**: `4.19+`

:::

Unleash environments can be cloned. Cloning an environment creates a **new** environment based on the selected source environment. When cloning an environment, you select any number of projects whose feature flag configurations will also be cloned. These projects will have identical configurations for the source and target environments. However, the environments can then be configured independently and will not stay in sync with each other.

When cloning an environment, you must give the new environment
- a name
- an environment type
- a list of projects to clone feature configurations in

You can also clone user permissions into the new environment. When you do that, permissions in the new environment will be the same as in the environment you cloned from. If you don't clone permissions, only admins and project editors can make changes in the new environment. You can change permissions after creation by using [custom project roles](../reference/rbac#custom-project-roles).

In order to clone an environment, you can follow the [how to clone environments](../how-to/how-to-clone-environments.mdx) guide.

Once created, the new environment works just as any other environment.

## Migration

To ease migration we have created a special environment called **default**. All existing activation strategies have been added to this environment. All existing Client API keys have also been scoped to work against the default environment to ensure zero disruption as part of the upgrade.

If you're currently using strategy constraints together with the “environment” field on the Unleash Context, you should be aware that the new environment support works slightly differently. With environments, the SDK API will use the client's API key to determine which environment the client is configured for. The API then sends _only_ strategies belonging to the client's environment. This means that you might not need the "environment" property of the Unleash Context anymore.

![A strategy constraint using the environment field of the unleash context.](/img/environments_strategy_constraints.png 'You will not use strategy constraints for environments any more.')

### Integrations

We have made some slight changes to events related to feature flags: there's one deprecation and several new event types. Most of the new events contain _project_ and _environment_ data.

To avoid missing important updates, you will also need to update your integration configuration to subscribe to the new events.

**Deprecated events:**

- **FEATURE_UPDATE** - _not used after switching to environments_

**New Events**

- **FEATURE-METADATA-UPDATED** - The feature flag metadata was updated (across all environments).
- **FEATURE-STRATEGY-ADD**¹ - An activation strategy was added to a feature flag in an environment. The _data_ will contain the updated strategy configuration.
- **FEATURE-STRATEGY-UPDATE**¹ - An activation strategy was updated for a feature flag. The _data_ will contain the updated strategy configuration.
- **FEATURE-STRATEGY-REMOVE**¹ - An activation strategy was removed for a feature flag.
- **FEATURE-ENVIRONMENT-ENABLED**¹ - Signals that a feature flag has been _enabled_ in a defined environment.
- **FEATURE-ENVIRONMENT-DISABLED**¹ - Signals that a feature flag has been _disabled_ in a defined environment.
- **FEATURE-PROJECT-CHANGE**¹ - The feature flag was moved to a new project.

> 1. These feature events will contain _project_ and _environment_ as part of the event metadata.

### API

In order to support configuration per environment we had to rebuild our feature flag admin API to account for environments as well. This means that we're making the following changes to the API:

- **/api/admin/features** - _deprecated (scheduled for removal in Unleash v5.0). The [old feature flags admin API](/reference/api/legacy/unleash/admin/features.md) still works, but strategy configuration will be assumed to target the “default” environment._
- **/api/admin/projects/:projectId/features** - New feature API to be used for feature flags which also adds support for environments. See [the documentation](/reference/api/legacy/unleash/admin/features.md) to learn more.

