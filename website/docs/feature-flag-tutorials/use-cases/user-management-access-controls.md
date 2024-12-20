---
title: How to Implement User Management, Access Controls, and Auditing with Feature Flags
slug: /feature-flag-tutorials/use-cases/user-management-access-controls-auditing
---

Feature flags are a game-changer for how software teams build, test, and release products. They enable you to roll out new features with confidence, manage risk, and keep your software development agile and secure.

Imagine a large banking platform company with hundreds of engineering teams across multiple continents. Their software development lifecycle is complex and dynamic. Feature flags simplify their processes, but managing all those users are an additional layer of complexity. Unleash solves this with user management capabilities, role-based access control, and auditing features to help organizations release code with confidence while maintaining security and compliance.

In this tutorial, you will:

-   Integrate with identity providers for single sign-on (SSO)
-   Disable password-based login
-   Automate user management with the SCIM protocol
-   Configure role-based access control (RBAC)
-   Audit access and system changes related to feature flags

## Implement single sign-on for enterprise identity integration

When an enterprise like a global banking platform considers implementing feature flags, keeping track of who can access your feature flag platform and handling authentication is critical. Traditional username and password approaches are insecure and [shared accounts pose a security risk](/blog/stop-sharing-accounts).

To ensure proper user authentication and reduce risk exposure, Unleash provides [single sign-on](/how-to/sso) as the recommended centralized method for managing user access.

Unleash supports any SSO option through OpenID Connect or SAML 2.0, including identity providers like Okta, Microsoft Entra ID, and Google Keycloak to create a unified authentication process.

To configure SSO, navigate to **Admin > Single sign-on** in the Unleash Admin UI.

![In Unleash's Single Sign-On page, there are four tabs to set up Open ID Connect, SAML 2.0, traditional passwords, and SCIM.](/img/use-case-user-mgmt-saml.png)

When you connect Unleash to your identity provider, user groups are no longer managed manually. Instead, the synchronization process becomes an automated, dynamic workflow that instantly reflects organizational changes. Follow our step-by-step guide to set up [user group syncing](/how-to/how-to-set-up-group-sso-sync).
With SSO integration, groups defined in your identity provider are directly mapped to Unleash access groups. This means:

-   New team members are automatically assigned correct permissions.
-   Organizational restructures are reflected immediately.
-   Consistent access controls across all enterprise systems.

By integrating Unleash with these systems, organizations can ensure that every engineer accessing feature flags undergoes a rigorous, centralized authentication process. These integrations ensure a transparent, auditable system where every access can be traced, logged, and validated.

### Disable password-based authentication

Password-based logins and sharing user accounts among team members at your organization increase the risk of unauthorized access, violate compliance requirements for auditability, can lead to overexposure of sensitive data, and complicate incident responses with inaccurate event log data ([Kwaśniewski, _Stop Sharing Accounts_](https://www.getunleash.io/blog/stop-sharing-accounts)).

To mitigate these issues, we recommend you disable password-based authentication for your team members administering Unleash.

In your **Single sign-on** view, click on the **Password** tab, turn the **password based login** toggle off and click **Save**.

![The password tab has a toggle that you can turn off.](/img/use-case-user-mgmt-disable-password-login.png)

We recommend you migrate completely from password-based authentication to single sign-on to improve your organization's security posture.

## Automate user management at scale

User management at scale is difficult without robust automation. When you’re managing multiple user accounts spread across various teams, projects, and feature flags, it’s difficult and costly to manually track and change user permissions. To solve this, Unleash uses [SCIM (System for Cross-domain Identity Management) protocols](https://scim.cloud/) to help you automatically provision and de-provision user accounts. When an employee joins or leaves your organization, their feature flag access can be automatically adjusted without manual changes.

SCIM takes group synchronization to the next level by providing a standardized protocol for user and group management.
Through SCIM, you can:

-   [Provision and de-provision users](/reference/scim) (team members) as they are joining or leaving your organization.
-   Automatically create and delete user groups.
-   Sync group membership in real-time.
-   Ensure consistent access across multiple platforms.

Enable SCIM protocol in the **Single sign-on > SCIM** tab to generate a new token for your SCIM client.

![Turn the **SCIM provisioning** toggle on to enable SCIM.](/img/use-case-user-mgmt-scim-protocol.png)

Next, set up [Okta provisioning](/how-to/how-to-setup-provisioning-with-okta) or [Microsoft Entra ID provisioning](/how-to/how-to-setup-provisioning-with-entra) using our how-to guides.

This automation creates an access control system that adapts in real-time to organizational changes. Within minutes of joining, a new team member can be granted precisely the right level of access, while departing employees are immediately locked out of sensitive systems.

## Configure role-based access controls

[Role-based access control](/reference/rbac) makes feature flag management a strategic governance tool. Consider a scenario in which a junior developer should never be able to modify critical feature flags in the authentication system within a banking platform. RBAC makes this granular control seamless. We recommend carefully delegating administrative privileges to users based on the needs of their roles within projects and the organization.

In the Unleash Admin UI, go to **Admin > Roles** to view, create, and manage user roles.

![Manage all user roles in the Unleash Admin UI.](/img/use-case-user-mgmt-root-roles.png)

We have 5 [predefined roles](/reference/rbac#predefined-roles) within our RBAC framework at Unleash.

_Root roles_:

1. Admin
2. Editor
3. Viewer

_Project roles_:

1. Owner
2. Member

Assign users with root roles to configure entire systems. These users can perform any operation within the Unleash platform and change permissions for other users when they belong to a specific user group.

Assign other users to project roles to have domain-specific control within a specific project maintained in Unleash.

Project permissions are separated from root permissions to make it even more targeted regarding what permissions someone can and cannot have for each piece of Unleash. Assign developers with creation and modification rights and viewers who can observe but not change.

For more fine-tuned access controls, create [custom root roles](/how-to/how-to-create-and-assign-custom-root-roles) and [custom project roles](/how-to/how-to-create-and-assign-custom-project-roles), where you can define the privileges and limitations beyond the predefined roles we have built into Unleash.

### Extend RBAC with a change management workflow

While RBAC allows you to administer Unleash safely, you might need approval processes when changing feature flags or their configuration. When multiple teams are working on complex systems, [change requests](/reference/change-requests) provide a systematic approach to:

-   **Comprehensive review**: Every proposed feature flag modification goes through a review, reducing the likelihood of unintended consequences.
-   **Audit trail**: Every change is documented, timestamped, and attributed to specific team members, creating a permanent record of system modifications.
-   **Four-eyes approval workflows**: Multi-stage approval processes ensure critical changes are thoroughly reviewed and approved by at least 2 other people before implementation.
-   **Compliance requirements**: For regulated industries like finance and healthcare, Change Requests provide the detailed documentation necessary to meet strict compliance standards.

![Change requests are divided between two tabs: open and closed change request lists with relevant metadata listed per request.](/img/use-case-user-mgmt-change-requests.png)

Imagine a large banking application where a development team wants to modify a feature flag controlling a new authentication method. Instead of a developer making an immediate change, the change request workflow might require:

1. Initial proposal submission
2. Security team review
3. Compliance officer approval
4. Final sign-off from technical leadership

![This GIF shows how to quickly make changes to your flag, request the change, approve it, and apply the changes.](/img/use-case-user-mgmt-cr.gif)

This process ensures that even minor feature flag changes go through rigorous evaluation.

## Implement effective auditing in Unleash

For enterprise organizations, auditing is a critical component to various aspects of the software development lifecycle. Audit logs for feature flag management can be part of your overall security and compliance process, which provides a comprehensive view of every action taken within the feature flag management system. Use [Unleash's auditing capabilities](/reference/events) to track critical information for every significant system interaction:

### Auditing user actions

-   Detailed logs of user authentication attempts
-   Feature flag creation, modification, and deletion
-   Changes to project configurations
-   Role and permission modifications
-   Environment-specific flag updates

### Metadata tracking

-   Precise timestamps for each action
-   User identity (including email and user ID)
-   Source IP address
-   Specific system components affected
-   Detailed context of each change

The process begins with configuring robust log retention. Financial and healthcare organizations typically require extensive log preservation, maintaining detailed records for up to seven years. For most enterprise environments, a three-year retention period provides a balance between compliance and operational efficiency.

In your **Projects** view, click on your project and select the **Event log** tab to get a comprehensive list of events.

![This event log captures a change request cancellation, the user who performed the cancellation, and other metadata.](/img/use-case-user-mgmt-event-log.png)

Unleash supports multiple log export formats, including JSON and CSV, for integration with enterprise reporting and analytics tools. This flexibility allows security teams to transform raw audit logs into meaningful insights about system usage, user behaviors, and potential security risks.

Here’s an example of an audit log entry in JSON format:

```json
{
    "timestamp": "2024-03-15T14:22:11Z",
    "user": {
        "id": "user-123",
        "email": "jane.developer@company.com"
    },
    "action": "feature_flag_updated",
    "details": {
        "flag_name": "payment-gateway-experiment",
        "previous_state": "enabled",
        "new_state": "disabled",
        "environment": "production"
    },
    "source_ip": "192.168.1.100"
}
```

The most advanced implementations integrate Unleash audit logs directly into broader Security Information and Event Management (SIEM) systems. This enables real-time monitoring and creates a holistic view of system interactions across multiple platforms. By correlating Unleash audit data with other enterprise security logs, organizations can detect subtle patterns and potential security anomalies that might go unnoticed in isolated systems.

By implementing intelligent, automated, and granular access controls, organizations can create a secure foundation for continuous delivery at scale.
