///<reference path="../../global.d.ts" />

describe('feature', () => {
    const randomId = String(Math.random()).split('.')[1];
    const featureToggleName = `unleash-e2e-${randomId}`;

    before(() => {
        cy.runBefore();
    });

    after(() => {
        cy.deleteFeature_API(featureToggleName);
    });

    beforeEach(() => {
        cy.login_UI();
        cy.visit('/features');
    });

    it('can create a feature flag', () => {
        cy.createFeature_UI(featureToggleName, true, 'default', true);
        cy.url().should('include', featureToggleName);
    });
});
