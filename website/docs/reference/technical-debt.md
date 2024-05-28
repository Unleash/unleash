---
title: Technical Debt
---

At Unleash we care deeply about code quality. Technical debt creeps up over time and slowly builds to the point where it really starts to hurt. At that point it's too late. Feature flags that have outlived their feature and are not cleaned up represent technical debt that you should remove from your code.

## Stale and potentially stale toggles

When a flag is no longer useful, we say that it has become _stale_. A stale flag is a flag that has served its purpose and that you should remove from the code base. For a flag to become stale, you have to explicitly mark it as such. You can mark a flag as stale in the [technical debt dashboard](#the-technical-debt-dashboard).

Unleash also has a concept of _potentially_ stale flags. These are flags that have lived longer than what Unleash expects them to based on their [feature flag type](../reference/feature-toggle-types.md). However, Unleash can't know for sure whether a flag is actually stale or not, so it's up to you to make the decision on whether to mark it as stale or to keep it as an active flag.

A flag being (potentially) stale, does not affect how it performs in your application; it's only there to make it easier for you to manage your flags.

## The technical debt dashboard

In order to assist with removing unused feature flags, Unleash provides project health dashboards for each project. The health dashboard is listed as one of a project's tabs.

![Three UI elements describing the health rating of the project. The first card has info on the project, including its name. The second is the "report card", containing the project's overall health rating, a flag report, and potential actions. The last card is a list of all the project's flags with data on when it was last seen, when it was created, when it expired, its status and a report.](/img/reporting.png)

The dashboard includes a health report card, and a list of flags that can be filtered on different parameters.

### Report card {#report-card}

![The project's health report card. It lists the project's health rating and when it was last updated; a flag report containing the number of active flags in the project; and potential actions, in this case asking the user to review potentially stale flags.](/img/reportcard.png)

The report card includes some statistics of your application. It lists the overall amount of your active flags, the overall amount of stale flags, and lastly, the flags that Unleash believes should be stale. This calculation is performed on the basis of flag types:

- **Release** - Used to enable trunk-based development for teams practicing Continuous Delivery. _Expected lifetime 40 days_
- **Experiment** - Used to perform multivariate or A/B testing. _Expected lifetime 40 days_
- **Operational** - Used to control operational aspects of the system's behavior. _Expected lifetime 7 days_
- **Kill switch** - Used to to gracefully degrade system functionality. _(permanent)_
- **Permission** - Used to change the features or product experience that certain users receive. _(permanent)_

If your flag exceeds the expected lifetime of its flag type it will be marked as _potentially stale_.

One thing to note is that the report card and corresponding list are showing stats related to the currently selected project. If you have more than one project, you will be provided with a project selector in order to swap between the projects.

### Health rating

Unleash calculates a project's health rating based on the project's total number of active flags and how many of those active flags are stale or potentially stale. When you archive a flag, it no longer counts towards your project's health rating.

The health rating updates once every hour, so there may be some lag if you have recently added, removed, or changed the status of a flag.

### Flag list {#toggle-list}

![A table of the flags in the current project with their health reports. The table has the following columns: name, last seen, created, expired, status, and report.](/img/togglelist.png)

The flag list gives an overview over all of your flags and their status. In this list you can sort the flags by their name, last seen, created, expired, status and report. This will allow you to quickly get an overview over which flags may be worth deprecating and removing from the code.
