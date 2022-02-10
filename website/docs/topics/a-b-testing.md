---
title: A/B and multivariate testing
---

A/B testing is a type of randomized controlled experiment, where you test two different versions of a feature to see which version performs better. If you have more than two versions, it's known as _multivariate testing_. Coupled with analytics, A/B and multivariate testing enables you to better understand your users and how you can serve them better.

To facilitate A/B testing and experimentation, Unleash has a built-in 'experiment' [toggle type](../advanced/feature_toggle_types#feature-toggle-types) and lets you give toggles any number of [variants](../advanced/toggle_variants). To see a concrete example of configuring multivariate testing with unleash, see [our blog post on A/B testing with Unleash and Google Analytics](https://www.getunleash.io/blog/a-b-n-experiments-in-3-simple-steps).

In the rest of this document, _A/B testing_ will refer to both strict A/B testing and multivariate testing unless otherwise specified.

## What is A/B testing

[According to Wikipedia](https://en.wikipedia.org/wiki/A/B_testing), A/B testing is a user experience research methodology. They're useful for understanding user engagement and satisfaction.

You've probably encountered a great number of A/B tests yourself, whether you've been aware of it or not.
Large social media sites often use A/B testing to make their user experiences more streamlined and successful, so you're almost guaranteed to have seen one if you use any of them. News websites often try different headlines for the same story to see which performs better; they'll often demo multiple headlines at once and then settle for the one that gets the most engagement. E-commerce websites use them in their purchase funnel to see how it impacts user drop-off. It's everywhere and, more importantly, it works.

In a nutshell: if you're attempting to grow your customer base or improve your user experience, you will always benefit from running experiments, and A/B testing is a fantastic way to get measurable results that point you in the right direction.

For some concrete examples of businesses that have used A/B testing to improve their outcomes, see [Crazy Egg's case study](https://www.crazyegg.com/blog/ab-testing-examples/) or [VWO's list of noteworthy examples](https://vwo.com/blog/ab-testing-examples/).

## How to do A/B testing

First off: you'll need a measurable outcome. You'll also have to be able to correlate the data you get with what group the user is in.

Say, for instance, that you're run a website where people can use with or without a membership. You're trying to improve the conversion rate and increase the number of members on the site. That gives us a measurable outcome: percentage of new sign-ups relative to the total number of users in the group. To correlate the data, you'll probably want to use a front-end analytics tool to track the number of users and how their interaction with the site.

In the above example, the A group serves as the control group. They're not going to see any changes. Group B, the _treatment group_, will get a website with a change that you think would impact the number of users who sign up, such as a larger, more prominent sign up button.

How long the experiment should run for depends on your use case, but you should get enough data to see if there's a clear trend. If more users in the treatment group sign up for a membership, you'll know that the changes had the intended effect. If there is no change (or a negative effect), then you'll know that they didn't work.

The simplest A/B experiments use a control group and a single treatment group, but that may not be the way forward in all situations. If you're launching a new feature, for instance, you won't have a control group that receives 'no change'. In that case, the question is the same (does A or B perform better), but you don't have a control group. Additionally, you might want to try out multiple variations — with or without a control group. The principles remain the same however: find a measurable goal, and see which variant performs better.

### Potential pitfalls

A thing to keep in mind when running experiments like this or in other cases where you're optimizing for a single metric is whether this is damaging to certain other metrics. Do more sign-ups also lead to more people (relatively) cancelling their membership? Does it decrease engagement with other parts of your product?

Don't do yourself a disservice by chasing one metric above all else. Keep an eye on other metrics at the same time and see if they are affected — always maintain a holistic view of things.


## A/B testing with Unleash

Feature toggles are a great way to run A/B tests and to decouple them from your code, and Unleash ships with features to make it easy to get started with.

Toggles can be used for different purposes and we consider experimentation important enough to have given it its own [toggle type](../advanced/feature_toggle_types#feature-toggle-types). Experiment toggles have a lifetime expectancy suited to let you run an experiment and gather enough data to know whether it was a success or not.

If you're running a basic A/B test where the control group doesn't see any change, then a basic experiment toggle will do the job excellently. With a [gradual rollout](../user_guide/activation_strategy#gradual-rollout), some appropriate [strategy constraints](../advanced/strategy_constraints), and an analytics tool of your choosing, you should be all set to start collecting metrics and measuring.

If you want to run a more advanced experiment, then take a look at using [feature toggle variants](../advanced/toggle_variants). If you have a control group, and want to test multiple potential improvements, then simply add your desired variants to the toggle as discussed in the previous paragraph. If you want to launch a new feature (or a headline) in multiple variations right out the gate, consider using a basic on/off toggle with variants and activate it for all your users.

### Impression data

[Impression data](../advanced/impression-data.md) is an Unleash feature that was released in Unleash 4.7.
It allows you to capture events whenever a feature toggle is checked in your applications.
The event contains all the information about the toggle and the current context, so you can pass everything onto your third-party analytics provider, such as [Google Analytics](https://analytics.google.com/analytics) or [Posthog](https://posthog.com/).
This makes Unleash even more useful as an A/B testing tool and makes it much easier to correlate events and variants with feature toggles and Unleash context.


## Summary

A/B testing allows you to run experiments on your users and improve your product by using real, proven metrics. It's used by some of the world's most popular businesses and can help you get ahead of competitors (and stay on top). We at Unleash want to help you, so we've baked in some tools to let you do A/B testing right out the gate to make it as smooth as possible to get started.

So what are you waiting for? Find out what you want to improve next and get testing!
