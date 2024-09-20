---
title: How to do A/B Testing
slug: /feature-flag-tutorials/use-cases/a-b-testing
---

## What is A/B Testing?

A/B testing is a randomized controlled experiment where you test two versions of a feature to see which version performs better. If you have more than two versions, it's known as multivariate testing. Coupled with analytics, A/B and multivariate testing enable you to better understand your users and how to serve them better.

Feature flags are a great way to run A/B tests and to decouple them from your code, and Unleash ships with features to make it easy to get started with.

Flags can be used for different purposes and we consider experimentation important enough to have given it its own flag type. Experiment flags have a lifetime expectancy suited to let you run an experiment and gather enough data to know whether it was a success or not.

## How to Perform A/B Testing with Unleash

To set up A/B testing, you will need:

-   A place to host a feature flag management service
-   API Tokens
-   An application & an Unleash SDK

We will walk through how to leverage these tools to perform A/B testing.

To set up your systems to create and manage A/B testing experimentation, you’ll need to decide where to host a feature flag management service. This is a critical component of creating features that will hide behind a feature flag for A/B testing.

There are two primary options for deciding where to host a service:

-   Self-hosted: Deploy Unleash on your infrastructure (e.g., Docker, Kubernetes).
-   Hosted by Unleash

Follow our documentation on [Self-Hosting with Unleash](/using-unleash/deploy/getting-started) to get started using your infrastructure. Alternatively, read our [Quickstart documentation](/quickstart) if you’d like your project to be hosted by Unleash.

With Unleash set up, you can use your application to talk to Unleash through one of our SDKs.

To conduct an A/B test, we will need to create the feature flag that will implement an activation strategy. In the next section, we will explore what strategies are and how they are configured in Unleash.

In the projects view, the Unleash platform shows a list of feature flags that you’ve generated. Click on the ‘New Feature Flag' button to create a new feature flag.
