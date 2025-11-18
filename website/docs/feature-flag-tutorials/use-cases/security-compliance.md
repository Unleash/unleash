---
title: Feature flag security and compliance for enterprises
slug: /feature-flag-tutorials/use-cases/security-and-compliance
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="high" />

Security and compliance are important aspects of building and managing complex software in large enterprises. For software architects, engineering leaders, and technical decision-makers, every tool in your tech stack needs to pass security reviews. The weakest link in your software bill of materials, known as the SBOM, can be the one that compromises your security, so every dependency and integration must meet strict standards. Security isn't just about individual components—it’s about the entire system working together without introducing risk.

In the modern security landscape, compliance frameworks like FedRAMP, SOC 2, and ISO 27001 set strict standards for proving good security posture in your software tool implementations. Feature flag management systems are no exception.

It’s easy to think, “_Feature flags are just if statements_,” but managing them at scale is far more complex—especially when security and compliance are on the line. What happens if an unauthorized user turns a flag on or off in production, even if by accident? Will that jeopardize your SOC 2 certification? A homegrown feature flag solution, often built for convenience, rarely has the robust access controls, audit logs, and data protection measures of a purpose-built system with contributions from hundreds of developers and security experts. When compliance and security are requirements, not afterthoughts, the right tooling makes all the difference.

There are several steps to ensuring your feature flag implementation is audit-proof. In this guide, we will walk through how Unleash Enterprise features can be combined to demonstrate good security posture and compliance for your organization. You will:

1. [Understand regulatory compliance frameworks in enterprise security audits](#introduction-to-regulatory-compliance-frameworks)
2. [Enable authentication controls with SSO and SCIM](#enable-authentication-controls-with-sso-and-scim)
3. [Configure role-based access control for administrators and developers](#configure-role-based-access-control-for-administrators-and-developers)
4. [Set up access controls for network security](#set-up-access-controls-for-network-security)
5. [Use a change management workflow for auditing](#use-a-change-management-workflow-for-auditing)
6. [Audit manual and automated events in Unleash](#audit-manual-and-automated-events-in-unleash)
7. [Learn how Unleash as a software product passes rigorous security audits and penetration testing](#can-unleash-itself-pass-a-security-audit)
8. [Implement best practices and recommendations](#best-practices-and-recommendations)

## Introduction to regulatory compliance frameworks​

Unleash is designed to support critical enterprise compliance standards. In this guide, we reference three frameworks that organizations in highly regulated industries are most likely to be audited against:

[FedRAMP](/using-unleash/compliance/fedramp): A U.S. government program that standardizes how federal agencies assess, authorize, and monitor cloud services. For organizations listing their software on the [FedRAMP](https://www.fedramp.gov) marketplace, Unleash's security controls are designed to meet these rigorous requirements.

[SOC 2 Type II](/using-unleash/compliance/soc2): A cybersecurity framework that assesses how organizations protect customer data. Our architecture provides the necessary controls and audit trails to meet stringent SOC 2 requirements, ensuring your feature flag management processes are transparent, secure, and verifiable.

[ISO 27001](/using-unleash/compliance/iso27001): A framework from the [International Organization for Standardization (ISO)](https://www.iso.org/standard/27001) for managing information security within an organization. Our security, audit, and change control capabilities align with ISO 27001 standards, providing a structured approach to managing sensitive information and protecting data integrity.

Refer to our [security and compliance overview](/using-unleash/compliance/compliance-overview) for more details on how Unleash features measure up against these framework requirements.

## Enable authentication controls with SSO and SCIM

The first step to securely administering your feature flag system is to consider the authentication process. When you’re using Unleash, how should your team members access the platform UI? We have multiple ways for users to log into the platform, including traditional, password-based login. But when you’re considering the best approach to using feature flags in your development process, you need to consider how every access point to your projects, data, and development processes could pose a security risk for your organization. To demonstrate that your tools are configured with security and compliance in mind, we recommend you enable enterprise-grade authentication controls as your first line of defense.

Your developers and other stakeholders need to securely access platforms used to build and ship software to production. At Unleash, we support industry-standard authentication methods such as [single sign-on](/reference/sso) with multi-factor authentication and [SCIM](/reference/scim) protocols. These authentication controls are the de facto ways for you to integrate enterprise-grade security measures easily. Let’s take a closer look at each authentication option you can use.

### Use SSO authentication for feature flags

To use single sign-on in Unleash, your users can authenticate themselves through OpenID Connect (OIDC) or SAML 2.0 protocols.

We have integration guides to connect Unleash to enterprise identity providers like Okta, Microsoft Entra ID, and Keycloak, but you can use any identity provider that uses OIDC or SAML 2.0 protocol. Read our [how-to guide for single sign-on](/how-to/how-to-add-sso-open-id-connect).

![A diagram showing how Unleash integrates with authentication providers and identity providers.](/img/sso-idp-auth-provider.jpg)

For larger teams, we [recommend that you also configure SCIM](#use-scim-to-automate-user-management-at-scale) for additional flexibility and scalability.

By using SSO with Unleash, your organization can prove that every engineer accessing feature flags undergoes a centralized, unified authentication process. How do you translate this into something verifiable and auditable for security reviews? What’s great is that [every authentication event in Unleash is logged](#leverage-access-logs-for-broader-auditing) with detailed metadata including timestamp, IP address, and authentication method used, providing audit trails when you undergo security reviews. This shows you have a transparent, auditable system where every access can be traced, logged, and validated. So not only are you meeting compliance standards with authentication controls in place, but Unleash also automatically maintains a record for you that proves it.

### Use SCIM to automate user management at scale

Let’s consider another scenario. You are not setting up feature flag access for 10 users, but 100 or 1000 users. When these users are spread across various teams with access to different projects at various permission levels, how do you manage this effectively while maintaining a security-first approach?

User management at scale is difficult without automation. It’s also costly to manually track and change all user permissions over time.

To solve this, Unleash uses [SCIM protocols (System for Cross-domain Identity Management)](https://scim.cloud/) to help you automatically provision and de-provision user accounts. When an employee joins or leaves your organization, their feature flag access can be automatically adjusted without manual changes. You won’t have to consider all the security implications of user accounts as your teams evolve. Unleash handles that for you.

By enabling [SCIM](/reference/scim) in Unleash, you can:

-   Provision and de-provision users (team members) as they are joining or leaving your organization.
-   Automatically create and delete user groups.
-   Sync group membership.
-   Ensure consistent access across multiple platforms.

To unlock these benefits, set up [SCIM for automatic provisioning using our how-to guides](/how-to/how-to-setup-provisioning-with-okta).

## Configure role-based access control for administrators and developers

Now that you understand how Unleash handles authentication securely, let’s explore what needs to happen once your teams have access to the platform. When enterprise auditors evaluate software tools and development practices, they focus intensely on access control mechanisms.

Consider this scenario: your company is undergoing its annual security audit, and the auditors are specifically examining how feature flags are managed across their software development lifecycle. Without role-based access controls (RBAC), this company would face significant compliance risks and potential security vulnerabilities.

[Role-based access control](/reference/rbac) allows for fine-grained permission management so team members can only access and modify feature flags relevant to their specific roles and responsibilities. During an audit, you'll most likely face questions about your access control systems and security measures. Here’s what auditors will want to see:

-   Only authorized personnel can modify feature flags in production.
-   All the access control changes are tracked and documented.
-   An approval chain is in place to change critical features.
-   Sensitive projects remain visible only to appropriate teams and/or project owners.

Unleash is built with many mechanisms in place to handle all of these scenarios. Our systems enforce strict separation of duties, for example, where developers can create and test flags in development environments, while only senior engineers can promote changes to staging and production.

-   We leave audit trails, automatically [logging every permission change](#audit-manual-and-automated-events-in-unleash) with detailed user information and timestamps.
-   You can set up [approval guardrails](#use-a-change-management-workflow-for-auditing) for feature flag updates.
-   [Project isolation](/reference/project-collaboration-mode) ensures sensitive projects remain hidden from unauthorized users, while teams can only access projects relevant to their work, maintaining clear boundaries between different business units' feature flags.

Let’s look at how Unleash gives you complete control over user roles and permissions. At a high level, there are multiple [predefined roles](/reference/rbac#predefined-roles) in Unleash for you to get started with. Root roles control permissions to top-level resources, spanning across all projects. Project roles, on the other hand, control permissions for a project, the feature flags, and individual configurations per environment.

The three predefined root roles are: Admin, Editor, and Viewer. The predefined project roles are Owner and Member. In addition to these, you can also create [custom root roles](/reference/rbac#create-and-assign-a-custom-root-role) or [project roles](/reference/rbac#create-and-assign-a-custom-project-role). The following diagram provides a visual overview of how root roles and project roles compare.

![The diagram showing the relationship between root roles and project roles in Unleash.](/img/root-and-project-roles-comparison.jpg)

One of the key responsibilities of the Admin role is assigning users as project Owners and Members. You can also automate this process within your organization by using [Terraform](/reference/terraform).

For security best practices, we recommend following the principle of least privilege by assigning users the Viewer role or a custom root role with minimal permissions. From there, specific project-level permissions can be granted as needed.

Unleash can handle all of the complexities that come with access controls and we make that process simple for you. Set up roles and permissions so you’re not only in complete control of how your feature flag system is administered, you’re adhering to compliance standards. For more recommendations on setting up permissions for users, read our guide on [using feature flags at scale](guides/best-practices-using-feature-flags-at-scale).

Next, we’ll explore how to extend access controls in Unleash for network security.

## Set up access controls for network security

Securing your network layer is non-negotiable for building and using software systems. It’s foundational knowledge and good practice for any organization with engineering teams deploying software. Now that you understand how to set up and manage users at scale in Unleash, you can begin configuring Unleash in your applications and services [using our SDKs](/reference/sdks#official-sdks).

Using the Admin UI is an easy, direct way to make changes to your feature flags, projects, rollout strategies, and more. But when you’re making calls to our frontend API from your services, you can update cross-origin resource sharing (CORS) settings to control application access to Unleash. To further restrict access, Unleash also supports [IP allow lists](#set-up-ip-allow-lists-for-enhanced-security).

### Set up CORS policies for Frontend API security

It was noted in [the previous section](#configure-role-based-access-control-for-administrators-and-developers) that access controls are about security measures in place at every entry point to your systems. This means they go beyond just user management. Extend these controls to [Frontend APIs](/reference/api/unleash/frontend-api) to prevent security risks across your stack.

Most modern browsers enforce cross-origin resource sharing (CORS) restrictions, preventing connections to other domains unless explicitly allowed. In Unleash, you can define cross-origin resource sharing (CORS) policies to prevent unwarranted access to your feature flag system. This not only ensures compliance with browser security requirements but also reinforces a multi-layered security approach within your organization.

![An image of a CORS section in Unleash Admin UI for adding domains that can connect to Unleash Frontend API.](/img/use-case-security-cors.png)

In the Unleash Admin UI, we have a cross-origin resource sharing (CORS) section with a form so you can list domains that will be allowed to call our Frontend API. This is an access control mechanism that gives you control over which domains interact with Unleash. Different CORS policies can be applied to the development, staging/test, and production environments you configure.

By default, this CORS origin list includes an asterisk (\*), meaning that any domain can access your Unleash Frontend API. You can edit this form to include only _your_ specific domains.

### Set up IP allow lists for enhanced security

Enhance your network security with IP allow lists, which give your organization access control based on specific network parameters. This feature restricts all access to Unleash to only be used by certain IP addresses. For example, if you’re using company VPNs or servers, you can add those IP addresses to the list to ensure they can access Unleash.

If you need to update or review your allow list configuration, contact [Unleash support](https://www.getunleash.io/support).

Next, we’ll explore change management as an important tool to further enhance access control mechanisms and make your workflows auditable.

## Use a change management workflow for auditing

Engineers typically go through a development workflow where they write code, submit their code changes for review, get explicit approval from other engineers, and merge their approved changes into the main branch. This occurs in a version control system like Git/Github. In the context of feature flag management, this approach is similar to how you can submit [change requests](/reference/change-requests) in Unleash to make updates to resources in your projects across your environments. To get the most out of this functionality, we recommend you use change requests for your production environment to require explicit approval from at least one approver on your team. This is known as the [four-eyes principle](https://www.unido.org/overview-member-states-change-management-faq/what-four-eyes-principle). However, you can add up to 10 approvers to a submitted change request if multiple stakeholders are involved.

Think of change requests as _more_ than just a tool to sign off on what’s happening in your feature flag system. It’s a way to ensure multiple layers of security for your teams.

For large organizations in highly regulated industries, it’s important to have a second pair of eyes validating a change. When your team members are using Unleash, consider that while some users have permission to modify flags, you can still put guardrails in place to approve or deny the changes.

Imagine a developer working at a large banking platform who wants to modify a feature flag controlling a new authentication method. Instead of making a change directly in production, the [change request](/reference/change-requests) workflow could require:

1. Initial proposal submission
2. Security team review
3. Compliance officer approval
4. Final sign-off from technical leadership

With Unleash, you can create a change request workflow to reflect these exact requirements.
And from a security perspective, you'll always want an auditable trail of changes that occur in your feature flag system. We record all changes like these in the event logs. These are the configuration management practices required by compliance frameworks like SOC 2, FedRAMP, and ISO 27001. We’ll explore [event logs](#audit-manual-and-automated-events-in-unleash) more in a later section, but it’s important to note throughout this guide since it’s relevant to many features in Unleash that align with security and compliance standards.

Projects in Unleash have an open [collaboration mode](/reference/project-collaboration-mode) by default, which means anyone with access to Unleash can see the project and submit change requests in it. However, only users with specific permissions can approve, apply, or skip them. None of the [predefined roles](/reference/rbac#predefined-roles) have any change request permissions, so you must create [custom project roles](/reference/rbac#predefined-roles). You can adjust the collaboration mode of your project to restrict visibility and limit who can submit change requests.

![This GIF shows how to quickly make changes to your feature flag, request the change, approve it, and apply the changes.](/img/use-case-user-mgmt-cr.gif)

Let’s say a project owner wants to update a rollout strategy so that a new feature will increase from 50% exposure to 100% of your end user base. The change is approved by other team members, but the project owner will need to hold off applying the update in production until components from another team are ready to be released. This is a great use case for [scheduling change requests](/reference/change-requests#scheduled-change-requests), as it allows teams to plan and queue feature flag modifications with precise timing, giving you more control and predictability in a release process.

You could also schedule changes by using the [date and time operators](/reference/activation-strategies#date-and-time-operators) in [strategy constraints](/reference/activation-strategies#constraints). However, when you have change requests configured in the project, we recommend using the schedule feature in change requests, as it is a faster and simpler approach.

For more recommendations, read our section on [change management workflow](/guides/best-practices-using-feature-flags-at-scale#implement-flag-approval-workflows-early) from _Using Feature Flags at Scale_.

Now that we covered change requests as a practical tool for both feature management oversight and good security posture, let’s explore Unleash event logs as an audit logging system for your organization.

## Audit manual and automated events in Unleash

[Event logs](/reference/events) in Unleash are one of the most critical components of maintaining a secure and compliant feature flag system. Unleash administrators and security reviewers will be able to see a detailed list of events that have occurred in your system. From feature flag configuration updates to role-based access control changes, view your logs to get insight into who has performed each action, when, and what was changed as a result. In highly regulated environments, audit logs are useful for:

-   Tracking change management workflows
-   Demonstrating organizational compliance

Highly regulated industries like finance and healthcare typically require extensive log preservation, maintaining detailed records for up to seven years. For most enterprise environments, a three-year retention period provides a balance between compliance and operational efficiency. Unleash provides this insight for your teams and security reviewers in a transparent, detailed, and searchable way. You can also track changes using the global [event timeline](/reference/events#event-timeline) to review recent events for up to 48 hours per environment. Event logs also capture API calls that come in from your applications and services.

In the Unleash Admin UI, go to **Admin settings > Event log** to see chronological events with metadata and change diffs. You can use the filter or the search bar to narrow down specific events you may be looking for. And not only are your events visible in Unleash, they’re also reportable. You can export your events as a CSV or JSON file to send to analytics tools.

### Integrate SIEM for advanced audit compliance

For more advanced implementations, integrate Unleash event logs directly into broader Security Information and Event Management (SIEM) systems. This setup enables real-time monitoring and creates a holistic view of system interactions across multiple platforms. By mapping Unleash audit data to other enterprise security logs, organizations can detect subtle patterns and potential security anomalies that might go unnoticed in isolated systems. You can send your logs to tools like [Datadog](/reference/integrations/datadog), [Sentry](https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/integrations/unleash/), Splunk, S3, and Microsoft Sentinel. SIEM integrations take audit logging to the next level to capture more value out of the data that Unleash provides you.

### Leverage access logs for broader auditing

Let’s think back to the importance of user management that we covered earlier. Developers and other stakeholders go through onboarding to use the platform. Authentication protocols and user provisioning ensure these processes are secure, unified, and automated. During this process, access logs keep track of what users and systems accessed Unleash and what actions they performed, including [Unleash API interactions](/api-overview) from your services and applications. You can export these logs to S3 buckets for long-term data storage. This is valuable if you need to preserve data for complying with legal or regulatory compliance, storing critical backups for disaster recovery, and archiving.

Auditing your feature flag system is made simple for traceability and reportability with Unleash’s event logs and access logs. We recommend leveraging these features as data sources for third-party services that make your data a valuable asset for security reviews, meeting compliance standards, and overall risk mitigation.

Next, we’ll explore data protection measures built into Unleash and how to enhance data privacy with our tools.

## Protect PII for data privacy

Let’s explore Unleash's architectural layers that address data privacy. Our guide on [11 principles for building and scaling feature flag systems](/guides/feature-flag-best-practices), covers best practices for feature flag system implementations, such as protecting personally identifiable information (PII) by implementing the principle of least privilege.

Protecting data is critical within any software tool. It’s a security best practice that is ideally implemented across your tech stack where user data is handled. Unleash is architecturally designed to protect organizations and their end users by keeping data private and limiting the scope of data that is evaluated and stored. Think about the types of sensitive data that could be exposed if you use a feature flag system that isn’t designed to protect data. When feature flags are evaluated, here are examples of what could be at risk:

-   API keys
-   User IDs
-   Email addresses
-   Flag data/configurations
-   User geographical locations

This is a potential attack surface area that you wouldn’t want to be the root of data breaches or unauthorized access in your system. That’s why Unleash was built in a way where integrating feature flags into your services won’t be a weak link in your organization’s ability to ship software safely.

With Unleash, you can architect your feature flagging solution in a way that all user data stays within your applications. When using backend SDKs, user data remains within your application and is never shared with the Unleash server regardless of your setup. For frontend SDKs, you can retain all user data within your applications by either [self-hosting Unleash](/understanding-unleash/hosting-options#), or [self-hosting Unleash Edge](/understanding-unleash/hosting-options#unleash-edge-options). Read more on the [Unleash architecture here](/get-started/unleash-overview).

### Use Unleash Edge for enterprise-grade data privacy

To take scalability, high availability, and resiliency to the next level for large enterprises, we built [Unleash Edge](/reference/unleash-edge)—a lightweight proxy layer that sits between your Unleash API and SDKs. Beyond the performance benefits, Unleash Edge delivers critical enhancements to both security and privacy. 

Deployed within your own infrastructure, Edge ensures that PII and sensitive context data never leave your network, [regardless of which SDKs you use](/get-started/unleash-overview#unleash-sdks). Each Edge instance can be scoped to specific projects or environments, enforcing least privilege access and tight network segmentation.

With Edge, you can keep your core Unleash service hidden from the internet while evaluating feature flags at the edge for better performance and scalability. Unleash Enterprise Edge cannot access the [Unleash Admin API](/get-started/unleash-overview#admin-api), minimizing the impact of compromised clients or credentials. In our cloud-hosted offering, you can also define an [IP allow list](#set-up-ip-allow-lists-for-enhanced-security) for the Unleash instance and Hosted Edge to further reduce the attack surface.

For regulated environments that require continuous availability, you can configure persistent storage—such as Redis or local backup files—to keep feature flag evaluations running, even if the main Unleash server is temporarily unreachable. Learn more about Edge architecture and setup in our [Edge Concepts](/reference/unleash-edge/concepts).

The guide so far has focused on how you can use the features of Unleash to improve your application's security posture, making sure that feature flags are not the weak link. But what about Unleash itself, as a company and SaaS service? You might be asking…

## Can Unleash itself pass a security audit?

Yes, absolutely! Unleash, known to the auditors of the world as Bricks Software AS, follows strict security best practices and consistently passes enterprise security audits conducted by our customers.

To protect our systems and data, we have implemented a comprehensive security framework. This includes regular risk assessments, penetration testing, and security policies that we review regularly.

When you engage with Unleash, you will get access to our Trust Center, which houses a complete list of annual SOC 2 and other reports, security policies, and controls, as well as a list of data sub-processors that are regularly reviewed by our compliance team and engineering leadership. These measures demonstrate Unleash’s commitment to maintaining a robust security posture, which supports our ability to pass the most rigorous enterprise security audits.

![An image of Unleash security & compliance review on Vanta Trust Center](/img/use-case-vanta-trust-center.png)

## Best practices and recommendations

Throughout this guide, we've explored how to use Unleash Enterprise as a secure and compliant feature flag system. You now understand how Unleash's features work together to pass security audits while enabling your teams to build and ship safely.

By using Unleash with security and compliance in mind, you've learned how to transform what could be a potential security liability into an asset that strengthens your overall security posture. Here are key recommendations to make sure your feature flag implementation meets enterprise security and compliance standards:

-   **Implement SSO and SCIM integration**: leverage identity provider integration through OpenID Connect or SAML 2.0 to centralize authentication and automate user management at scale, ensuring secure and efficient onboarding and offboarding processes.

-   **Use role-based access control**: create custom root and project roles that follow the principle of least privilege, ensuring that team members can only access and modify feature flags relevant to their specific responsibilities.

-   **Configure network security controls**: restrict API access with CORS policies and IP allow lists to create multiple layers of defense around your feature flag system, limiting potential attack vectors to your production environments.

-   **Establish change management workflows**: implement the four-eyes principle for all production flag changes through change requests to ensure that critical modifications are properly reviewed and approved before implementation.

-   **Leverage audit logging**: maintain comprehensive event logs and integrate with your SIEM systems to create a chain of evidence for all feature flag activities, which supports your compliance with SOC 2, FedRAMP, and ISO 27001 requirements.

-   **Utilize project isolation for sensitive workloads**: separate feature flags by projects to maintain clear boundaries between different business units and sensitive initiatives.

-   **Conduct regular access reviews**: periodically audit user access and permissions to ensure alignment with current organizational roles and responsibilities, removing unnecessary access rights.

-   **Integrate with existing security tools**: connect Unleash's logging capabilities with your existing security monitoring infrastructure to create a more unified view of security events across your tech stack.

By following these practices, you're not only implementing feature flags as a technical capability but doing so in a way that aligns with your organization's commitment to security and compliance. Unleash Enterprise gives you the capabilities needed to navigate complex regulatory requirements while still reaping the benefits of modern feature management practices.

Security is an ongoing process, not a one-time implementation. As your organization's security requirements evolve, Unleash's enterprise features can help you maintain compliance today and into the future.
