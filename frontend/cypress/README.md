## Unleash Behavioural tests

### Add common commands to Cypress

-   `global.d.ts` is where we extend Cypress types
-   `API.ts` contains api requests for common actions (great place for cleanup actions)
-   `UI.ts` contains common functions for UI operations
-   `commands.ts` is the place to map the functions to a cypress command

### Test Format

Ideally each test should manage its own data.

Avoid using `after` and `afterEach` hooks for cleaning up. According to Cypress docs, there is no guarantee that the functions will run

Suggested Format:

-   `prepare`
-   `when`
-   `then`
-   `clean`

#### Passing (returned) parameters around

```ts
it('can add, update and delete a gradual rollout strategy to the development environment', async () => {
    cy.addFlexibleRolloutStrategyToFeature_UI({
        featureToggleName,
    }).then(value => {
        strategyId = value;
        cy.updateFlexibleRolloutStrategy_UI(featureToggleName, strategyId).then(
            () => cy.deleteFeatureStrategy_UI(featureToggleName, strategyId)
        );
    });
});
```
