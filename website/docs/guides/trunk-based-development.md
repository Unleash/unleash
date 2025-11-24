---
title: Implement trunk-based development using feature flags
slug: /guides/trunk-based-development
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="high" />

Developers are increasingly adopting trunk-based development to accelerate software delivery and improve efficiency and reliability. A key principle of trunk-based development is merging code into the main branch (aka "trunk") as quickly as possible. This practice reduces the complexity of long-lived feature branches, minimizes merge conflicts, and ensures that teams can continuously integrate and test their code. However, it also means unfinished or experimental features may exist in production. This is where feature flags become essential.

Unleash provides a powerful mechanism for safely managing and controlling these features in production, enabling enterprises to deliver software faster and with greater reliability. Effective feature flag management ensures that trunk-based development supports continuous delivery without compromising stability. In this tutorial, we’ll use Unleash to manage trunk-based development in your codebase.

## How to implement trunk-based development with feature flags

To follow along with this tutorial, you need access to an Unleash instance to create and manage feature flags. Head over to our [Quick Start documentation](/get-started/quickstart) for options, including running locally or using an [Unleash SaaS instance](https://www.getunleash.io/pricing?).

With Unleash set up, you can use your application to talk to Unleash through one of our [SDKs](/reference/sdks).

In this tutorial, you will:

1. [Explore different trunk-based development strategies](#choose-the-right-trunk-based-development-strategy-for-your-team)
2. [Create feature flags for incomplete features](#create-feature-flags-for-incomplete-features)
3. [Control feature rollouts](#control-feature-rollouts)
4. [Simplify rollbacks with Unleash](#simplify-rollbacks)
5. [Archive and remove feature flags](#archive-and-remove-feature-flags)

## Choose the right trunk-based development strategy for your team

There is no one-size-fits-all approach to implementing trunk-based development. Different teams may benefit from varying strategies based on their needs, project complexity, and development culture.

In this section, we'll explore the common trunk-based development strategies and their trade-offs to help you choose the best approach for your organization.

### Merge every commit

The most straightforward approach to trunk-based development is merging every commit directly into the main branch. This strategy maximizes the rate of continuous integration and delivery, as changes are integrated into the trunk as soon as they are ready.

**Advantages**:

-   Rapid feedback loops and quicker issue resolution
-   Reduced risk of large, complex merges
-   Small, frequent commits

**Challenges**:

-   Reviewing the code can become more challenging
-   Potential for more frequent build breaks and test failures
-   Increased need for effective merging strategies
-   Requirement for robust automated testing and CI/CD pipelines

### Merge at set intervals

Another common strategy is to merge changes into the trunk at regular, predefined intervals, such as daily or before the end of each work day. This approach offers a balance between frequent integration and managing work-in-progress.

**Advantages**:

-   Improved control over the integration process
-   Reduced risk of breaking the build
-   Easier to manage and identify integration issues

**Challenges**:

-   Longer feedback loops compared to merging every commit
-   Potential for larger, more complex merges
-   Requires discipline to adhere to the defined merge cadence

### Tradeoffs of short-lived feature branches

In trunk-based development, it is possible to use short-lived feature branches, which enable teams to implement code review processes without the burden of maintaining long-running branches, which can become increasingly difficult to manage over time.

**Advantages**:

-   Frequent integration back to trunk significantly reduces the likelihood and complexity of merge conflicts, as changes are merged before they can diverge too far from the main codebase
-   Maintains the core benefits of trunk-based development - such as rapid iteration and continuous integration - while still allowing developers to work in isolation when needed.

**Challenges**:

-   Maintaining the discipline required to keep branches truly short-lived. Teams must develop the skill of breaking down work into small, mergeable units.
-   Demands a robust testing and CI/CD pipeline to ensure that frequent merges don't compromise code quality or stability. Teams must invest in automated testing and deployment infrastructure to support rapid integration cycles.

Keep in mind that a feature is often cleaved up into pieces that span many short-lived branches. A feature flag prevents an incomplete feature being exposed before it's done.

> We definitely branch off to work on features, but we’ll rarely finish a whole feature in a single branch.
> I try to aim for not having branches live more than a day with active development.
> At that point, you're more likely for to break something and it’s harder for developers to review them properly.
> Ideally, it’s a couple hours worth of work at most.
> Of course there’s exceptions, but we like doing things in small chunks.
> — _Thomas Heartman, Engineer, Unleash_

Regardless of the specific strategy, Unleash feature flag management capabilities are designed to support a wide range of trunk-based development styles, empowering you to implement the best strategy for your teams.

### Microservices vs. monoliths

The underlying application architecture can also influence the optimal trunk-based development strategy. Teams working on monolithic applications may find more success with less frequent merges, while those working on microservices may benefit from a more continuous integration approach.

**Monolithic applications**:

-   Larger, more tightly coupled codebase
-   Merging at set intervals (for example, daily) may be more suitable to manage integration complexity
-   Increased emphasis on rigorous testing and staged deployments

**Microservices**:

-   Smaller, more loosely coupled services
-   Merging every commit is often more feasible due to reduced integration challenges
-   Enables more independent development and deployment of individual services

> Having a monolith can be better because it reduces latency between network calls in comparison to microservices.
> But if there isn’t a centralized team that truly manages the monolithic code, it can be difficult."
>
> — _Jeanette Pranin, Sr. Software Engineer, Fabric_

## Create feature flags for incomplete features

Some of the most appropriate feature candidates for trunk-based development are features with significant user impact that require thorough testing.

In trunk-based development, developers merge incomplete code into the main branch. Unleash feature flags allow this to happen safely by keeping the feature hidden or disabled, ensuring the trunk remains in a releasable state. The flag starts as “off” in production while the feature is incomplete. The flag can be on in development and/or a testing environment until the feature is complete and ready to go live in production for all users.

To demonstrate this, let's create a flag that wraps around an incomplete feature in our application code. After that, we’ll explore rollout strategies and how they are configured in Unleash to enable trunk-based development.

In the Unleash Admin UI, open a project and click **New feature flag**.

![Create a new feature flag in the Unleash Admin UI.](/img/use-case-new-flag.png)

Next, name the new feature flag. The purpose of this flag is to manage the deployment of a new or incomplete feature. Therefore, the flag we are creating is considered a Release flag type. While release flags are invaluable, they should be short-lived to prevent codebase complexity and technical debt accumulation. Later in the tutorial, we will cover when to remove and archive these flags.

![Create a feature flag by filling out the form fields.](/img/use-case-create-tbd-flag.png)

Once you have completed the form, click **Create feature flag**.

Once your flag is created, you can build a feature in your application code while keeping it hidden in production.

### Effectively manage your feature flag and code

When implementing trunk-based development with Unleash, it's crucial to have a well-structured process for managing your feature flags and the associated code. This ensures the trunk remains in a deployable state while allowing teams to work independently on different features.

Here is an example of wrapping code in a feature flag using JavaScript and our SDK:

```javascript
// Import the Unleash client
import { initialize, isEnabled } from 'unleash-client';

// Initialize the Unleash client with your configuration
initialize({
  appName: 'my-web-application',
  url: 'https://your-unleash-instance.com/client/features',
  instanceId: 'unique-client-identifier'
});

// Example of a feature flag-wrapped checkout process
function processCheckout(cart) {
  // Check if the new checkout flow is enabled
  if (isEnabled('new-checkout-flow')) {
    // New checkout implementation
    return advancedCheckoutProcess(cart);
  } else {
    // Original checkout implementation
    return standardCheckoutProcess(cart);
  }
}

// Advanced checkout process (new feature)
function advancedCheckoutProcess(cart) {
  // Implement the new, more sophisticated checkout flow
  console.log('Using advanced checkout process');

  // Add new features like:
  // - Enhanced payment options
  // - Detailed order preview
  // - Advanced shipping calculations
  return {
    status: 'success',
    orderDetails: /* new implementation */
  };
}

// Standard checkout process (existing implementation)
function standardCheckoutProcess(cart) {
  // Existing checkout logic
  console.log('Using standard checkout process');
  return {
    status: 'success',
    orderDetails: /* existing implementation */
  };
}

// Example usage
function handleCheckout(cart) {
  try {
    const checkoutResult = processCheckout(cart);
    return checkoutResult;
  } catch (error) {
    // Fallback mechanism
    console.error('Checkout failed', error);
    return standardCheckoutProcess(cart);
  }
}
```

### Key aspects of feature flag implementation in code

1. Conditional Feature Activation: The `isEnabled('new-checkout-flow')` check allows the team to control feature visibility without changing the code deployment.
2. Easy Rollback: If issues are detected, simply turning off the flag in Unleash immediately reverts to the standard checkout process.
3. Trunk-Based Development Support:
    - Developers can merge the new checkout code into the main branch
    - The feature remains hidden behind the flag
    - Team can test the new implementation in different environments
    - Gradual rollout is possible by adjusting flag configurations
4. Fallback Mechanism: The code includes a fallback to the standard process, ensuring system reliability even if the new feature encounters issues.

This approach embodies the core principles of trunk-based development and feature flag usage:

-   Keeping the trunk always deployable
-   Controlled feature rollout
-   Minimal risk during new feature introduction
-   Test new features in production
-   Quickly disable problematic features

### Establish consistent naming conventions

Develop clear and [consistent naming patterns](/reference/feature-toggles#set-a-naming-pattern) for your feature flags. This will help maintain clarity and make it easier to understand the purpose and context of each flag. Some recommended elements to include in your flag names:

-   The feature or functionality the flag is associated with
-   The environment or user segment the flag is intended for (e.g., "mobile_users")
-   A short, descriptive prefix (for example, "ff\*", "feat\_"). For example: `feat_new_dashboard_beta`.

### Leverage tagging and flag descriptions

In addition to meaningful names, apply relevant [tags](/reference/feature-toggles#tags) and descriptions to your feature flags in Unleash. This metadata can include information such as:

-   The team or product area responsible for the flag
-   The release timeline or planned retirement date
-   Associated Jira tickets or GitHub issues
-   Relevant documentation or context

Tagging and descriptive flags make it easier to search, filter, and manage your feature flags, especially as the number of flags grows.

Click **Create new tag** in the Unleash Admin UI to add these details to your feature flag.

![Create a tag with relevant data to better organize your feature flags. A modal will pop up to name and save as many tags as you need.](/img/use-case-tbd-tagging.png)

To add descriptions to your flag, go to your flag settings and edit the description field with relevant, useful information.

![In your flag settings form, there is an optional description field for adding more details about the flag you're creating.](/img/use-case-tbd-edit-flag.png)

### Keep the trunk deployable

The trunk should always be deployable, enabling teams to accelerate release cycles and respond quickly to market demands.

To keep the trunk in a deployable state, keep the flag off in your production environment. The code for your feature should be wrapped in your flag and, therefore, not executable in production, even though the code will be deployed frequently. This ensures users do not have access to the feature before its official release. Additionally, this promotes collaboration by allowing teams to work independently on different features without interference.

To test your incomplete feature, enable the flag in the development environment in the Unleash Admin UI. In some cases, you may also find it valuable to enable the flag in a testing/QA environment. Unleash environment-specific flag configurations make it easy to manage these different states across your [environments](/reference/environments). You can quickly toggle flags on or off for specific environments, ensuring the trunk remains deployable in production while enabling active development and testing in other contexts. Use the default production environment toggle in Unleash to enable your flag when you’re ready to make your feature available.

:::note
Depending on the size and scope of a feature you’re developing, you may need more than one flag. Generally, we recommend creating as few flags as possible per feature, as making too many flags associated with one feature can become more complex to manage over time with trunk-based development. Our documentation on [best practices for feature flags at scale](/guides/best-practices-using-feature-flags-at-scale) provides more concrete details on large-scale feature flag management.
:::

### Automate flag lifecycle management

As your codebase and development processes mature, consider automating key aspects of feature flag management. This can include:

-   Automated flag archiving and removal: Set rules to automatically archive or remove flags that have been inactive for a certain period, reducing technical debt.
-   Integration with your CI/CD pipelines: Automatically create, update, or toggle flags as part of your deployment workflows, ensuring flags stay in sync with the codebase.
-   Reporting and analytics: Generate regular reports on flag usage, performance, and health to proactively identify opportunities for optimization.

Automation helps maintain a clean, well-organized feature flag landscape, even as your organization scales its trunk-based development practices. Learn more about [feature flag lifecycles](/reference/feature-toggles#feature-flag-lifecycle) and how to implement this process using Unleash into your workflow.

## Control feature rollouts

Once a feature is complete, feature flags enable controlled rollouts. You can gradually expose the feature to users, starting with specific groups or environments, without needing to redeploy the code.

For trunk-based development, you can create a gradual rollout strategy to:

-   Determine the percentage of users exposed to the new feature
-   Determine the percentage of users that get exposed to each version of the feature
-   Release on a per-customer basis
-   Release to the general user base

To target users accordingly, let's create an [activation strategy](/reference/activation-strategies). This Unleash concept defines who will be exposed to a particular flag. With Unleash, you can define a gradual rollout strategy to enable a feature only for a specified audience, depending on the parameters under which you would like to release a feature.

![Add a strategy to configure a release process for your flag.](/img/use-case-tbd-add-strategy.png)

Next, let's create a new activation strategy and configure the rollout percentage so only a certain portion of your users are targeted. For example, you can adjust the dial so that 35% of all users are targeted. The remaining percentage of users will not experience any variation of the new feature. Adjust the rollout dial to set the percentage of users the feature targets, or keep it at 100% to target all users.

To define more granular conditions for your feature beyond the rollout percentage, you can use [strategy variants](/reference/strategy-variants) and [constraints](/reference/activation-strategies#constraints).

## Simplify rollbacks

In trunk-based development, the ability to quickly roll back a feature can mean the difference between a minor hiccup and a major service disruption.

When issues are detected, Unleash makes it easy to quickly roll back a problematic feature by simply turning off the corresponding feature flag in your production environment. This allows development teams to address problems swiftly without the need for complex rollback procedures or full code deployments.

### The one-click rollback process

Imagine you've just rolled out a new checkout process. Shortly after launch, you detect performance issues or unexpected user behavior. To mitigate this issue, the process to roll back is straightforward:

1. Go to the Unleash Admin UI
2. Find the feature flag for the feature you want to roll back
3. Toggle the flag to the "off" position in the production environment

Instantly, the feature is disabled for all users without requiring a new code deployment, complex rollback procedures, or downtime for your application.

### Why simple rollbacks matter for development teams

This simple rollback mechanism provides many critical benefits:

-   Immediate risk mitigation
-   Minimal disruption to ongoing development
-   Reduced operational overhead
-   Enhanced ability to experiment and innovate

You can simply turn off the feature flag in Unleash, immediately reverting to the previous stable version of the feature.

### Best practices for rollbacks

To maximize the effectiveness of feature flag rollbacks:

-   Always have a feature flag prepared before launching new functionality
-   Ensure your feature flags wrap complete, identifiable units of functionality
-   Train your team on the rollback process
-   Set up monitoring to quickly detect potential issues

## Archive and remove feature flags

Once a feature is fully rolled out and stable, the feature flag should be archived or removed. This reduces technical debt in the codebase and prevents unnecessary complexity.

As your codebase and feature set grow over time, it's important to maintain visibility into your feature flag usage and lifecycle. Regularly review which flags are active, which environments they are enabled in, and when they were last modified.

Unleash provides reporting and analytics capabilities to help you monitor your feature flag landscape. This allows you to identify obsolete or unused flags, and plan for their eventual archival or removal, keeping your codebase clean and manageable.
