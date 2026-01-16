---
title: "ADR: Write Model vs Read Models"
---

## Background

We keep solving 3 problems in each of the business modules:
* changing the state of the system through actions
* displaying UI 
* asking other modules for information

In the past we had one pattern of `service + store` for handling all 3 of those. Store was responsible for changing state and returning UI data. Cross module collaboration
happened by calling services in other modules. While it was convenient and reduced the number of building blocks to learn, it also led to coupling between
services and overloaded stores - responsible for writing data, reading complex UI data and answering questions from other modules.

## Decision

To address these challenges categorize your problem as one of 3 models:

![3 types of models](/img/write-model-vs-read-models.png)

We have 3 types of models serving 3 different purposes:
* I need to take action that modifies a state of the system (Write Model) 

Solution: Go through the Command stack aka the *Write Model*. *Application logic* with the use case/workflow/steps resides in the *Application Service*. Application service can delegate
  business logic handling to the *Domain Model* if needed (only for complex subdomains like Change Requests). Simple domain logic (very few business if statements)
  can be handled together with the application logic. Application service calls the store that is responsible for the *generic CRUD operations* serving the write model. 

* I need to read data for UI display (External Read Model)
  
Solution: Expose *External Read Model* aka *View Model* that returns all the data in one query so that frontend doesn't have to ask multiple write models for data.
  View model will typically join data across a few DB tables since most UI screens required more than one table of data. If we keep the *complex queries* for UI
  in the external read model our stores can be generic and focused on the main table operations.

* I need information from another module to proceed with my module application logic (Internal Read Model)
  
Solution: Cross module queries can be handled with the *Internal Read Model*. Internal means it's used internally between our modules and not exposed to the UI.
  Internal read models are typically narrowly focused on answering one question and usually require *simple queries* compared to external read models. By introducing internal
  read model other business modules are not coupled to our module's service/store/write model and can't call write model methods from another module by accident.

## Example

Before (one multi-purpose class)
```typescript
class SegmentStore {
    // used to perform actions on segment
    create(segment: Segment): Promise<Segment> {}
    get(id: number): Promise<Segment> {}
    update(id: number, segment: Segment): Promise<Segment> {}
    delete(id: number): Promise<void> {}
    
    // used by UI
    getAll(): Promise<SegmentWithUsageInfo[]> {}
    
    // used by another module checking existing names
    getSegmentNames(): Promise<string[]> {}
}
```

After (3 role-based classes so clients depends only on method they use)
```typescript
// used to perform actions on segment
class SegmentStore {
    create(segment: Segment): Promise<Segment> {}
    get(id: number): Promise<Segment> {}
    update(id: number, segment: Segment): Promise<Segment> {}
    delete(id: number): Promise<void> {}
}

// used by UI
class SegmentViewModel {
    getAll(): Promise<SegmentWithUsageInfo[]> {}
}

// used by another module checking existing names
class SegmentReadModel {
    getSegmentNames(): Promise<string[]> {}
}
```

