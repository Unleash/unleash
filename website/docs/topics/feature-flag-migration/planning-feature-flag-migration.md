---
title: Planning Feature Flag Migration
---

When planning your feature flag migration, it is essential to focus on four key areas:

* Use cases
* Core feature flag setup
* Key stakeholders
* System architecture

## Use Cases

A key requirement is to understand how feature flags will be used so that you can set up the proper data model, user permissions, and system architecture.  

Below are some of the most common use cases for feature flags. Start by selecting those that are in scope for your initial rollout. It is common to start with some, but not all, of these and roll out the remaining in the future.

Use cases for feature flags:

* Operational or Permission flags (also known as "Kill Switches")
* Gradual rollouts
* Canary releases
* A/B testing / Experimentation

Core Feature Flag setup

This planning phase is all about understanding the anatomy of the existing feature flag setup so it can be moved to Unleash. 

Key questions include:

* How many flags are there?
* How many are active? 
* Do the inactive flags need to be migrated, or can they be removed entirely, simplifying migration?

Once you have an understanding of what needs to be migrated, you should plan for how flags will be organized in the future.  Picking the right organizing principle is critical for access controls. Unleash supports Application, Project, Environment, and Role-based access, so pick the option that makes the most logical sense for your organization.

Our experience tells us that organizing flags by the development teams that work on them is the best approach.  For example: 

* By application or microservice
    * E.g. Shopping Cart, Website, Mobile app
* By Projects
    * E.g. Logistics, Finance
* By organization hierarchy
    * E.g. Frontend, backend, platform teams

## Key stakeholders

When planning your migration, it is important to understand who will be managing the feature flag system and who will be using the feature flag system on a day-to-day basis.  Additionally, you need to know who will be responsible for key migration tasks.

From our experience, looping all key stakeholders into the project early on means that all eventualities can be planned for in advance, reducing the risk of project implementation delays due to unforeseen sign-off requirements. Decision makers can help assign and gather resources needed for the migration, as well as advise on the correct business processes that need to be followed at the various project stages.

System Architecture

You will also need to plan how you set up Unleash itself as part of your migration planning process. Unleash is extremely flexible with lots of hosting and security configuration options to align with the unique requirements of large enterprises.


## How is our current feature flag architecture set up?

This part is key to understanding how Unleash needs to be implemented. This plays a part in resource planning for both personnel and infrastructure cost allocation.  For instance

* What languages and frameworks are our front end and backend using?
* Where are our applications hosted?
* Where are end users of the application based geographically?

## Security and organizational policy requirements

You will also want to pay attention to Security & Organisational Policy requirements.

For example, do you need to keep sensitive context inside your firewall perimeter? 

Often the answer to this question defines whether you will run Unleash in a hosted, or self-hosted fashion.

Many customers prefer a hosted solution if their security policy will allow it because it reduces overhead on SRE teams and infrastructure. Unleash offers a single-tenant hosted solution, so even security-conscious customers can sometimes opt for a hosted solution.

If that is not an option, Unleash instances need to be managed by customer SRE / DevOps teams. If this is the direction you are going, you should plan for it in this phase of the project.

Other areas of system architecture to investigate during the planning phase are:

* Data protection
    * Do we have to comply with HIPPA, SOC-2, ISO 27001, GDPR, etc?
* How do we authenticate and manage user access & RBAC/roles?
* Do we have any Change Management policies we need to adhere to?
* Do we consume feature flag data, such as events, in any other systems downstream? 
    * For example, Jira Cloud for issue management, Datadog for real-time telemetry, Slack or Microsoft Teams for notifications or Google Analytics for user interactions.

Use our [Feature Flag Migration template](https://docs.google.com/spreadsheets/d/1MKc95v7Tc-9tznWMDVSy2vvmVJTvOFLRVZpx1QrL-_U/edit#gid=996250264) to fill in details about your project planning.
