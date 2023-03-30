/// <reference types="cypress" />

const ENTERPRISE = Boolean(Cypress.env('ENTERPRISE'));
const randomId = String(Math.random()).split('.')[1];
const baseUrl = Cypress.config().baseUrl;
let strategyId = '';
const userName = `settings-user-${randomId}`;
const projectName = `stickiness-project-${randomId}`;
const TEST_STICKINESS = 'userId';

// Disable all active splash pages by visiting them.
const disableActiveSplashScreens = () => {
    cy.visit(`/splash/operators`);
};

const disableFeatureStrategiesProdGuard = () => {
    localStorage.setItem(
        'useFeatureStrategyProdGuardSettings:v2',
        JSON.stringify({ hide: true })
    );
};

describe('project settings', () => {
    before(() => {
        disableFeatureStrategiesProdGuard();
        disableActiveSplashScreens();
    });

    const createFeature = (name: string) => {
        cy.get('[data-testid=NAVIGATE_TO_CREATE_FEATURE').click();

        cy.intercept('POST', `/api/admin/projects/${projectName}/features`).as(
            'createFeature'
        );

        cy.get("[data-testid='CF_NAME_ID'").type(name);
        cy.get("[data-testid='CF_DESC_ID'").type('hello-world');
        cy.get("[data-testid='CF_CREATE_BTN_ID']").click();
        cy.wait('@createFeature');
    };

    const createProject = () => {
        cy.get('[data-testid=NAVIGATE_TO_CREATE_PROJECT').click();

        cy.intercept('POST', `/api/admin/projects`).as('createProject');

        cy.get("[data-testid='PROJECT_ID_INPUT']").type(projectName);
        cy.get("[data-testid='PROJECT_NAME_INPUT']").type(projectName);
        cy.get("[id='stickiness-select']")
            .first()
            .click()
            .get(`[data-testid=SELECT_ITEM_ID-${TEST_STICKINESS}`)
            .first()
            .click();
        cy.get("[data-testid='CREATE_PROJECT_BTN']").click();
        cy.wait('@createProject');
    };

    it('should store default project stickiness when creating, retrieve it when editing a project', () => {
        cy.login();
        cy.visit(`/projects`);
        createProject();
        cy.visit(`/projects/${projectName}`);
        cy.get("[data-testid='NAVIGATE_TO_EDIT_PROJECT']").click();

        //then
        cy.get("[id='stickiness-select']")
            .first()
            .should('have.text', 'userId');

        cy.request('DELETE', `${baseUrl}/api/admin/projects/${projectName}`);
    });

    it('should respect the default project stickiness when creating a Gradual Rollout Strategy', () => {
        cy.login();
        cy.visit(`/projects`);
        if (document.querySelector("[data-testid='CLOSE_SPLASH']")) {
            cy.get("[data-testid='CLOSE_SPLASH']").click();
        }
        createProject();
        cy.visit(`/projects/${projectName}`);
        const featureToggleName = `settings-${randomId}`;
        createFeature(featureToggleName);
        cy.visit(
            `/projects/${projectName}/features/${featureToggleName}/strategies/create?environmentId=development&strategyName=flexibleRollout`
        );

        //then
        cy.get("[id='stickiness-select']")
            .first()
            .should('have.text', 'userId');

        if (ENTERPRISE) {
            cy.get('[data-testid=ADD_CONSTRAINT_ID]').click();
            cy.get('[data-testid=DIALOGUE_CONFIRM_ID]').click();
        }

        cy.intercept(
            'POST',
            `/api/admin/projects/${projectName}/features/${featureToggleName}/environments/development/strategies`,
            req => {
                expect(req.body.name).to.equal('flexibleRollout');
                expect(req.body.parameters.groupId).to.equal(featureToggleName);
                expect(req.body.parameters.stickiness).to.equal('userId');
                expect(req.body.parameters.rollout).to.equal('50');

                if (ENTERPRISE) {
                    expect(req.body.constraints.length).to.equal(1);
                } else {
                    expect(req.body.constraints.length).to.equal(0);
                }

                req.continue(res => {
                    strategyId = res.body.id;
                });
            }
        ).as('addStrategyToFeature');

        cy.get(`[data-testid=STRATEGY_FORM_SUBMIT_ID]`).first().click();
        cy.wait('@addStrategyToFeature');

        //clean
        cy.request(
            'DELETE',
            `${baseUrl}/api/admin/features/${featureToggleName}`
        );

        cy.request('DELETE', `${baseUrl}/api/admin/projects/${projectName}`);
    });

    it('should respect the default project stickiness when creating a variant', () => {
        cy.login();
        cy.visit(`/projects`);
        createProject();
        cy.visit(`/projects/${projectName}`);
        const featureToggleName = `settings-${randomId}-2`;
        createFeature(featureToggleName);

        cy.visit(
            `/projects/${projectName}/features/${featureToggleName}/variants`
        );

        cy.get("[data-testid='ADD_VARIANT_BUTTON']").first().click();
        //then
        cy.get("[id='stickiness-select']")
            .first()
            .should('have.text', 'userId');

        //clean
        cy.request(
            'DELETE',
            `${baseUrl}/api/admin/features/${featureToggleName}`
        );

        cy.request('DELETE', `${baseUrl}/api/admin/projects/${projectName}`);
    });
});
