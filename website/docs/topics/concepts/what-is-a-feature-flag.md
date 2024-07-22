---
title: What is a feature flag?
slug: /what-is-a-feature-flag
description: Feature flags, also known as feature toggles, allow developers to enable or disable features or code paths dynamically.
---

Feature flags, also known as feature toggles, allow developers to enable or disable features or code paths dynamically. This approach helps manage the deployment of new features, perform A/B testing, roll out features gradually, and provide quick rollback capabilities.

### The Concept

Feature flags work by wrapping a piece of code with a conditional statement that checks the status of a variable, called a flag. If the flag is enabled, the new code executes; if not, the existing or alternative code path runs. That flag can then be toggled (hence, feature toggles) dynamically at runtime. This enables features to be merged into the main codebase but remain dormant until they are ready to be activated.

<Figure img="/img/feature-flag-example.png" caption="At its most basic level, a feature flag is a conditional statement that checks the status of a variable. The value of the variable determines if the code path is enabled or disabled."/>


### Benefits of Feature Flags

Feature flags are a key part of DevOps, and help speed up the software development process. Feature flags:

* Reduce the need for long testing cycles that still fail to find all possible bugs when code meets real users.
* Minimize the risk of downtime when a feature needs to be rolled back. 
* Enable data-driven optimization, which is essential for improving user experience and driving revenue.

### Feature Flag Use Cases

#### Gradual Rollouts

Gradual rollouts involve deploying a new feature to a small subset of users initially and then gradually increasing the user base. This reduces the risk of widespread issues and allows for monitoring and feedback collection in a controlled manner. [Read more about how Unleash enables Gradual Rollouts.](https://www.getunleash.io/feature-flag-use-cases-progressive-or-gradual-rollouts)

#### A/B Testing

Feature flags facilitate A/B testing by allowing different user segments to experience an app without a particular feature, or different variants of a feature. This helps in determining which version performs better in terms of user engagement and other KPIs. [Read more about how Unleash enables A/B testing.](https://www.getunleash.io/feature-flag-use-cases-a-b-testing)

#### Kill Switches and Rollbacks

Kill switches provide the ability to quickly disable a feature if it starts causing issues in production. This minimizes the impact on users and allows for immediate rollback without requiring a new deployment. Read more about how to do [Kill Switches](https://www.getunleash.io/feature-flag-use-cases-software-kill-switches) and [Rollbacks](https://www.getunleash.io/feature-flag-use-cases-rollbacks) with Unleash.

<Figure img="/img/feature-flag-rollback.png" caption="Feature flags provide the ability to turn off code paths in production without deploying new code. This is useful when unexpected bugs pop up or in break-glass scenarios."/>


#### Trunk-Based Development

Feature flags enable [trunk-based development](https://www.getunleash.io/trunk-based-development) by allowing new features to be merged into the main branch continuously without being fully activated until they are ready. This supports continuous integration and continuous deployment (CI/CD) practices. [Read more about how to do Trunk-based Development](https://www.getunleash.io/feature-flag-use-cases-trunk-based-development) with Unleash.

#### Canary Deployments

Canary deployments use feature flags to roll out a new feature to a small, representative subset of users before a wider release. This allows for early detection of issues and ensures the feature is stable before full deployment. [Read more about how to do Canary Releases](https://www.getunleash.io/feature-flag-use-cases-canary-releases) with Unleash.


#### Feature Management

Feature management involves the strategic use of feature flags to control the lifecycle and rollout of features. This includes scheduling feature releases, managing access based on user roles, and monitoring feature performance and usage. Effective feature management ensures that new features are released in a controlled and measured manner, reducing risks and improving overall product stability. [Read more about how to do Feature Management ](https://www.getunleash.io/feature-flag-use-cases-feature-management)with Unleash.
#### FedRAMP and SOC2 Compliant Feature Flags

For enterprises with strict compliance requirements, feature flags must include robust security and access controls. This ensures that feature flagging systems meet industry standards and regulations, providing data encryption, secure storage, and regular audits. [Read more about how to enable compliant feature flags ](https://www.getunleash.io/fedramp-soc2-feature-flags)with Unleash.

#### A Few Words About Feature Flag Security, Access Controls, and Compliance

Because feature flags enable code execution, they require robust security and compliance measures. Most introductory tutorials on feature flags ignore these concepts, but you should think about how you will enable these controls early into your feature flag journey.

- **Access Controls:** Ensuring that only authorized users can interact with feature flags. Implementing role-based access control (RBAC) helps manage permissions effectively and enable the principle of least privilege.

- **Audit Logs:** Maintaining detailed logs of changes to feature flags to track who made changes and when. This is essential for both compliance and troubleshooting.

- **Change Requests and Approvals:** Implementing a structured process for handling change requests and approvals to ensure that modifications to feature flags are properly reviewed and authorized.

- **Single Sign-On (SSO) Integration:** Integrating with SSO systems to streamline authentication and enhance security.

- **Compliance:** Ensuring that the feature flagging system meets industry standards and regulations such as FedRAMP and SOC2. This is often greatly simplified when you run your feature flag solution in your own cloud or data center. Most [open-source feature flags](https://www.getunleash.io/pricing) providers allow you to self host.

### Implementing Feature Flags

Let's explore how feature flags can be implemented using a simple example in Python. You can explore a more comprehensive [Python feature flag tutorial](https://docs.getunleash.io/feature-flag-tutorials/python) here.

#### Step 1: Define Feature Flags

Feature flags can be stored in a configuration file, database, or environment variable. For simplicity, let's use a dictionary to represent our feature flags.

```python

feature_flags = {

    "new_feature": False,

    "beta_feature": True,

}

```

#### Step 2: Use Feature Flags in Code

Wrap the new feature code with a conditional statement that checks the status of the flag.

```python

def main_feature():

    print("This is the main feature.")

def new_feature():

    print("This is the new feature.")

def beta_feature():

    print("This is the beta feature.")

def execute_features():

    main_feature()

    if feature_flags.get("new_feature"):

        new_feature()

    if feature_flags.get("beta_feature"):

        beta_feature()

execute_features()

```

In this example, `main_feature` is always executed. The `new_feature` and `beta_feature` functions are executed only if their corresponding flags are enabled.

Now, if you turn these static variables into dynamic feature flags connected to a feature management system, you can enable or disable `new_feature` and `beta_feature` dynamically without redeploying your code. That’s the beauty of feature flags.

### Conclusion

Feature flags are a versatile tool in modern software development, offering numerous advantages for managing feature deployment, experimentation, and risk mitigation. 

They are a fantastic tool  for speeding up the development process, reducing downtime risks, and enabling data-driven optimization. With  robust security, access controls, and compliance measures, feature flags can be used at scale, ensuring stability and security in production environments. 

Whether you're working on a small project or a large-scale application, integrating feature flags will  significantly enhance your workflow and the stability of your products.
