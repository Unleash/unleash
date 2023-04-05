///<reference path="../../global.d.ts" />

const randomId = String(Math.random()).split('.')[1];
const baseUrl = Cypress.config().baseUrl;
let strategyId = '';
const userName = `settings-user-${randomId}`;
const projectName = `stickiness-project-${randomId}`;
const TEST_STICKINESS = 'userId';
const featureToggleName = `settings-${randomId}`;
let cleanFeature = false;
let cleanProject = false;

describe('project settings', () => {
    before(() => {
        cy.runBefore();
    });

    beforeEach(() => {
        cy.login_UI();
        if (cleanFeature) {
            cy.deleteFeature_API(featureToggleName);
        }
        if (cleanProject) {
            cy.deleteProject_API(projectName);
        }
        cy.visit(`/projects`);
        cy.wait(300);
    });

    it('should store default project stickiness when creating, retrieve it when editing a project', () => {
        //when
        cleanProject = true;
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
        cy.createProject_UI(projectName, TEST_STICKINESS);
        cy.createFeature_UI(featureToggleName, true, projectName);
        cleanFeature = true;

        //when - then
        cy.addFlexibleRolloutStrategyToFeature_UI({
            featureToggleName,
            project: projectName,
            stickiness: TEST_STICKINESS,
        });

        //clean
    });

    it.skip('should respect the default project stickiness when creating a variant', () => {
        cy.createProject_UI(projectName, TEST_STICKINESS);
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
