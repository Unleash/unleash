///<reference path="../../global.d.ts" />

describe('login', { testIsolation: true }, () => {
    const baseUrl = Cypress.config().baseUrl;
    const randomId = String(Math.random()).split('.')[1];
    const projectName = `unleash-e2e-login-project-${randomId}`;

    before(() => {
        cy.runBefore();
        Cypress.session.clearAllSavedSessions();
        cy.login_UI();
        cy.createProject_API(projectName);
        cy.logout_UI();
    });

    after(() => {
        cy.deleteProject_API(projectName);
    });

    beforeEach(() => {
        cy.login_UI();
    });

    it('is redirecting to last visited projects', () => {
        cy.visit('/projects');
        cy.visit('/');
        cy.url().should((url) => url.startsWith(`${baseUrl}/projects`));
        cy.contains('a', projectName).click();
        cy.get(`h1 span`).should('not.have.class', 'skeleton');
        cy.visit('/');
        cy.url().should((url) =>
            // last visited project
            url.startsWith(`${baseUrl}/projects/${projectName}`),
        );
    });
});
