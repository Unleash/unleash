---
title: How to do Trunk-Based Development using Feature Flags
slug: /feature-flag-tutorials/use-cases/trunk-based-development
---

Developers are increasingly adopting trunk-based development to accelerate software delivery and improve efficiency and reliability. A key principle of trunk-based development is merging code into the main branch (aka "trunk") as quickly as possible. This practice reduces the complexity of long-lived feature branches, minimizes merge conflicts, and ensures that teams can continuously integrate and test their code. However, it also means unfinished or experimental features may exist in production. This is where feature flags become essential.

Unleash provides a powerful mechanism for safely managing and controlling these features in production, enabling enterprises to deliver software faster and with greater reliability. Effective feature flag management ensures that trunk-based development supports continuous delivery without compromising stability. In this tutorial, we’ll leverage Unleash to manage trunk-based development in your codebase.

## How to Implement Trunk-Based Development with Feature Flags

To follow along with this tutorial, you need access to an Unleash instance to create and manage feature flags. Head over to our [Quick Start documentation](/quickstart) for options, including running locally or using an [Unleash SaaS instance](https://www.getunleash.io/pricing?).

With Unleash set up, you can use your application to talk to Unleash through one of our [SDKs](/reference/sdks).

In this tutorial, you will:

[MAKE LIST HERE ONCE COMPLETE WITH CHANGES TO SECTION TITLES]

## Choosing the Right Trunk-Based Development Strategy for Your Team

There is no one-size-fits-all approach to implementing trunk-based development. Different teams may benefit from varying strategies based on their needs, project complexity, and development culture.

In this section, we'll explore the common trunk-based development strategies and their trade-offs to help you choose the best approach for your organization.

### Merge Every Commit

The most frequent approach to trunk-based development is merging every commit directly into the main branch. This strategy maximizes the rate of continuous integration and delivery, as changes are integrated into the trunk as soon as they are ready. Some advantages are:

-   Rapid feedback loops and quicker issue resolution
-   Reduced risk of large, complex merges
-   Encourages small, frequent commits

Some challenges with merging every commit are:

-   Potential for more frequent build breaks and test failures
-   Increased need for effective merging strategies
-   Requirement for robust automated testing and CI/CD pipelines

### Merge at Set Intervals

Another common strategy is to merge changes into the trunk at regular, predefined intervals, such as daily or before the end of each work day. This approach offers a balance between frequent integration and managing work-in-progress.

**Advantages**:

-   Improved control over the integration process
-   Reduced risk of breaking the build with frequent merges
-   Easier to manage and identify integration issues

**Challenges**:

-   Longer feedback loops compared to merging every commit
-   Potential for larger, more complex merges
-   Requires discipline to adhere to the defined merge cadence

### Benefits of Short-Lived Feature Branches

In trunk-based development, it is possible to use short-lived feature branches, which enable teams to implement code review processes without the burden of maintaining long-running branches, which can become increasingly difficult to manage over time. The frequent integration back to trunk significantly reduces the likelihood and complexity of merge conflicts, as changes are merged before they can diverge too far from the main codebase. This approach maintains the core benefits of trunk-based development - such as rapid iteration and continuous integration - while still allowing developers to work in isolation when needed. This isolation can be particularly valuable for making experimental changes or implementing complex features that require validation before being merged into the trunk.

**Challenges to Address**

The most significant challenge is maintaining the discipline required to keep branches truly short-lived. Teams must develop the skill of breaking down work into small, mergeable units. Additionally, this approach demands a robust testing and CI/CD pipeline to ensure that frequent merges don't compromise code quality or stability. Teams must invest in automated testing and deployment infrastructure to support rapid integration cycles.

Regardless of the specific strategy, Unleash feature flag management capabilities are designed to support a wide range of trunk-based development styles, empowering you to implement the best strategy for your teams.

### Microservices vs. Monoliths

The underlying application architecture can also influence the optimal trunk-based development strategy. Teams working on monolithic applications may find more success with less frequent merges, while those working on microservices may benefit from a more continuous integration approach.

**Monolithic Applications**:

-   Larger, more tightly coupled codebase
-   Merging at set intervals (e.g., daily) may be more suitable to manage integration complexity
-   Increased emphasis on rigorous testing and staged deployments

**Microservices**:

-   Smaller, more loosely coupled services
-   Merging every commit is often more feasible due to reduced integration challenges
-   Enables more independent development and deployment of individual services

## Create Feature Flags for Incomplete Features

Some of the most appropriate feature candidates for trunk-based development are features with significant potential impact on users that may require thorough testing.

In TBD, developers merge incomplete code into the main branch. Unleash feature flags allow this to happen safely by keeping the feature hidden or disabled, ensuring the trunk remains in a releasable state. The flag starts as “off” in production while the feature is incomplete. The flag can be on in development and/or a testing environment until the feature is complete and ready to go live in production for all users.

We’ll create a flag that will wrap around an incomplete feature in your application code. After that, we’ll explore rollout strategies and how they are configured in Unleash to enable trunk-based development.

In the Unleash Admin UI, open a project and click **New feature flag**.

![Create a new feature flag in the Unleash Admin UI.](/img/use-case-new-flag.png)

Next, name the new feature flag. The purpose of this flag is to manage the deployment of a new or incomplete feature. Therefore, the flag we are creating is considered a Release flag type. While release flags are invaluable, they should be short-lived to prevent codebase complexity and technical debt accumulation.

![Create a feature flag by filling out the form fields.](/img/use-case-create-tbd-flag.png)

Once you have completed the form, click **Create feature flag**.

Once your flag is created, you can build a feature in your application code while keeping it hidden in production.

### Effectively Manage your Feature Flag and Code

When implementing trunk-based development with Unleash, it's crucial to have a well-structured process for managing your feature flags and the associated code. This ensures the trunk remains in a deployable state while allowing teams to work independently on different features.

#### Establish Consistent Naming Conventions

Develop a clear and consistent naming convention for your feature flags. This will help maintain clarity and make it easier to understand the purpose and context of each flag. Some recommended elements to include in your flag names:

-   The feature or functionality the flag is associated with
-   The environment or user segment the flag is intended for (e.g., "prod", "beta", "mobile\*users")
-   A version or iteration number, if applicable
-   A short, descriptive prefix (e.g., "ff\*", "feat\_"). For example: `ff_checkout_flow_v2_prod` or `feat_new_dashboard_beta`.

#### Keep the Trunk Deployable

The trunk should always be deployable, enabling teams to accelerate release cycles and respond quickly to market demands.
To keep the trunk in a deployable state, keep the flag off in your production environment. The code for your feature should be wrapped in your flag and, therefore, not executable in production, even though the code will be deployed frequently. This ensures users will not have access to the feature before its official release. Additionally, this promotes collaboration by allowing teams to work independently on different features without interference.

To verify the functionality of your feature while it is incomplete, enable the flag in the development environment in the Unleash Admin UI. In some cases, you may also find it valuable to enable the flag in a testing/QA environment. Unleash environment-specific flag configurations make it easy to manage these different states across your [environments](/reference/environments#how-to-start-using-environments). You can quickly toggle flags on or off for specific environments, ensuring the trunk remains deployable in production while enabling active development and testing in other contexts. Use the default production environment toggle in Unleash to enable your flag when you’re ready to make your feature available.

:::note
Depending on the size and scope of a feature you’re developing, you may need more than one flag. Generally, we recommend creating as few flags as possible per feature, as making too many flags associated with one feature can become more complex to manage over time with trunk-based development. Our documentation on [best practices for feature flags at scale](/topics/feature-flags/best-practices-using-feature-flags-at-scale) provides more concrete details on large-scale feature flag management.
:::

#### Leverage Tagging and Metadata

In addition to meaningful names, apply relevant tags and metadata to your feature flags in Unleash. This metadata can include information such as:

-   The team or product area responsible for the flag
-   The release timeline or planned retirement date
-   Associated Jira tickets or GitHub issues
-   Relevant documentation or context
-   Tagging and metadata make it easier to search, filter, and manage your feature flags, especially as the number of flags grows.

#### Automate Flag Lifecycle Management

As your codebase and development processes mature, consider automating key aspects of feature flag management. This can include:

-   Automated flag archiving and removal: Set rules to automatically archive or remove flags that have been inactive for a certain period, reducing technical debt.
-   Integration with your CI/CD pipelines: Automatically create, update, or toggle flags as part of your deployment workflows, ensuring flags stay in sync with the codebase.
-   Reporting and analytics: Generate regular reports on flag usage, performance, and health to proactively identify opportunities for optimization.

Automation helps maintain a clean, well-organized feature flag landscape, even as your organization scales its trunk-based development efforts.

## Control Feature Rollouts and Simplify Rollbacks

Once a feature is complete, feature flags enable controlled rollouts. You can gradually expose the feature to users, starting with specific groups or environments, without needing to redeploy the code.

For trunk-based development, you can create a gradual rollout strategy to:

-   Determine the percentage of users exposed to the new feature
-   Determine the percentage of users that get exposed to each version of the feature
-   Per-customer release
-   General release

To target users accordingly, let's create an [activation strategy](/reference/activation-strategies). This Unleash concept defines who will be exposed to a particular flag. Unleash comes pre-configured with multiple activation strategies that let you enable a feature only for a specified audience, depending on the parameters under which you would like to release a feature.

![Add a strategy to configure a release process for your flag.](/img/use-case-tbd-add-strategy.png)

The gradual rollout strategy form has multiple fields that control the rollout of your feature. You can name the strategy something relevant to the feature you’re building, but this is an optional field.

## Archive and Remove Feature Flags

Once a feature is fully rolled out and stable, the feature flag should be archived or removed. This reduces clutter in the codebase and prevents unnecessary complexity.

As your codebase and feature set grow over time, it's important to maintain visibility into your feature flag usage and lifecycle. Regularly review which flags are active, which environments they are enabled in, and when they were last modified.

Unleash provides reporting and analytics capabilities to help you monitor your feature flag landscape. This allows you to identify obsolete or unused flags, and plan for their eventual archival or removal, keeping your codebase clean and manageable.
