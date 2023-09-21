---
title: Defining the scope of the feature flag migration
---

Scoping a feature flag migration properly is the most significant task you can do to ensure the success of your project.  

Based on experiences working with dozens of large enterprises migrating homegrown systems to Unleash, we recommend two best practices when scoping your feature flag migration.

## 1- Separate the migration of old flags from the existing system from new flags created in Unleash.

The older the system, the more existing flags there are. It might take weeks or months to hunt down the developer responsible for an old flag in an obscure part of the code base. In the meantime, hundreds of developers are trying to create new flags today.  By separating these concerns, you can get to the "happy end state" for your development team faster, and burn down your flag migrations over time.

So you should end up with two separate tracks as part of your project scope.

1. Build the new platform around the "better" target state - ideal use cases and ways of working that enable greater levels of developer efficiency

In parallel, the second track:

2. Clean up stale feature flags in the current platform. You should decide strategically on what should be migrated and what should be cleaned up. Many old flags can simply be deleted rather than migrated.  

## 2- Do not make end-to-end app modernization a dependency of your feature flag migration

Organizations who adopt feature flags see improvements in all key operational metrics for DevOps: Lead time to changes, mean-time-to-recovery, deployment frequency, and change failure rate.  So it is natural as part of a feature flag migration to also improve other parts of the software development lifecycle. From the perspective of feature flag migration, this is a mistake.

Making feature flag migration dependent on breaking down mission-critical monolithic applications into microservices, for example, will slow down your feature flag migration.

Rather, enable feature flags for all codebases, independent of your state of modernization.  Even monolithic applications can benefit from feature flags in some instances. When this monolith is broken down, the accrued benefits will be even greater, and you will ship your new feature management system a lot faster.

Use our [Feature Flag Migration template](https://docs.google.com/spreadsheets/d/1MKc95v7Tc-9tznWMDVSy2vvmVJTvOFLRVZpx1QrL-_U/edit#gid=996250264) to fill in details about your project scope.
