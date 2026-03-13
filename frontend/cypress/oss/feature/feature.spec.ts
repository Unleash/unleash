///<reference path="../../global.d.ts" />

describe('feature', () => {
    const randomId = String(Math.random()).split('.')[1];
    const featureToggleName = `unleash-e2e-${randomId}`;

    before(() => {
        cy.runBefore();
    });

    after(() => {
        cy.deleteFeatureAPI(featureToggleName);
    });

    beforeEach(() => {
        cy.loginUI();
        cy.visit('/features');
    });

    it('can create a feature flag', () => {
        cy.createFeatureUI(featureToggleName, true, 'default', true);
        cy.contains(featureToggleName).should('exist');
    });
});
