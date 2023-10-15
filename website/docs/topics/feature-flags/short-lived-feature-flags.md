---
title: 7. Make feature flags short-lived. Do not confuse flags with application configuration.
---

Feature flags have a lifecycle shorter than an application lifecycle. The most common use case for feature flags is to protect new functionality. That means that when the roll-out of new functionality is complete, the feature flag should be removed from the code and archived. If there were old code paths that the new functionality replaces, those should also be cleaned up and removed.

Feature flags should not be used for static application configuration. Application configuration is expected to be consistent, long-lived, and read when launching an application. Using feature flags to configure an application can lead to inconsistencies between different instances of the same application. Feature flags, on the other hand, are designed to be short-lived, dynamic, and changed at runtime. They are expected to be read and updated at runtime and favor availability over consistency.

To succeed with feature flags in a large organization, you should:

  - **Use flag expiration dates**: By setting expiration dates for your feature flags, you make it easier to keep track of old feature flags that are no longer needed. A proper feature flag solution will inform you about potentially expired flags.

  - **Treat feature flags like technical debt.**: You must plan to clean up old feature branches in sprint or project planning, the same way you plan to clean up technical debt in your code. Feature flags add complexity to your code. You’ll need to know what code paths the feature flag enables, and while the feature flag lives, the context of it needs to be maintained and known within the organization. If you don’t clean up feature flags, eventually, you may lose the context surrounding it if enough time passes and/or personnel changes happen. As time passes, you will find it hard to remove flags, or to operate them effectively.    

- **Archive old flags**: Feature flags that are no longer in use should be archived after their usage has been removed from the codebase. The archive serves as an important audit log of feature flags that are no longer in use, and allows you to revive them if you need to install an older version of your application.

There are valid exceptions to short-lived feature flags. In general, you should try to limit the amount of long-lived feature flags. Some examples include: 

* Kill-switches - these work like an inverted feature flag and are used to gracefully disable part of a system with known weak spots. 
* Internal flags used to enable additional debugging, tracing, and metrics at runtime, which are too costly to run all the time. These can be enabled by software engineers while debugging issues.
