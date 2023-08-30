---
title: My feature flag is not returned in the Frontend API/Edge/Proxy
---

By default, these endpoints will not return features that are not enabled. This is mainly to save on bandwidth but it can be confusing when you expect your customers to be exposed to a feature but they’re not. What features are accessible to you is mainly determined by the token you’re using and the type of access it has.
1. Check that the feature is enabled in two places: 
    1. **Feature flag level** - This is the top-level enablement process for a feature flag. Strategies will not be respected if this top-level feature flag is disabled.
    1. **Strategy level** - Strategies allow for different constraints and segments to be addressed in a unique fashion. If a strategy is disabled, the constraints and segment rules will not be respected.
1. Check that your token has access to the feature flag. The **token access configuration is immutable post-creation**. There are [three types of token types](../reference/api-tokens-and-client-keys.mdx):
    1. **Global Access** - Tokens with a leading asterisk will provide access to all projects of a particular environment type. For example, the token `*:production:xyz123etc...` will provide access to flags in all production environments.
    1. **Selective Access** - Tokens with a leading set of square brackets (empty) will be given access to a subset of projects in the production environment. The token will look similar to the following: `[]:production:xyz123etc...`. Which projects the token will have access to can be found on the API Tokens page.
    1. **Single Access** - Tokens that lead with a project name are bound to the specified project and environment. For example, `my_fullstack_app:production:xyz123etc...` will only have access to flags in the "my_fullstack_app" project as set in the production environment.
1. Feature activation strategies can use stickiness to assign the same treatment to users based on a property value of the context. If the activation strategy is sticky on a value and that value is not present in the context, the feature will evaluate to false and therefore won’t be part of the response. In this case, you can either use the default stickiness option or use a different field that you know will always be present in the context.
1. Feature activation strategies may have constraints, segments, and rules that can be combined in different ways that can lead to complex scenarios. Try using the [Playground](../reference/playground.mdx) to verify that the feature is properly configured and responding as expected.
