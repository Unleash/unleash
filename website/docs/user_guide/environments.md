---
id: environments
title: Environments
---

<div class="alert alert--info" role="alert">
  Environment is a new feature currently under beta. It can be enabled from <i>Unleash v4.2.x</i> with a feature toggle. We plan to make the environment feature general available from <i>Unleash v4.3.x</i>.
</div>
<br />


<div style={{position: 'relative', paddingBottom: '56.25%', height: '0'}}>
    <iframe src="https://www.loom.com/embed/95239e875bbc4e09a5c5833e1942e4b0" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: 'absolute', top: '0', left: '0', width: '100%', height: '100%'}}></iframe>
</div>

Environments is a new way to organize activation strategy configurations for feature toggles into separate environments. In Unleash a feature lives across all your environments, after all, the goal is to get the new feature released as soon as possible. But it makes sense to configure the activation differently per environment. You might want the feature enabled for everyone in development, while only enable it for yourself in production.

Unleash Enterprise users have been able to leverage strategy constraints to control the roll-out per environment. This will not be needed after the release as a "full group" of activation strategy will belong to an environment. 

Connected applications will also use environment scoped API keys, to make sure they only download feature toggle configurations for the environment they are running in.

Metrics has also been upgraded to record the environment, so that Unleash now can display the usage metrics per environment. 



![Environments Overview](/img/environments_overview.svg "A feature toggle exists across all environments, but take different activation strategies per environment.")


## How to start using environments

In order to start using environments you need to be on Unleash v4.2. You also need to have the environment feature enabled (if you are using Unleash Hosted, please reach out on [contact@getunleash.io](mailto:contact@getunleash.io) if you want to start using environments. 

### Step 1: Enable new environments for your Project

Navigate to the project and choose the “environments” tab. 




![Configure environment for this project](/img/environments_configure.png "Configure environment for this project")


### Step 2: Configure activation strategies for the new environment

From the “feature toggle view” you will now be able to configure activation strategies per environment. 



![Add strategy configuration per environment](/img/environments_strategies.png "Add strategy configuration per environment")


### Step 3: Create environment specific API keys

In order for the SDK to download the feature toggle configuration for the correct environment you will need to create an API token for a defined environment. 



![Create Environment specific API Keys](/img/environments_api_keys.png "Create Environment specific API Keys")



## Migration

To ease migration we have created a special environment called “default”. All existing activation strategies have been added to this environment. All existing Client API keys has also been scoped to work against the default environment, to ensure zero disruption as part of the upgrade. 

If you today are using strategy constraints together with the “environment” field on the Unleash Context you should be aware that the new environment support works slightly differently. Now the SDK will only download the activation strategies configured for a configured environment. The Unleash SDK API will know which environment to deliver to the SDK because the API token used by the SDK is scoped to a single environment. Because of this you will probably stop using “environment” on the Unleash Context. 



![You will not use strategy constraints for environments any more.](/img/environments_strategy_constraints.png "You will not use strategy constraints for environments any more.")



### Addons

We have slightly changed the events related to working with feature toggles. This means that you would need to change your addon configuration to also subscribe for the new events to not miss updates:

**Deprecated events:**
* **FEATURE_UPDATE** - _not used after switching to environments_

**New Events**
* **FEATURE-METADATA-UPDATED** - The feature toggle metadata was updated (across all environments). 
* **FEATURE-STRATEGY-ADD**¹ - An activation strategy was added to a feature toggle in an environment. The _data_ will contain the updated strategy configuration.
* **FEATURE-STRATEGY-UPDATE**¹ - An activation strategy was updated for a feature toggle. The _data_ will contain the updated strategy configuration.
* **FEATURE-STRATEGY-REMOVE**¹ - An activation strategy was removed for a feature toggle. 
* **FEATURE-ENVIRONMENT-ENABLED**¹ - Signals that a feature toggle has been _enabled_ in a defined environment. 
* **FEATURE-ENVIRONMENT-DISABLED**¹ - Signals that a feature toggle has been _disabled_ in a defined environment. 
* **FEATURE-PROJECT-CHANGE**¹ - The feature toggle was moved to a new project. 

> 1) These feature events will contain _project_ and _environment_ as part of the even metadata.

### API 


In order to support configuration per environment we had to rebuild our feature toggle admin API to account for environments as well. This means 



* **/api/admin/features** - _deprecated (scheduled for removal in Unleash v5.0). The [old feature toggles admin API](https://docs.getunleash.io/api/admin/features) still works, but strategy configuration will be assumed to target the “default” environment._
* **/api/admin/projects/:projectId/features** - New feature API to be used for feature toggles which also adds support for environments. See [the documentation](https://docs.getunleash.io/api/admin/feature-toggles-v2) to learn more. 


## Plan Differences


### Open-Source (free)



* Will get access to two pre-configured environments: “development” and “production”. Existing users of Unleash will also get an additional “default” environment to simplify adoption of environments.  
* Will be possible to turn environments on/off for all projects. 


### Pro (commercial)



* Will get access to two pre-configured environments: “development” and “production”. Existing users of Unleash will also get an additional “default” environment to simplify the adoption of environments.  
* Will be possible to turn environments on/off for the default project. 


### Enterprise (commercial)



* Will get access to two pre-configured environments: “development” and “production”. Existing users of Unleash will also get an additional “default” environment to simplify the adoption of environments.  
* Will be possible to turn environments on/off for all projects
* Will be allowed to update and remove environments.
* Will be allowed to create new environments.


## Rollout Plan



* **Unleash v4.2** will provide _early access_ to environment support. This means that it can be enabled per customer via a feature flag. 
* **Unleash v4.3** plans to provide general access to the environment support for all users of Unleash (Open-Source, Pro, Enterprise). 


### Future enhancements

With improved environment capabilities we have also done the groundwork to be able to also improve other related aspects inside Unleash:



* Improve **Usage Metrics **to be able to show usage and evaluation results per hour for multiple days with dimensions such as environment, application and time (per hour). 
* Improve **RBAC** with the ability to limit who can change configuration for a specific environment (planned as an enterprise feature). 