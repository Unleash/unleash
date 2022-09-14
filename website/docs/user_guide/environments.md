---
id: environments
title: Environments
---

<div class="alert alert--info">
  <em>Environments</em> are available in <i>Unleash v4.3.x</i> and later. They can also be enabled from <i>Unleash v4.2.x</i> with a feature toggle.
</div>
<br />

<div style={{position: 'relative', paddingBottom: '56.25%', height: '0'}}>
    <iframe src="https://www.loom.com/embed/95239e875bbc4e09a5c5833e1942e4b0" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: 'absolute', top: '0', left: '0', width: '100%', height: '100%'}}></iframe>
</div>

Environments is a new way to organize activation strategy configurations for feature toggles into separate environments. In Unleash, a feature lives across all your environments — after all, the goal is to get the new feature released as soon as possible — but it makes sense to configure the activation differently per environment. You might want the feature enabled for everyone in development, but only for yourself in production, for instance.

Previously, Unleash Enterprise could use [strategy constraints](../advanced/strategy-constraints.md) to control the rollout across environments. With the new environments feature, this is no longer necessary. Now all activation strategies belong to an explicit environment instead.

Further, connected applications will use environment-scoped API keys to make sure they only download feature toggle configurations for the environment they are running in.

Finally, metrics have also been upgraded to record the environment. This, in turn, means that Unleash can display usage metrics per environment.

Despite this being a shift in how Unleash works, everything will continue to work exactly how it did for existing users. For backwards compatibility, we have created an environment named "default" that will contain all of the existing toggles and API keys. Read more about that in [the migration section](#migration).

![A graph showing how environments work. Each project can have multiple features, and each feature can have different activation strategies in each of its environments.](/img/environments_overview.svg 'A feature toggle exists across all environments, but take different activation strategies per environment.')

## Global and project-level environments

Environments exist on a global level, so they are available to all projects within Unleash. However, every [project](./projects.md) might not need to use every environment. That's why you can also choose which of the global environments should be available within a project.

## How to start using environments

In order to start using environments you need to be on Unleash v4.2 or higher.

If you are on v4.2, you also need to have the environment feature enabled (if you are using Unleash Hosted, please reach out on [contact@getunleash.io](mailto:contact@getunleash.io) if you want to start using environments.

If you are on v4.3 or later, environments are already enabled for you.

Note that in order to enable an environment for a feature toggle, you must first add activation strategies for that environment. You cannot enable an environment without activation strategies.

### Step 1: Enable new environments for your Project

Navigate to the project and choose the “environments” tab.

![A project view showing the Environments tab. The UI displays three environment toggles: "default", "development", and "production". The "default" environment is enabled.](/img/environments_configure.png 'Configure environment for this project')

### Step 2: Configure activation strategies for the new environment

From the “feature toggle view” you will now be able to configure activation strategies per environment. You can also enable and disable environments here. Remember that an environment must have activation strategies before you can enable it.

![A feature toggle strategies tab showing three different environments, of which one is active. The UI displays data about the currently selected environment, ](/img/environments_strategies.png 'Add strategy configuration per environment')

### Step 3: Create environment specific API keys

In order for the SDK to download the feature toggle configuration for the correct environment you will need to create an API token for a defined environment.

![An API key creation form. The form's fields are "username", "token type", "project", and, crucially, "environment". The development environment is selected.](/img/environments_api_keys.png 'Create Environment specific API Keys')

## Migration

To ease migration we have created a special environment called “default”. All existing activation strategies have been added to this environment. All existing Client API keys have also been scoped to work against the default environment to ensure zero disruption as part of the upgrade.

If you're currently using strategy constraints together with the “environment” field on the Unleash Context, you should be aware that the new environment support works slightly differently. With environments, the SDK API will use the client's API key to determine which environment the client is configured for. The API then sends _only_ strategies belonging to the client's environment. This means that you might not need the "environment" property of the Unleash Context anymore.

![A strategy constraint using the environment field of the unleash context.](/img/environments_strategy_constraints.png 'You will not use strategy constraints for environments any more.')

### Addons

We have made some slight changes to events related to feature toggles: there's one deprecation and several new event types. Most of the new events contain _project_ and _environment_ data.

To avoid missing important updates, you will also need to update your addon configuration to subscribe to the new events.

**Deprecated events:**

- **FEATURE_UPDATE** - _not used after switching to environments_

**New Events**

- **FEATURE-METADATA-UPDATED** - The feature toggle metadata was updated (across all environments).
- **FEATURE-STRATEGY-ADD**¹ - An activation strategy was added to a feature toggle in an environment. The _data_ will contain the updated strategy configuration.
- **FEATURE-STRATEGY-UPDATE**¹ - An activation strategy was updated for a feature toggle. The _data_ will contain the updated strategy configuration.
- **FEATURE-STRATEGY-REMOVE**¹ - An activation strategy was removed for a feature toggle.
- **FEATURE-ENVIRONMENT-ENABLED**¹ - Signals that a feature toggle has been _enabled_ in a defined environment.
- **FEATURE-ENVIRONMENT-DISABLED**¹ - Signals that a feature toggle has been _disabled_ in a defined environment.
- **FEATURE-PROJECT-CHANGE**¹ - The feature toggle was moved to a new project.

> 1. These feature events will contain _project_ and _environment_ as part of the event metadata.

### API

In order to support configuration per environment we had to rebuild our feature toggle admin API to account for environments as well. This means that we're making the following changes to the API:

- **/api/admin/features** - _deprecated (scheduled for removal in Unleash v5.0). The [old feature toggles admin API](../api/admin/feature-toggles-api.md) still works, but strategy configuration will be assumed to target the “default” environment._
- **/api/admin/projects/:projectId/features** - New feature API to be used for feature toggles which also adds support for environments. See [the documentation](../api/admin/feature-toggles-api-v2.md) to learn more.

## Plan Differences

### Open-Source (free)

- Will get access to two preconfigured environments: “development” and “production”. Existing users of Unleash will also get an additional “default” environment to simplify the adoption of environments.
- Will be possible to turn environments on/off for all projects.

### Pro (commercial)

- Will get access to two preconfigured environments: “development” and “production”. Existing users of Unleash will also get an additional “default” environment to simplify the adoption of environments.
- Will be possible to turn environments on/off for the default project.

### Enterprise (commercial)

- Will get access to two preconfigured environments: “development” and “production”. Existing users of Unleash will also get an additional “default” environment to simplify the adoption of environments.
- Will be possible to turn environments on/off for all projects
- Will be allowed to update and remove environments.
- Will be allowed to create new environments.

## Rollout Plan

- **Unleash v4.2** will provide _early access_ to environment support. This means that it can be enabled per customer via a feature flag.
- **Unleash v4.3** plans to provide general access to the environment support for all users of Unleash (Open-Source, Pro, Enterprise).
