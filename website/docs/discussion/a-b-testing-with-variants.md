---
title: A/B and multivariate testing
---

A/B testing is a type of randomized controlled experiment, where you test two different versions of a feature to see which version performs better. If you have more than two versions, it's known as _multivariate testing_. Coupled with analytics, A/B and multivariate testing enables you to better understand your users and how you can serve them better.

To facilitate A/B testing and experimentation, Unleash has a built-in 'experiment' [toggle type](http://localhost:3000/advanced/feature_toggle_types#feature-toggle-types) and lets you give toggles any number of [variants](https://docs.getunleash.io/advanced/toggle_variants).

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

### Potential issues

A thing to keep in mind when running experiments like this or in other cases where you're optimizing for a single metric is whether this is damaging to certain other metrics. Does more sign-ups also lead to more people (relatively) cancelling their membership? Does it decrease engagement with other parts of your product?

Don't do yourself a disservice by chasing one metric above all else. Keep an eye on other metrics at the same time and see if they are affected — always keep a holistic view of things.


## What can Unleash do for you?

### variants
### The experiment toggle type

> Hey all, has anyone found any really detailed explanations of variants and best practices? Maybe some examples?  I feel I understand the info in the docs but it didn't help me to paint a mental picture of how to best use it.
> https://docs.getunleash.io/advanced/toggle_variants
> I also found some examples in the php sdk README
> https://github.com/Unleash/unleash-client-php
> Which gave me a bit more info in how to best use it, but I find myself craving more examples and good ideas.

>  I'm trying to determine how YOU suggest I use it. From an end-user perspective, I see this cool tab that says "variants" and I can see from the UI that  I can give it 2 variants with a couple different strings and then some documentation in a couple SDKs that suggests "all you have to do is call .getVariants()! and then... nothing. Why do I want to call getVariants? what's the use case? what is it best for? why did you create it? give me some examples of it being used and show me how powerful it can be for my business... that kinda thing.

> I think overall I kinda "get" it... as in... I could invent a way to use it by returning 1 of 2 variants and then custom-coding a header that will display "Hello ${client.getVariant().value)" (just a placeholder code snippet I pulled out of nowhere in particular) or something like that and display "World" or "Earth" depending on the user but... Is that what it's intended for? That seems like I could almost as easily do that in code with an on/off switch. Wacha got for me?

## When is it appropriate
