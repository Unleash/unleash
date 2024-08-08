---
title: Change Requests
---

import VideoContent from '@site/src/components/VideoContent.jsx';

:::info Availability

The change requests feature is an enterprise-only feature that was introduced in **Unleash 4.19.0**.
The change requests for segments was introduced in **Unleash 5.4.0**.

:::


<VideoContent videoUrls={["https://www.youtube.com/embed/ENUqFVcdr-w"]}/>


Feature flagging is a powerful tool, and because it's so powerful, you sometimes need to practice caution. The ability to have complete control over your production environment comes at the cost of the potential to make mistakes in production. Change requests were introduced in version 4.19.0 to alleviate this fear. Change requests allow you to group changes together and apply them to production at the same time, instead of applying changes directly to production. This allows you to make multiple changes to feature flags and their configuration and status (on/off) all at once, reducing the risk of errors in production.

Our goal is developer efficiency, but we also recognize that we have users and customers in highly regulated industries, governed by law and strict requirements. Therefore, we have added a capability to change requests that will allow you to enforce the _4 eyes principle_.

## Change request configuration

The change request configuration can be set up per project, per environment. This means that you can have different change request configurations for different environments, such as production and development. This is useful because different environments may have different requirements, so you can customize the change request configuration to fit those requirements. However, this also means that you cannot change flags across projects in the same change request.

Currently there are two configuration options for change requests:
* **Enable change requests** - This is a boolean value that enables or disables change requests for the project and environment.
* **Required approvals** - This is an integer value that indicates how many approvals are required before a change request can be applied. Specific permissions are required to approve and apply change requests.

The change request configuration can be set up in the project settings page:

![Change request configuration](/img/change-request-configuration.png)


## Change request flow

Once a change request flow is configured for a project and environment, you can no longer directly change the status of a flag. Instead, you will be asked to put your changes into a draft. The change request flow handles the following scenarios:

* Updating the status of a flag in the environment
* Adding a strategy to the feature flag in the environment
* Updating a strategy of a feature flag in the environment
* Deleting a strategy from a feature flag in the environment

The flow can be summarized as follows:

![Change request flow](/img/change-request-flow.png)

Once a change is added to a draft, the draft needs to be completed before another change request can be opened. The draft is personal to the user that created the change request draft, until it is sent for review. Once changes are added to draft, the user will have a banner in the top of the screen indicating that a draft exists. The state of a change request can be one of the following:

* **Draft** - The change request is in draft mode, and can be edited by the user that created the draft.
* **In review** - The change request is in review mode, and can be edited by the user that created the draft. If editing occurs, all current approvals are revoked
* **Approved** - The change request has been approved by the required number of users.
* **Scheduled** - The change request has been scheduled and will be applied at the scheduled time (unless there are conflicts, as described in the section on [scheduling change requests](#scheduled-changes)).
* **Applied** - The change request has been applied to the environment. The feature flag configuration is updated.
* **Cancelled** - The change request has been cancelled by the change request author or by an admin.
* **Rejected** - The change request has been rejected by the reviewer or by an admin.

![Change request banner](/img/change-request-banner.png)

Once a change request is sent to review by the user who created it, it becomes available for everyone in the change request tab in the project.

From here, you can navigate to the change request overview page. This page will give you information about the changes the change request contains, the state the change request is in, and what action needs to be taken next.

![Change request banner](/img/change-request-overview.png)

From here, if you have the correct permissions, you can approve and schedule or apply the change request. Once applied, the changes will be live in production.

### Scheduled changes

:::info Availability

Change request scheduling was released in Unleash 5.10.

:::

When a change request is approved, you can schedule it to be applied at a later time. This allows you to group changes together and apply them at a time that is convenient for you, such as during a maintenance window, or at a time when you know there will be less traffic to your application.

Scheduled changes can be rescheduled, applied immediately, or rejected. They can not be edited or moved back to any of the previous states.

When a scheduled change request is applied, the person who scheduled it and the person who created it will each receive a notification.

#### Conflicts

If a change request contains changes that affect a flag that has been archived or a strategy that has been deleted, the change request can not be applied. Unleash will warn you ahead of time if you make changes that conflict with a scheduled change request.

Further, if a strategy, project segment, or [environment-level variant](feature-toggle-variants.md) configuration that is updated in a scheduled change request is updated before the scheduled application time (for instance by a different change request being applied or by updates that circumvent the change request flow), Unleash will suspend the scheduled change request.

The reason for this is that the scheduled change request would overwrite the recent changes made to the strategy, segment, or environment variants. This could cause unwanted changes to occur, so we require you to take manual action.

If a change request has been suspended because a strategy, segment, or environment-level variant configuration has been updated, you can still reschedule, apply, or reject the change request. Any of these actions will put the change request back into the regular flow. You **cannot** edit the changes of a scheduled change request, so if you want to include the recent changes with the changes in your scheduled change request, you will need to create a new change request.

Again, please be aware that if a strategy, segment, or environment variants affected by a scheduled change request are updated after the change request was scheduled, the application of the scheduled change request will overwrite those changes with the state in the scheduled change request.

If you make one of the changes mentioned in this section, Unleash send out emails to the change request author and to the person who scheduled the change request, letting them know what has happened.

#### Application failure

If Unleash fails to apply a scheduled change request, the change request will remain in the scheduled state. You can reschedule it and try to apply it again later, or you can reject it. Note that if a strategy in the change request has been deleted or a flag has been archived, the change request can not be applied, so rescheduling it will not help. In these cases, you can either reject the change request, or if the flag has been archived, revive the flag and reschedule it.

If a scheduled change request can not be applied, Unleash will send a notification to the person who scheduled it and to the person who created the change request.

#### Edge cases: what happens when ...?

If the user who scheduled a change request is deleted from the Unleash users list before the scheduled time, the changes will **not** be applied. Instead, the schedule will be put into a special **suspended state**. A change request with suspended schedule will not be applied at its scheduled time. A user with the required permission can reschedule, apply, or reject the change request. Any of these actions will put the change request back into the regular flow.

If a change request has been scheduled and change requests are then disabled for the project and environment, the change request **will still be applied** according to schedule. To prevent this, you can reject the scheduled change request.


#### Different ways to schedule changes

Unleash currently offers two distinct ways to schedule changes. Each method has its own pros and cons, and you can also combine the methods for maximum flexibility.

The first method is through scheduled change requests, as we have explained in the preceding sections. Scheduled change requests make it easy to see all the changes across multiple flags and strategies in one view and makes it easy to reschedule or reject them. However, because scheduled changes rely on flags and strategy configurations, conflicts can arise causing the schedule to fail.

The second method uses Unleash's [constraints](strategy-constraints.md) and the [DATE_AFTER operator](strategy-constraints.md#date-and-time-operators) to encode when changes should take effect. The pros of this method is that because these changes can be applied immediately, you won't run into any conflicts when they happen. The cons are that you'll need to apply the same constraints to all the parts that you want to change and that there is no easy way to see all the changes in one view. You also can not scheduled changes to a segment in this way. When using this option, we recommend that you use [segments](segments.mdx) if you want to schedule multiple changes, so that their application time stays in sync.

Another important distinction is how these changes affect your connected SDKs. If you use constraints (or segments), then any connected SDK will be aware of the schedule ahead of time. That means that even if the SDK can not connect to Unleash at the scheduled time, it will still activate the changes because it's encoded in its constraints. On the other hand, if you use change requests to schedule changes, SDKs **must** update their configuration after the scheduled time to be aware of the changes.

## Change request permissions

Change requests have their own set of environment-specific permissions that can be applied to [custom project roles](rbac.md#custom-project-roles). These permissions let users

- approve/reject change requests
- apply change requests
- skip the change request flow

None of the predefined roles have any change request permissions, so you must create your own project roles to take advantage of change requests. In other words, even a user with the project "owner" role can not approve or apply change requests.

There is no permission to create change requests: **Anyone can create change requests**, even Unleash users with the [root viewer role](rbac.md#predefined-roles). Change requests don't cause any changes until approved and applied by someone with the correct permissions.

You can prevent non-project members from submitting change requests by setting a [protected project collaboration mode](project-collaboration-mode.md).

### Circumventing change requests

The **skip change requests** permission allows users to bypass the change request flow. Users with this permission can change feature flags directly (they are of course still limited by any other permissions they have).

The skip change requests permission was designed to make it possible to quickly turn something off in the event that a feature release didn't go as expected or was causing issues.

The skip change requests permission does **not** grant any other permissions, so to be allowed to do things as enabling/disabling a flag, the user will still need the explicit permissions to do that too.

In the UI non-admin users with **skip change requests** permission and explicit permission to perform the actual action will be able to make changes directly without change requests.

Admin users will always see the change request UI so that they can test the change request flow. Admin users can however self-approve and self-apply their own changes.

## Change Request for segments

Changes to project [segments](segments.mdx) (as opposed to global segments) also go through the change request process. This is to prevent a backdoor in the change request process.

Since projects segments are not environment specific and change requests are always environment specific we allow to attach segment change to any environment with change requests enabled.
When you make changes though the Change Request UI it will automatically select first environment with change requests enabled, giving priority to [production](environments.md#environment-types) environments.

Changes to segments can be only circumvented by admin users through the API calls.

## Change Request Preview Playground

To verify that a change request is correct, you can preview the result of change request's application in a change request  [playground](playground.mdx). 

![Change request preview](/img/change-request-preview.png)

From the change request overview page, go to the corresponding [playground](playground.mdx) and evaluate all your flags in the project and environment that your change request applies too.

![Change request playground evaluation](/img/change-request-playground-evaluation.png)

[Unleash context](playground.mdx#the-unleash-context) can be adjusted in the same way as in a regular playground, but the project and environment cannot be changed as they are derived from the change request itself.
Once the evaluation results confirm the changes in your change request are correct, go back to the change request overview and proceed with the approval or rejection.


Change request preview simulates the application of changes in a non-persistent transaction. 
You still need to apply the changes to persist them for the SDKs to see the changes.
A change request can only be previewed when the change request is In Review, Approved, or Scheduled. 
It cannot be previewed when the change request is in Draft, Applied, Cancelled, or Rejected status.


Change request preview does not require special permissions like approve/reject change requests or apply change requests. 
It allows more users to provide feedback on the correctness of the changes.
