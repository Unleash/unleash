///<reference path="../../global.d.ts" />

describe('feature', () => {
    const baseUrl = Cypress.config().baseUrl;
    const randomId = String(Math.random()).split('.')[1];
    const featureToggleName = `unleash-e2e-${randomId}`;
    const projectName = `unleash-e2e-project-${randomId}`;

    before(() => {
        cy.runBefore();
        cy.login_UI();
        cy.createProject_API(projectName);
    });

    after(() => {
        cy.on('uncaught:exception', (err) => {
            if (
                err.message.includes(
                    'ResizeObserver loop completed with undelivered notifications',
                )
            ) {
                console.log(
                    'Ignored an uncaught resize observer error:',
                    err.message,
                );
                // ignore resize observer errors
                // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver#observation_errors
                // returning false here prevents Cypress from failing the test
                return false;
            }
        });
        cy.deleteFeature_API(featureToggleName, projectName);
        cy.deleteProject_API(projectName);
    });

    beforeEach(() => {
        cy.login_UI();
        cy.visit('/features');

        cy.intercept('GET', `${baseUrl}/api/admin/ui-config`, (req) => {
            req.headers['cache-control'] =
                'no-cache, no-store, must-revalidate';
            req.on('response', (res) => {
                if (res.body) {
                    res.body.flags = {
                        ...res.body.flags,
                    };
                }
            });
        });
    });

    it('can create a feature flag', () => {
        cy.createFeature_UI(featureToggleName, true, projectName);
        cy.contains('td', featureToggleName).should('exist');
    });

    it('gives an error if a toggle exists with the same name', () => {
        cy.createFeature_UI(featureToggleName, false, projectName);
        cy.get("[data-testid='INPUT_ERROR_TEXT']").contains(
            'A flag with that name already exists',
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
        });

        cy.updateFlexibleRolloutStrategy_UI(featureToggleName, projectName);

        cy.deleteFeatureStrategy_UI(featureToggleName, false, projectName);
    });
});
