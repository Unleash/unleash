---
title: "ADR: OpenAPI SDK Generator"
---

## Background

In our current frontend setup we have a lot of code that can be generated out of the OpenAPI schema. Types have not been updated in a while, and even some new features rely on hard-coded types instead of auto-generated files in `src/openapi`. Fetchers and actions in the frontend involve custom-built code that is grouped in the `src/hooks/api` folder. There is a separation between getters and actions. Getters use the SWR library. API actions (POST/PUT/DELETE) are grouped by feature and are exposed to components reliant on `useAPI` hook.

## Decisions

- We will use the [Orval](https://orval.dev/) package to generate the typescript types for our SDK.
- We will consider using Orval to generate the HTTP getters and actions for our SDK in the future, but will first carefully test this approach in new features under development to weed out edge cases.
- We will deprecate `src/interfaces` related to API calls and use `src/openapi` models instead.

### Advantages

SDK generated out of it will be better than what we have right now. It will help reduce the risk of duplication and inconsistencies in our SDK, as it will be generated from a single source of truth.

- We retain the flexibility of previous solution, because we can implement our own _fetcher_ function, and substitute _response_ and _error_ type generics. See https://orval.dev/guides/custom-client
- It supports `anyOf` and `oneOf` schema, which the previous generator did not support.
- If we decide to use Orval to generate the HTTP getters and actions for our SDK, it will reduce the amount of boilerplate code required when working with the new APIs.

### Concerns

- We will need to ensure that we keep our OpenAPI specification up-to-date, as any changes in the specification will be reflected in the generated SDK. We need an enterprise version with all experimental endpoints enabled to get complete output.
- Orval is well-maintained, but it appears to have just 1 core contributor. SDK is a very important thing and should be reliable.
- We can revert to writing some API calls by hand if this approach is not flexible enough, but this can cause issues negating the benefits of code generation.

## Alternative packages considered

- `@openapitools/openapi-generator` - does not offer as many customization options as Orval. It struggles with `anyOf` and `oneOf` types. It fails 
- `rapini`: This package is less flexible and less actively maintained than Orval, and we therefore decided against it.
- `@openapi-codegen` - does not generate SWR hooks
