/// <reference types="cypress" />

type UserCredentials = { email: string; password: string };
const ENTERPRISE = Boolean(Cypress.env('ENTERPRISE'));
const randomId = String(Math.random()).split('.')[1];
const featureToggleName = `notifications_test-${randomId}`;
const baseUrl = Cypress.config().baseUrl;
let strategyId = '';
const userName = `settings-user-${randomId}`;
const projectName = `stickiness-project`;

// Disable all active splash pages by visiting them.
const disableActiveSplashScreens = () => {
    cy.visit(`/splash/operators`);
};

describe('notifications', () => {
    before(() => {
        disableActiveSplashScreens();
        cy.login();
    });

    after(() => {
        cy.request(
            'DELETE',
            `${baseUrl}/api/admin/features/${featureToggleName}`
        );
    });

    beforeEach(() => {
        cy.login();
        cy.visit(`/projects/${projectName}`);
        if (document.querySelector("[data-testid='CLOSE_SPLASH']")) {
            cy.get("[data-testid='CLOSE_SPLASH']").click();
        }
    });

    afterEach(() => {
        cy.logout();
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

        cy.intercept('POST', `/api/admin/projects/${projectName}`).as(
            'createProject'
        );

        cy.get("[data-testid='PROJECT_ID_INPUT'").type(projectName);
        cy.get("[data-testid='PROJECT_NAME_INPUT'").type(projectName);
        cy.get("[data-testid='PROJECT_STICKINESS_SELECT']").select('userId');
        cy.get("[data-testid='SAVE_PROJECT_BUTTON']").click();
        cy.wait('@createProject');
    };

    it('should store default project stickiness when creating/editing a project', () => {
        createProject();

        //Should not show own notifications
        cy.get("[data-testid='NAVIGATE_TO_EDIT_PROJECT']").click();

        //then
        cy.get("[data-testid='PROJECT_STICKINESS_SELECT']").should(
            'have.value',
            'userId'
        );
    });

    it('should get the default project stickiness when creating a Gradual Rollout Strategy', () => {
        createProject();

        //Should not show own notifications
        cy.get("[data-testid='NAVIGATE_TO_EDIT_PROJECT']").click();

        //then
        cy.get("[data-testid='PROJECT_STICKINESS_SELECT']").should(
            'have.value',
            'userId'
        );
    });

    it('should get the default project stickiness when creating a variant', () => {
        createProject();
        createFeature();
        //Should not show own notifications
        cy.get("[data-testid='NAVIGATE_TO_EDIT_PROJECT']").click();

        //then
        cy.get("[data-testid='PROJECT_STICKINESS_SELECT']").should(
            'have.value',
            'userId'
        );
    });
});
