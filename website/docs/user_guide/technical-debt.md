---
id: technical_debt
title: Technical Debt
---

At Unleash we care deeply about code quality. Technical debt creeps up over time and slowly builds to the point where it really starts to hurt. At that point it's too late. Feature toggles that have outlived their feature and are not cleaned up represent technical debt that you should remove from your code.

## Stale and potentially stale toggles

When a toggle is no longer useful, we say that it has become _stale_. A stale toggle is a toggle that has served its purpose and that you should remove from the code base. For a toggle to become stale, you have to explicitly mark it as such. You can mark a toggle as stale in the [technical debt dashboard](#the-technical-debt-dashboard).

Unleash also has a concept of _potentially_ stale toggles. These are toggles that have lived longer than what Unleash expects them to based on their [feature toggle type](../advanced/feature-toggle-types.md). However, Unleash can't know for sure whether a toggle is actually stale or not, so it's up to you to make the decision on whether to mark it as stale or to keep it as an active toggle.

A toggle being (potentially) stale, does not affect how it performs in your application; it's only there to make it easier for you to manage your toggles.

## The technical debt dashboard

In order to assist with removing unused feature toggles, Unleash provides project health dashboards for each project. The health dashboard is listed as one of a project's tabs.

![Three UI elements describing the health rating of the project. The first card has info on the project, including its name. The second is the "report card", containing the project's overall health rating, a toggle report, and potential actions. The last card is a list of all the project's toggles with data on when it was last seen, when it was created, when it expired, its status and a report.](/img/reporting.png)

The dashboard includes a health report card, and a list of toggles that can be filtered on different parameters.

### Report card {#report-card}

![The project's health report card. It lists the project's health rating and when it was last updated; a toggle report containing the number of active toggles in the project; and potential actions, in this case asking the user to review potentially stale toggles.](/img/reportcard.png)

The report card includes some statistics of your application. It lists the overall amount of your active toggles, the overall amount of stale toggles, and lastly, the toggles that Unleash believes should be stale. This calculation is performed on the basis of toggle types:

- **Release** - Used to enable trunk-based development for teams practicing Continuous Delivery. _Expected lifetime 40 days_
- **Experiment** - Used to perform multivariate or A/B testing. _Expected lifetime 40 days_
- **Operational** - Used to control operational aspects of the system's behavior. _Expected lifetime 7 days_
- **Kill switch** - Used to to gracefully degrade system functionality. _(permanent)_
- **Permission** - Used to change the features or product experience that certain users receive. _(permanent)_

If your toggle exceeds the expected lifetime of it's toggle type it will be marked as _potentially stale_.

One thing to note is that the report card and corresponding list are showing stats related to the currently selected project. If you have more than one project, you will be provided with a project selector in order to swap between the projects.

### Health rating

Unleash calculates a project's health rating based on the project's total number of active toggles and how many of those active toggles are stale or potentially stale. When you archive a toggle, it no longer counts towards your project's health rating.

The health rating updates once every hour, so there may be some lag if you have recently added, removed, or changed the status of a toggle.

### Toggle list {#toggle-list}

![A table of the toggles in the current project with their health reports. The table has the following columns: name, last seen, created, expired, status, and report.](/img/togglelist.png)

The toggle list gives an overview over all of your toggles and their status. In this list you can sort the toggles by their name, last seen, created, expired, status and report. This will allow you to quickly get an overview over which toggles may be worth deprecating and removing from the code.
