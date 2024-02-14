---
title: My feature flag is not returned in the Frontend API/Edge/Proxy
---

By default, these endpoints will not return feature flags that are not enabled. This is mainly to save on bandwidth but it makes it a bit difficult to debug when features are not being returned. 

The first thing to look into is to validate that the feature is well configured and then check the token used from the SDK because it determines the set of accessible features. Last, verify that the context you're providing contains all the required data.

1. Check that the feature is properly enabled: 
    1. Verify that the feature has a strategy associated to it that will return true for your context (ref: [add a strategy](/how-to/how-to-create-feature-toggles#step-2))
    1. Verify that the feature has been enabled in the environment used by the client application (ref: [enabling a feature flag](/how-to/how-to-create-feature-toggles#step-3))
1. Check that your token is of the right [type](/reference/api-tokens-and-client-keys.mdx). To connect to the Frontend API, Edge or Proxy, you need to use a [Front-end token](/reference/api-tokens-and-client-keys#front-end-tokens)
1. Check that your token has access to the feature flag. The **token access configuration is immutable post-creation** and defines the set of features that the token can access. The different [parts of a token](/reference/api-tokens-and-client-keys#version-2) determine what projects and environment can be accessed:
    1. **Access to all projects (current and future)** - Tokens with a leading asterisk will provide access to all projects in a particular environment. For example, the token `*:production:xyz123etc...` will provide access to flags in the production environment of all projects.
    1. **Access to a discrete list of projects** - Tokens with a leading set of square brackets (empty) will be given access to a subset of projects in a particular environment. The token will look similar to the following: `[]:production:xyz123etc...`. Which projects the token has access to can be found on the API Tokens page in the Unleash admin UI.
    1. **Single project access** - Tokens that lead with a project name are bound to the specified project and environment. For example, `my_fullstack_app:production:xyz123etc...` will only have access to flags in the "my_fullstack_app" project as set in the production environment.
1. When using a **gradual rollout** strategy, be mindful of the **[stickiness](/reference/stickiness)** value. When evaluating a flag, if the provided context does not include the field used in the stickiness configuration, the gradual rollout strategy will be evaluated to `false` and therefore it will not be returned by the API.
1. Feature activation strategies can be combined in different ways, which may lead to complex scenarios. Try using the [Playground](/reference/playground.mdx) to verify that the feature is properly configured and responding as expected.


If you want to return a flag no matter if it's disabled or enabled you can move the disabled/enabled information into the [strategy variants](/reference/strategy-variants).

![enabled_disabled_variants](/img/enabled-disabled-variants.png 'Using enabled and disabled variants')

This flag itself is enabled in development and adds 50%/50% split between disabled/enabled variants. This is essentially the same as a gradual rollout of 50% but using variants.
Remember to use `getVariant` call instead of `isEnabled` call in your SDK.

You can combine this approach with more complex constraint based targeting.

![enabled_disabled_variants_complex](/img/enabled-disabled-variants-complex.png 'Using enabled and disabled variants with constraints')

This flag returns enabled variant for the client with the explicit `semver` and performs percentage split for the remaining clients.
