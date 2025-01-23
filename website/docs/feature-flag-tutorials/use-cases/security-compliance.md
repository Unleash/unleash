---
title: Security and Compliance for Enterprise Feature Flag Management
slug: /feature-flag-tutorials/use-cases/security-compliance
---

Enterprise organizations face the challenge of balancing innovative technology with strict security and compliance requirements. Feature flags are a powerful tool for controlled software rollouts, but it must be implemented with attention to regulatory standards and data protection. Unleash addresses these complex needs by providing a comprehensive feature flag platform that prioritizes enterprise-level security and compliance.

## Regulatory compliance frameworks

Unleash is designed to support critical enterprise compliance standards:

[FedRAMP](/using-unleash/compliance/fedramp): For government and highly regulated sectors, Unleash's security controls are designed to meet the rigorous requirements of the Federal Risk and Authorization Management Program (FedRAMP).

[SOC 2 Type II](/using-unleash/compliance/soc2): Our architecture provides the necessary controls and audit trails to meet stringent SOC 2 requirements, ensuring your feature flag management processes are transparent, secure, and verifiable.

[ISO 27001](/using-unleash/compliance/iso27001): Our security management system aligns with ISO 27001 standards, providing a structured approach to managing sensitive information and protecting data integrity.

## Enable enterprise authentication controls in Unleash

When you’re getting started with Unleash, the first step is setting up developers and other users with secure access to the platform. Unleash implements a multi-layered authentication architecture that begins with support for [single sign-on (SSO) and SCIM protocols](/how-to/sso), including SAML 2.0 and OpenID Connect, and integration with enterprise identity providers such as Okta, Microsoft Entra ID, and Keycloak.

Beyond SSO, Unleash support identity providers that enforce [Multi-Factor Authentication (MFA)](/using-unleash/compliance/fedramp#identification-and-authentication) across all user access points. Every authentication event is logged with detailed metadata including timestamp, IP address, user agent, and authentication method used, providing comprehensive audit trails for security teams.

Authentication mechanisms include:

-   **FedRAMP**: Meets federal authentication standards through strong authentication controls.
-   **SOC 2**: Provides the access control mechanisms required for the Security trust criterion.
-   **ISO 27001**: Addresses access control objectives related to user authentication and authorization.

To configure SSO in Unleash, navigate to **Admin > Single sign-on** in the Unleash Admin UI.

![In Unleash's Single Sign-On page, there are four tabs to set up Open ID Connect, SAML 2.0, traditional passwords, and SCIM.](/img/use-case-user-mgmt-saml.png)

## Configure role-based access control for enterprise security

[Role-based access control (RBAC)](/reference/rbac) allows for fine-grained permission management, ensuring that team members can only access and modify feature flags relevant to their specific roles and responsibilities. Unleash's permission system enables precise control over user access and capabilities:

-   **FedRAMP**: Implements the principle of least privilege and provides the detailed access controls required for federal systems.
-   **SOC 2**: Addresses the Security trust criterion by ensuring appropriate access restrictions and user management.
-   **ISO 27001**: Supports access control objectives by enabling organizations to implement and maintain detailed access management policies.

To configure RBAC in the Unleash Admin UI, go to **Admin > Roles** to view, create, and manage user roles.

![Manage all user roles in the Unleash Admin UI.](/img/use-case-user-mgmt-root-roles.png)

For more fine-tuned access controls, create [custom root roles](/how-to/how-to-create-and-assign-custom-root-roles) and [custom project roles](/how-to/how-to-create-and-assign-custom-project-roles), where you can define the privileges and limitations beyond the [predefined roles](/reference/rbac#predefined-roles) we have built into Unleash.

## Network security using Unleash

Different parts of an organization have different security requirements. Unleash provides network security, CORS, API security for access control mechanisms, and the ability to create hidden projects that restrict the visibility of sensitive feature flag configurations.

Network-level security is further enhanced through IP allow lists, which enable organizations to control access based on specific network parameters.

### CORS configuration and API security

Cross-origin resource sharing (CORS) configuration in Unleash gives you control over which domains can interact with your feature flag services:

-   **Origin control**: Administrators can explicitly define allowed origins, preventing unauthorized cross-origin requests.
-   **Method restrictions**: CORS policies can be configured to limit which HTTP methods are permitted from specific origins.
-   **Header management**: Control over which headers can be included in cross-origin requests.
-   **Credential handling**: Configure whether cross-origin requests can include credentials.
-   Environment separation: Different CORS policies can be applied to development, staging, and production environments.

In the Unleash Admin UI, go to **Admin > CORS origins** to add a list of origins to the input form. Then click **Save**.

![Configure your CORS origin in the Unleash Admin UI input form.](/img/use-case-security-cors.png)

## Implement change management workflows

Enterprise software development requires complex change management processes, and Unleash supports advanced workflows that meet these needs. This functionality aligns with the configuration management practices required by all major compliance frameworks.

Unleash's approval system implements strict [change management controls](/reference/change-requests) through multiple reviewer requirements and scheduled deployments. This system addresses:

-   **FedRAMP**: Supports the principle of separation of duties and provides the mandatory review processes required for federal systems.
-   **SOC 2**: Ensures change management controls by requiring documented approvals and maintaining clear audit trails of the approval process.
-   **ISO 27001**: Fulfills change management control objectives by ensuring systematic review and approval of changes to production environments.

Implement our [advanced approval mechanisms](https://www.getunleash.io/blog/feature-flag-change-requests-how-to), including the four-eyes principle, which mandates that significant changes require review and approval from multiple authorized personnel. You can use this per environment and project to maintain compliance and good security posture.

You can create detailed, role-based approval chains that ensure no single individual can make critical changes without appropriate oversight. Scheduled change requests allow teams to plan and queue feature flag modifications with precise timing, further enhancing control and predictability in the deployment process.

## Protect sensitive information using Unleash

One of the biggest concerns for enterprise teams is preventing the accidental exposure of Personally Identifiable Information (PII). Unleash has implemented multiple layers of protection to [minimize PII risks in feature flag metadata](/topics/feature-flags/feature-flag-best-practices#6-protect-pii-by-evaluating-flags-server-side).

We implement comprehensive encryption for data both in transit and at rest, utilizing industry-standard protocols. This encryption framework satisfies:

-   **FedRAMP**: Meets federal requirements by using FIPS 140-2 validated encryption modules.
-   **SOC 2**: Ensures protection of sensitive data through encryption, supporting the Confidentiality trust criterion.
-   **ISO 27001**: Addresses cryptography control objectives and information transfer security requirements.

### Protect data with Unleash frontend API

Unleash also implements the data security principle of least privilege for [data collection](/understanding-unleash/data-collection). There's an important consideration when using the frontend API:

-   The Frontend API sends context data to the Unleash instance for real-time feature flag evaluation.
-   This data is used for real-time feature flag evaluation
-   Unleash processes this data to evaluate feature flags but does not permanently store it
-   The context might include non-PII data such as:
    -   Device types
    -   Application versions
    -   Generic user roles
    -   Geographic regions
    -   Feature flag states

With our approach, organizations can maintain strict data protection standards even in complex feature flag configurations.

We collect two types of data: technical usage metrics and client metrics.

Technical usage data includes feature flag usage, projects count, users, and API client SDKs. All technical data is anonymized and excludes sensitive information.

Client metrics data is collected when SDKs evaluate feature flags. This includes:

-   Feature flag name
-   Environment
-   Yes/no flag state
-   Timestamp
-   SDK version
-   Client app name
-   Instance ID

Client metrics enable statistical analysis of feature deployments and flag state evaluations. The data powers Unleash's real-time insights dashboard for monitoring feature releases. Some key privacy points are:

-   No PII or sensitive data is collected
-   Metrics are anonymous
-   Data collection can be disabled
-   On-premise installations have full control over data collection settings
-   Only flag evaluation data is stored, not user contexts

All data helps improve platform stability, performance monitoring, and feature flag optimization while maintaining strict privacy standards.

Learn how the Unleash architecture works in our [system overview](/understanding-unleash/unleash-overview#system-overview).

### Use Unleash Edge for data privacy

[Unleash Edge](/understanding-unleash/proxy-hosting) acts as a privacy barrier by allowing organizations to keep sensitive data within their own infrastructure. When properly configured, it serves as a local evaluation proxy that ensures private context data never leaves your network perimeter. This architecture is particularly valuable for organizations with strict data residency requirements or privacy concerns.

## Advanced audit and compliance tracking

Comprehensive logging is critical for maintaining compliance and understanding the lifecycle of feature flag changes. Unleash provides extensive event-logging capabilities that capture every automated or user-initiated action taken within Unleash.

Unleash’s audit logging system serves as a cornerstone for multiple compliance frameworks.
Every action within the platform is automatically captured with detailed metadata, timestamps, and user information. This robust logging system satisfies:

-   **FedRAMP**: Provides the continuous monitoring and detailed activity tracking required for federal systems, capturing all user interactions and system changes in immutable logs.
-   **SOC 2**: Maintains comprehensive audit trails that demonstrate effective change management and user accountability, essential for the Security and Processing Integrity trust criteria.
-   **ISO 27001**: Supports monitoring and measurement requirements by providing detailed evidence of system activities and changes, essential for Annex A controls related to logging and monitoring.

Our audit logs go far beyond simple change tracking. To view audit logs in the Unleash Admin UI, go to **Admin > Event log**.

![Search the event log for filtered changes that may have occurred with your flags to get comprehensive data.](/img/use-case-security-audit-log.png)

In this view, you see granular details about who made changes, when those changes occurred, and the specific modifications implemented. You can also see the difference of exactly what happened so you can revert changes if needed.

This level of detailed documentation supports multiple compliance requirements and provides the transparency crucial for security reviews and internal audits.

### Integrate SIEM systems for advanced auditing

The most advanced implementations integrate Unleash audit logs directly into broader [Security Information and Event Management (SIEM) systems](https://www.gartner.com/en/information-technology/glossary/security-information-and-event-management-siem). This enables real-time monitoring and creates a holistic view of system interactions across multiple platforms. Unleash's ability to integrate with enterprise security tools and SIEM systems:

-   **FedRAMP**: Facilitates required security monitoring and incident reporting through SIEM integration.
-   **SOC 2**: Supports monitoring and incident response requirements through integration with security monitoring systems.
-   **ISO 27001**: Enables comprehensive security monitoring and incident management through integration with enterprise security infrastructure.

## Best practices and recommendations

To maximize the security potential of feature flag management, Unleash recommends key practices:

-   Implement the principle of least privilege to ensure that access is always carefully controlled and limited.
-   Implement change request approval workflows for production environments to create a transparent record supporting internal governance and external compliance requirements.
-   Use SSO & SCIM for automated provisioning and de-provisioning of users and groups.
-   Regularly conduct audit reviews to help your organization stay proactive about potential security risks.
