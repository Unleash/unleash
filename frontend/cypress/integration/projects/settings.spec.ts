///<reference path="../../global.d.ts" />

const randomId = String(Math.random()).split('.')[1];
const baseUrl = Cypress.config().baseUrl;
let strategyId = '';
const userName = `settings-user-${randomId}`;
const projectName = `stickiness-project-${randomId}`;
const TEST_STICKINESS = 'userId';

describe('project settings', () => {
    before(() => {
        cy.runBefore();
    });

    it('should store default project stickiness when creating, retrieve it when editing a project', () => {
        //prepare
        cy.login_UI();
        cy.visit(`/projects`);

        //when
        cy.createProject_UI(projectName, TEST_STICKINESS);
        cy.visit(`/projects/${projectName}`);
        cy.get("[data-testid='NAVIGATE_TO_EDIT_PROJECT']").click();

        //then
        cy.get("[id='stickiness-select']")
            .first()
            .should('have.text', 'userId');

        //clean
        cy.request('DELETE', `${baseUrl}/api/admin/projects/${projectName}`);
    });

    it('should respect the default project stickiness when creating a Gradual Rollout Strategy', () => {
        //prepare
        cy.login_UI();
        cy.visit(`/projects`);
        cy.createProject_UI(projectName, TEST_STICKINESS);
        const featureToggleName = `settings-${randomId}`;
        cy.createFeature_UI(featureToggleName, true, projectName);

        //when - then
        cy.addFlexibleRolloutStrategyToFeature_UI({
            featureToggleName,
            project: projectName,
            stickiness: TEST_STICKINESS,
        });

        //clean
        cy.deleteFeature_API(featureToggleName);
        cy.deleteProject_API(projectName);
    });

    it('should respect the default project stickiness when creating a variant', () => {
        //prepare
        cy.login_UI();
        cy.visit(`/projects`);
        cy.createProject_UI(projectName, TEST_STICKINESS);
        const featureToggleName = `settings-${randomId}-A`;
        cy.createFeature_UI(featureToggleName, true, projectName);

        //when
        cy.visit(
            `/projects/${projectName}/features/${featureToggleName}/variants`
        );

        cy.get("[data-testid='ADD_VARIANT_BUTTON']").first().click();
        //then
        cy.get("[id='stickiness-select']")
            .first()
            .should('have.text', 'userId');

        //clean
        cy.deleteFeature_API(featureToggleName);
        cy.deleteProject_API(projectName);
    });
});
