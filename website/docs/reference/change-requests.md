---
title: Change requests
---

:::info

The change requests feature was introduced in **Unleash 4.18.0**, and is currently an enterprise only feature in beta
with a select few customers. If you're an unleash enterprise customer, please contact us if you'd like to try out this 
feature. 

:::

Feature flagging is a powerful tool, and because it's powerful you sometimes need to practice caution. The ability to have complete control over your production environment comes at the cost of being able to make mistakes in production. Change requests are here to alleviate that fear. Introduced in 4.18.0, you can now group changes in a change request instead of applying them directly to production. This allows you to make changes to multiple feature toggles configuration and status (on/off) grouped together, and applied together at the same time. 

Our goal is developer effeciency, but we also recognize that we have users and customers in highly regulated industries, governed by law and strict requirements. Therefore, we have added a capability to change requests that will allow you to enforce the _4 eyes principle_.

## Change request configuration

The change request configuration can be set up per project, per environment. This means that you can have different change request configurations for different environments. This is useful if you have different requirements for different environments, for example production and development. The implication of this is that you can't change toggles across projects in the same change request.

Currently there are two configuration options for change requests:
* **Enable change requests** - This is a boolean value that enables or disables change requests for the project and environment.
* **Required approvals** - This is an integer value that indicates how many approvals are required before a change request can be applied. Specific permissions are required to approve and apply change requests.

The change request configuration can be set up in the project settings page: 

![Change request configuration](/img/change-request-configuration.png)


## Change request flow

Once a change request flow is configured for a project and environment, you can no longer directly change the status of a toggle. Instead, you will be asked to put your changes into a draft. The change request flow handles the following scenarios: 

* Updating the status of a toggle in the environment
* Adding a strategy to the feature toggle in the environment
* Updating a strategy of a feature toggle in the environment
* Deleting a strategy from a feature toggle in the environment

The flow can be summarized as follows:

![Change request flow](/img/change-request-flow.png)

Once a change is added to a draft, the draft needs to be completed before another change request can be opened. The draft is personal to the user that created the change request draft, until it is sent for review. Once changes are added to draft, the user will have a banner in the top of the screen indicating that a draft exists. The state of a change request can be one of the following: 

* **Draft** - The change request is in draft mode, and can be edited by the user that created the draft.
* **In review** - The change request is in review mode, and can be edited by the user that created the draft. If editing ocurrs, all current approvals are revoked
* **Approved** - The change request has been approved by the required number of users.
* **Applied** - The change request has been applied to the environment. The feature toggle configuration is updated.
* **Cancelled** - The change request has been cancelled by the user/admin.

![Change request banner](/img/change-request-banner.png)

## Project roles

## API Access

