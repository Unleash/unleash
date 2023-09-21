---
title: 8. Use unique names across all applications. Enforce naming conventions. 
---

All flags served by the same Feature Flag Control service should have unique names across the entire cluster to avoid inconsistencies and errors. 

* **Avoid zombies:** Uniqueness should be controlled using a global list of feature flag names. This prevents the reuse of old flag names to protect new features. Using old names can lead to accidental exposure of old features, still protected with the same feature flag name. 
* **Naming convention enforcement: **Ideally, unique names are enforced at creation time. In a large organization, it is impossible for all developers to know all flags used. Enforcing a naming convention makes naming easier, ensures consistency, and provides an easy way to check for uniqueness.

Unique naming has the following advantages:

* **Flexibility over time: **Large enterprise systems are not static. Over time, monoliths are split into microservices, microservices are merged into larger microservices, and applications change responsibility. This means that the way flags are grouped will change over time, and a unique name for the entire organization ensures that you keep the option to reorganize your flags to match the changing needs of your organization.
* **Prevent conflicts**: If two applications use the same Feature Flag name it can be impossible to know which flag is controlling which applications. This can lead to accidentally flipping the wrong flag, even if they are separated into different namespaces (projects, workspaces etc). 
* **Easier to manage: **It's easier to know what a flag is used for and where it is being used when it has a unique name. E.g. It will be easier to search across multiple code bases to find references for a feature flag when it has a unique identifier across the entire organization. 
* **Enables collaboration:** When a feature flag has a unique name in the organization, it simplifies collaboration across teams, products and applications. It ensures that we all talk about the same feature. 
