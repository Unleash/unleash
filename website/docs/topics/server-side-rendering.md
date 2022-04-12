---
title: Unleash and server-side rendering
---

## The practical stuff

### Prerequisites

Provide InMemoryStorageProvider
Provide a fetch implementation.

See [this GitHub issue regarding usage with Next.js](https://github.com/Unleash/proxy-client-react/issues/40).

### How to do SSR

disable metrics and disable refresh to avoid keeping thread alive. this can cause a memory leak.

Zoro did this and created a new client on every request.

#### Anything for Next.js specifically?

Can the toggles be made available via a global cache? This could save you from having to make an http request to fetch toggles on every incoming request.

### How to do SSG

Should work the same as SSR, just done at build time.

## The discussion

### When is SSR appropriate?

When the same feature flags apply to a lot of users

### When shouldn't you use SSR?

If everything is very client-specific, you may be better off resolving feature flags on the client. Improves caching, etc.
