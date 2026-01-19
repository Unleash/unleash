---
title: "ADR: Domain Code Must Not Depend on Infrastructure Types (e.g., OpenAPI)"
---

## Background

We’ve identified an architectural issue in our backend code: domain-layer code (especially store interfaces) sometimes directly references infrastructure-layer types, such as OpenAPI schemas.
This breaks a foundational principle of layered architecture: "Domain code should not depend on infrastructure, but infrastructure can depend on domain."

## Decision

All domain code—including store interfaces and business logic—must operate on domain types, not infrastructure types such as OpenAPI schemas.
Any mapping between API types and domain types must occur at the boundary (e.g., in controllers), not in the core logic.

## Consequences

* Clear architectural boundaries: Domain is isolated from infrastructure concerns like transport and serialization.
* Improved modularity: Domain logic can move between OSS and Enterprise without dragging along OpenAPI types or other infrastructure.
* Greater flexibility: We can evolve domain types rapidly and experimentally without worrying about breaking public API contracts.
* Increased mapping boilerplate: Conversion logic between domain and infrastructure types must be written explicitly at the boundaries.

## Example

Before 
```typescript
store.createUser(user: CreateUserSchema): Promise<void>;
```

After 
```typescript
// Domain-layer store uses a domain type
store.createUser(user: DomainUser): Promise<void>;

// API-layer controller maps OpenAPI to domain
const domainUser = mapFromApiType(apiUser);
await store.createUser(domainUser);
```

