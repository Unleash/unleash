---
title: "ADR: Frontend API design"
---

## Background

Previous version of the Frontend API (known as proxy API) had memory and I/O issues when a large number of tokens was used. 

To better understand how it worked you need to know that Frontend API is Unleash Node SDK exposed over the API.
Node SDK allows to plug in a custom repository so that it can fetch the toggles from a database instead of making remote HTTP calls. 

Every time a new Frontend API token was used we created a new SDK client with its own proxy repository. Proxy repository was fetching
the flags for a project and environment extracted from a token. 
Every time there was a revision ID change (e.g. after some flag changed the status) the repository was updating itself. 
Since every token had a dedicated repository with 10 tokens we were making 10 DB calls on each change. 
What's more each repository kept its own copy of the flags. What it means in practice is that two different tokens with the same
project and environments would store the same flags twice. 

![Frontend API before](/img/frontend-api-before.png)

## Decision

To address these challenges, we came up with a new design:

![Frontend API after](/img/frontend-api-after.png)

We decided to swap ProxyRepository with a drop-in replacement FrontendApiRepository. FrontendApiRepository doesn't store any flags on its own but always filters
the flags that we keep in a GlobalFrontendApiCache. The cache stores all the flags and updates on every revision ID change. 

Consequences:
* memory improvements: for a large number of tokens the memory footprint is reduced since we only store one copy of each flag in the cache and every repository
filters the data that it needs for a given project and environment obtained from the token
* I/O improvements: for a large number of tokens the number of DB calls is reduced to one per revision ID update since only the cache needs to be updated

