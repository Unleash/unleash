///<reference path="../../global.d.ts" />

describe('feature', () => {
    const randomId = String(Math.random()).split('.')[1];
    const featureToggleName = `unleash-e2e-${randomId}`;

    const variant1 = 'variant1';
    const variant2 = 'variant2';

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

    it('can create a feature toggle', () => {
        cy.createFeature_UI(featureToggleName, true);
        cy.url().should('include', featureToggleName);
    });

    it('gives an error if a toggle exists with the same name', () => {
        cy.createFeature_UI(featureToggleName, false);
        cy.get("[data-testid='INPUT_ERROR_TEXT']").contains(
            'A toggle with that name already exists'
        );
    });

    it('gives an error if a toggle name is url unsafe', () => {
        cy.createFeature_UI('featureToggleUnsafe####$#//', false);
        cy.get("[data-testid='INPUT_ERROR_TEXT']").contains(
            `"name" must be URL friendly`
        );
    });

    it('can add, update and delete a gradual rollout strategy to the development environment', () => {
        cy.addFlexibleRolloutStrategyToFeature_UI({
            featureToggleName,
        }).then(() => {
            cy.updateFlexibleRolloutStrategy_UI(featureToggleName).then(() =>
                cy.deleteFeatureStrategy_UI(featureToggleName)
            );
        });
    });

    it('can add variants to the development environment', () => {
        cy.addVariantsToFeature_UI(featureToggleName, [variant1, variant2]);
    });

    it('can update variants', () => {
        cy.visit(`/projects/default/features/${featureToggleName}/variants`);

        cy.get('[data-testid=EDIT_VARIANTS_BUTTON]').click();
        cy.get('[data-testid=VARIANT_NAME_INPUT]')
            .last()
            .children()
            .find('input')
            .should('have.attr', 'disabled');
        cy.get('[data-testid=VARIANT_WEIGHT_CHECK]')
            .last()
            .find('input')
            .check();
        cy.get('[data-testid=VARIANT_WEIGHT_INPUT]').last().clear().type('15');

        cy.intercept(
            'PATCH',
            `/api/admin/projects/default/features/${featureToggleName}/environments/development/variants`,
            req => {
                expect(req.body[0].op).to.equal('replace');
                expect(req.body[0].path).to.equal('/1/weightType');
                expect(req.body[0].value).to.equal('fix');
                expect(req.body[1].op).to.equal('replace');
                expect(req.body[1].path).to.equal('/1/weight');
                expect(req.body[1].value).to.equal(150);
                expect(req.body[2].op).to.equal('replace');
                expect(req.body[2].path).to.equal('/0/weight');
                expect(req.body[2].value).to.equal(850);
            }
        ).as('variantUpdate');

        cy.get('[data-testid=DIALOGUE_CONFIRM_ID]').click();
        cy.get(`[data-testid=VARIANT_WEIGHT_${variant2}]`).should(
            'have.text',
            '15 %'
        );
    });

    it('can delete variants', () => {
        cy.deleteVariant_UI(featureToggleName, variant2);
    });
});
