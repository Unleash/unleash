/// <reference types="cypress" />

type UserCredentials = { email: string; password: string };
const ENTERPRISE = Boolean(Cypress.env('ENTERPRISE'));
const randomId = String(Math.random()).split('.')[1];
const featureToggleName = `settings-${randomId}`;
const baseUrl = Cypress.config().baseUrl;
let strategyId = '';
const userName = `settings-user-${randomId}`;
const projectName = `stickiness-project-${randomId}`;

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

describe('notifications', () => {
    before(() => {
        disableFeatureStrategiesProdGuard();
        disableActiveSplashScreens();
        cy.login();
    });

    after(() => {
        cy.request(
            'DELETE',
            `${baseUrl}/api/admin/features/${featureToggleName}`
        );

        cy.request('DELETE', `${baseUrl}/api/admin/projects/${projectName}`);
    });

    beforeEach(() => {
        cy.login();
        cy.visit(`/projects`);
        if (document.querySelector("[data-testid='CLOSE_SPLASH']")) {
            cy.get("[data-testid='CLOSE_SPLASH']").click();
        }
    });

    afterEach(() => {
        cy.request('DELETE', `${baseUrl}/api/admin/projects/${projectName}`);
    });

    const createFeature = () => {
        cy.get('[data-testid=NAVIGATE_TO_CREATE_FEATURE').click();

        cy.intercept('POST', `/api/admin/projects/${projectName}/features`).as(
            'createFeature'
        );

        cy.get("[data-testid='CF_NAME_ID'").type(featureToggleName);
        cy.get("[data-testid='CF_DESC_ID'").type('hello-world');
        cy.get("[data-testid='CF_CREATE_BTN_ID']").click();
        cy.wait('@createFeature');
    };

    const createProject = () => {
        cy.get('[data-testid=NAVIGATE_TO_CREATE_PROJECT').click();

        cy.get("[data-testid='PROJECT_ID_INPUT']").type(projectName);
        cy.get("[data-testid='PROJECT_NAME_INPUT']").type(projectName);
        cy.get("[id='stickiness-select']")
            .first()
            .click()
            .get('[data-testid=SELECT_ITEM_ID-userId')
            .first()
            .click();
        cy.get("[data-testid='CREATE_PROJECT_BTN']").click();
    };

    it('should store default project stickiness when creating, retrieve it when editing a project', () => {
        createProject();

        cy.visit(`/projects/${projectName}`);
        if (document.querySelector("[data-testid='CLOSE_SPLASH']")) {
            cy.get("[data-testid='CLOSE_SPLASH']").click();
        }
        cy.get("[data-testid='NAVIGATE_TO_EDIT_PROJECT']").click();

        //then
        cy.get("[id='stickiness-select']")
            .first()
            .should('have.text', 'userId');
    });

    it('should respect the default project stickiness when creating a Gradual Rollout Strategy', () => {
        createProject();
        createFeature();
        cy.visit(
            `/projects/default/features/${featureToggleName}/strategies/create?environmentId=development&strategyName=flexibleRollout`
        );

        //then
        cy.get("[id='stickiness-select']")
            .first()
            .should('have.text', 'userId');
    });

    it('should respect the default project stickiness when creating a variant', () => {
        createProject();
        createFeature();

        cy.visit(`/projects/default/features/${featureToggleName}/variants`);

        cy.get("[data-testid='EDIT_VARIANTS_BUTTON']").click();
        //then
        cy.get('#menu-stickiness').first().should('have.text', 'userId');
    });
});
