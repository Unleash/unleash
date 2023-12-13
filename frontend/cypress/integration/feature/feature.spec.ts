///<reference path="../../global.d.ts" />

describe('feature', () => {
    const randomId = String(Math.random()).split('.')[1];
    const featureToggleName = `unleash-e2e-${randomId}`;
    const projectName = `unleash-e2e-project-${randomId}`;

    const variant1 = 'variant1';
    const variant2 = 'variant2';

    before(() => {
        cy.runBefore();
        cy.login_UI();
        cy.createProject_API(projectName);
    });

    after(() => {
        cy.deleteFeature_API(featureToggleName, projectName);
        cy.deleteProject_API(projectName);
    });

    beforeEach(() => {
        cy.login_UI();
        cy.visit('/features');
    });

    it('can create a feature toggle', () => {
        cy.createFeature_UI(featureToggleName, true, projectName);
        cy.url().should('include', featureToggleName);
    });

    it('gives an error if a toggle exists with the same name', () => {
        cy.createFeature_UI(featureToggleName, false, projectName);
        cy.get("[data-testid='INPUT_ERROR_TEXT']").contains(
            'A toggle with that name already exists',
        );
    });

    it('gives an error if a toggle name is url unsafe', () => {
        cy.createFeature_UI('featureToggleUnsafe####$#//', false, projectName);
        cy.get("[data-testid='INPUT_ERROR_TEXT']").contains(
            `"name" must be URL friendly`,
        );
    });

    it('can add, update and delete a gradual rollout strategy to the development environment', () => {
        cy.addFlexibleRolloutStrategyToFeature_UI({
            featureToggleName,
            project: projectName,
        }).then(() => {
            cy.updateFlexibleRolloutStrategy_UI(
                featureToggleName,
                projectName,
            ).then(() =>
                cy.deleteFeatureStrategy_UI(
                    featureToggleName,
                    false,
                    projectName,
                ),
            );
        });
    });

    it('can add variants to the development environment', () => {
        cy.addVariantsToFeature_UI(
            featureToggleName,
            [variant1, variant2],
            projectName,
        );
    });

    it('can update variants', () => {
        cy.visit(
            `/projects/${projectName}/features/${featureToggleName}/variants`,
        );

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
            `/api/admin/projects/${projectName}/features/${featureToggleName}/environments/development/variants`,
            (req) => {
                expect(req.body[0].op).to.equal('replace');
                expect(req.body[0].path).to.equal('/1/weightType');
                expect(req.body[0].value).to.equal('fix');
                expect(req.body[1].op).to.equal('replace');
                expect(req.body[1].path).to.equal('/1/weight');
                expect(req.body[1].value).to.equal(150);
                expect(req.body[2].op).to.equal('replace');
                expect(req.body[2].path).to.equal('/0/weight');
                expect(req.body[2].value).to.equal(850);
            },
        ).as('variantUpdate');

        cy.get('[data-testid=DIALOGUE_CONFIRM_ID]').click();
        cy.get(`[data-testid=VARIANT_WEIGHT_${variant2}]`).should(
            'have.text',
            '15 %',
        );
    });

    it('can delete variants', () => {
        cy.deleteVariant_UI(featureToggleName, variant2, projectName);
    });
});
