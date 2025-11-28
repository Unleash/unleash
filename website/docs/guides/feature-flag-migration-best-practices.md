---
title: Best Practices for Migrating from a Homegrown Feature Management Solution
---

Many large organizations have an existing feature management solution that they have outgrown and plan to migrate to a feature flag service.

This guide outlines Best Practices for feature flag migrations. Approaching the migration from your current feature flag solution to Unleash the right way will save you time, money, and a lot of headaches.

Based on our work with organizations having millions of flags and thousands of users, there are five phases of a feature flag migration:

1.  [Defining the scope of the feature flag migration](#defining-the-scope-of-the-feature-flag-migration)
2.  [Make the business case for feature flag migration](#make-the-business-case-for-feature-flag-migration)
3.  [Planning Feature Flag Migration](#planning-feature-flag-migration)
4.  [Migration Execution](#migration-execution)
5.  [Onboarding users](#onboarding-users)

This guide provides a summary of each topic as well as a detailed [Feature Flag Migration template](https://docs.google.com/spreadsheets/d/1MKc95v7Tc-9tznWMDVSy2vvmVJTvOFLRVZpx1QrL-_U/edit#gid=996250264) that you can use to plan your migration.

## Defining the scope of the feature flag migration

Scoping a feature flag migration properly is the most significant task you can do to ensure the success of your project.

Based on experiences working with dozens of large enterprises migrating homegrown systems to Unleash, we recommend two best practices when scoping your feature flag migration.

### 1- Separate the migration of old flags from the existing system from new flags created in Unleash.

The older the system, the more existing flags there are. It might take weeks or months to hunt down the developer responsible for an old flag in an obscure part of the code base. In the meantime, hundreds of developers are trying to create new flags today. By separating these concerns, you can get to the "happy end state" for your development team faster, and burn down your flag migrations over time.

So you should end up with two separate tracks as part of your project scope.

1. Build the new platform around the "better" target state - ideal use cases and ways of working that enable greater levels of developer efficiency

In parallel, the second track:

2. Clean up stale feature flags in the current platform. You should decide strategically on what should be migrated and what should be cleaned up. Many old flags can simply be deleted rather than migrated.

### 2- Do not make end-to-end app modernization a dependency of your feature flag migration

Organizations who adopt feature flags see improvements in all key operational metrics for DevOps: Lead time to changes, mean-time-to-recovery, deployment frequency, and change failure rate. So it is natural as part of a feature flag migration to also improve other parts of the software development lifecycle. From the perspective of feature flag migration, this is a mistake.

Making feature flag migration dependent on breaking down mission-critical monolithic applications into microservices, for example, will slow down your feature flag migration.

Rather, enable feature flags for all codebases, independent of your state of modernization. Even monolithic applications can benefit from feature flags in some instances. When this monolith is broken down, the accrued benefits will be even greater, and you will ship your new feature management system a lot faster.

If you're using our [template](https://docs.google.com/spreadsheets/d/1MKc95v7Tc-9tznWMDVSy2vvmVJTvOFLRVZpx1QrL-_U/edit#gid=996250264), now fill in details about your project scope.

## Make the business case for feature flag migration

Once you have scoped your migration, you need to make a business case. Even the most well planned migrations take effort, meaning time, money, and energy dedicated to a project. If you don’t have the proper buy-in, you risk being under-resourced or worse, being unable to complete the migration at all.

When building a business case, you want to be clear on what pain the feature flag migration is solving and the happy end state once the migration is complete.

To structure your thinking, ask yourself:

-   What practices related to feature deployments, debugging and rollbacks are overburdening teams today and driving down productivity?
-   What specific deficiencies are there in the current platform
-   What business outcomes are you looking to drive?
-   After the migration, what does "better" look like?

If you're using our [template](https://docs.google.com/spreadsheets/d/1MKc95v7Tc-9tznWMDVSy2vvmVJTvOFLRVZpx1QrL-_U/edit#gid=996250264), now fill in details about your business case.

## Planning Feature Flag Migration

When planning your feature flag migration, it is essential to focus on four key areas:

-   Use cases
-   Core feature flag setup
-   Key stakeholders
-   System architecture

### Use Cases

A key requirement is to understand how feature flags will be used so that you can set up the proper data model, user permissions, and system architecture.

Below are some of the most common use cases for feature flags. Start by selecting those that are in scope for your initial rollout. It is common to start with some, but not all, of these and roll out the remaining in the future.

Use cases for feature flags:

-   Operational or Permission flags (also known as "Kill Switches")
-   Gradual rollouts
-   Canary releases
-   A/B testing / Experimentation

Core Feature Flag setup

This planning phase is all about understanding the anatomy of the existing feature flag setup so it can be moved to Unleash.

Key questions include:

-   How many flags are there?
-   How many are active?
-   Do the inactive flags need to be migrated, or can they be removed entirely, simplifying migration?

Once you have an understanding of what needs to be migrated, you should plan for how flags will be organized in the future. Picking the right organizing principle is critical for access controls. Unleash supports Application, Project, Environment, and Role-based access, so pick the option that makes the most logical sense for your organization.

Our experience tells us that organizing flags by the development teams that work on them is the best approach. For example:

-   By application or microservice
    -   E.g. Shopping Cart, Website, Mobile app
-   By Projects
    -   E.g. Logistics, Finance
-   By organization hierarchy
    -   E.g. Frontend, backend, platform teams

### Key stakeholders

When planning your migration, it is important to understand who will be managing the feature flag system and who will be using the feature flag system on a day-to-day basis. Additionally, you need to know who will be responsible for key migration tasks.

From our experience, looping all key stakeholders into the project early on means that all eventualities can be planned for in advance, reducing the risk of project implementation delays due to unforeseen sign-off requirements. Decision makers can help assign and gather resources needed for the migration, as well as advise on the correct business processes that need to be followed at the various project stages.

**System Architecture**

You will also need to plan how you set up Unleash itself as part of your migration planning process. Unleash is extremely flexible with lots of hosting and security configuration options to align with the unique requirements of large enterprises.

### How is our current feature flag architecture set up?

This part is key to understanding how Unleash needs to be implemented. This plays a part in resource planning for both personnel and infrastructure cost allocation. For instance

-   What languages and frameworks are our front end and backend using?
-   Where are our applications hosted?
-   Where are end users of the application based geographically?

### Security and organizational policy requirements

You will also want to pay attention to Security & Organisational Policy requirements.

For example, do you need to keep sensitive context inside your firewall perimeter?

Often the answer to this question defines whether you will run Unleash in a hosted, or self-hosted fashion.

Many customers prefer a hosted solution if their security policy will allow it because it reduces overhead on SRE teams and infrastructure. Unleash offers a single-tenant hosted solution, so even security-conscious customers can sometimes opt for a hosted solution.

If that is not an option, Unleash instances need to be managed by customer SRE / DevOps teams. If this is the direction you are going, you should plan for it in this phase of the project.

Other areas of system architecture to investigate during the planning phase are:

-   Data protection
    -   Do we have to comply with HIPPA, SOC-2, ISO 27001, GDPR, etc?
-   How do we authenticate and manage user access & RBAC/roles?
-   Do we have any Change Management policies we need to adhere to?
-   Do we consume feature flag data, such as events, in any other systems downstream?
    -   For example, Jira Cloud for issue management, Datadog for real-time telemetry, Slack or Microsoft Teams for notifications or Google Analytics for user interactions.

If you're using our [template](https://docs.google.com/spreadsheets/d/1MKc95v7Tc-9tznWMDVSy2vvmVJTvOFLRVZpx1QrL-_U/edit#gid=996250264), now fill in details about your project planning.

## Migration Execution

Now that we have completed the planning, below are some of our Best Practices for carrying out the migration based on our experience.

First, it can help to break the migration down into an order of activities, for example:

-   **Minimum Viable Product (MVP) launch**
    -   Platform implemented, passed security/change management requirements, and available for developer use
    -   Rollout to the highest priority groups of users
    -   Matching use cases of the legacy platform
    -   Legacy system fallback available
-   **Medium-term**
    -   Rollout to additional groups; adoption of further, less critical use cases
    -   Sunset of legacy system
-   **Longer term**
    -   Adoption of new use cases

For each activity, plan for the Level of Effort (LoE), or the number of hours/days the task will take the assigned resource or group to fulfill.

Next up is risk handling. **Are there any perceived risks to the timelines that could be addressed upfront?**

-   Have the teams involved with the migration committed to set hours for working the migration tasks upfront, have had migration project success criteria and their tasks communicated to them, and Q&A fulfilled?
-   How long are various sign-offs by any relevant groups expected to take?
    -   E.g. Change Advisory Board, Security Controls, hardening checks, etc
    -   Plan to exceed each team’s documentation requirements to ensure fewer Requests for Information

Every step of the way, it can help to conduct reviews and look-backs at each rollout stage as well as what lies ahead.

If you're using our [template](https://docs.google.com/spreadsheets/d/1MKc95v7Tc-9tznWMDVSy2vvmVJTvOFLRVZpx1QrL-_U/edit#gid=996250264), now fill in details about your project plan execution.

## Onboarding users

Finally, after the migration has been completed and everyone has celebrated, you need to onboard team members onto the platform.

Unleash Customer Success is here to help, whether your developers are seasoned feature flag management experts or new to the concepts - we will deliver tailored, white-glove training to accommodate use cases and developer skill levels.

In addition, for those who prefer a self-paced approach, a wealth of content is available on our [YouTube channel](https://www.youtube.com/channel/UCJjGVOc5QBbEje-r7nZEa4A), [website](https://www.getunleash.io/), and [documentation](https://docs.getunleash.io/) portal to get your teams going quickly.
