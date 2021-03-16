---
id: technical_debt
title: Technical Debt
---

At Unleash we care deeply about code quality. Technical debt creeps up over time and slowly builds to the point where it really starts to hurt. At that point it's too late. Feature toggles that have outlived their feature and are not cleaned up represent technical dept that should be cleaned up and removed from your code.

In order to assist with removing unused feature toggles, Unleash provides a technical debt dashboard in the management-ui. You can find it by opening up the sidebar in the management ui and clicking on the _reporting_ menu item.

![Technical debt](../assets/reporting.png)

The dasboard includes a health report card, and a list of toggles that can be filtrated on different parameters.

## Report card

![Report card](../assets/reportcard.png)

The report card includes some statistics of your application. It lists the overall amount of your active toggles, the overall amount of stale toggles, and lastly, the toggles that Unleash believes should be stale. This calculation is performed on the basis of toggle types:

- **Release** - Used to enable trunk-based development for teams practicing Continuous Delivery. _Expected lifetime 40 days_
- **Experiment** - Used to perform multivariate or A/B testing. _Expected lifetime 40 days_
- **Operational** - Used to control operational aspects of the system's behavior. _Expected lifetime 7 days_
- **Kill switch** - Used to to gracefully degrade system functionality. _(permanent)_
- **Permission** - Used to change the features or product experience that certain users receive. _(permanent)_

If your toggle exceeds the expected lifetime of it's toggle type it will be marked as _potentially stale_.

Your overall health rating is calculated based on the total amount of toggles and how many stale and potentially stale toggles you have in your project. One thing to note is that the report card and corresponding list are showing stats related to the currently selected project. If you have more than one project, you will be provided with a project selector in order to swap between the projects.

## Toggle list

![Toggle list](../assets/togglelist.png)

The toggle list gives an overview over all of your toggles and their status. In this list you can sort the toggles by their name, last seen, created, expired, status and report. This will allow you to quickly get an overview over which toggles may be worth deprecating and removing from the code.
