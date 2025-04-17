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

    it('is redirecting to /personal after first login', () => {
        cy.visit('/');
        cy.wait(1_000);
        cy.url().should('eq', `${baseUrl}/personal`);
        cy.visit('/');
        cy.wait(1_000);
        // "/" should again redirect to last "home" page
        cy.url().should('eq', `${baseUrl}/personal`);
    });

    it('is redirecting to last visited projects', () => {
        cy.visit('/projects');
        cy.wait(1_000);
        cy.visit('/');
        cy.wait(1_000);
        cy.url().should((url) => url.startsWith(`${baseUrl}/projects`));
        cy.contains('a', projectName).click();
        cy.wait(1_000);
        cy.get(`h1 span`).should('not.have.class', 'skeleton');
        cy.visit('/');
        cy.wait(1_000);
        cy.url().should((url) =>
            // last visited project
            url.startsWith(`${baseUrl}/projects/${projectName}`),
        );
    });

    it('is redirecting to other pages', () => {
        cy.visit('/search');
        cy.wait(1_000);
        cy.visit('/playground');
        cy.wait(1_000);
        cy.visit('/');
        cy.wait(1_000);
        cy.url().should('eq', `${baseUrl}/playground`);
        cy.visit('/admin');
        cy.wait(1_000);
        cy.visit('/applications'); // not one of main pages
        cy.wait(1_000);
        cy.visit('/');
        cy.wait(1_000);
        cy.url().should('eq', `${baseUrl}/admin`);
    });

    it('clears last visited page on manual logout', () => {
        cy.visit('/search');
        cy.wait(1_000);
        cy.get('[data-testid=HEADER_USER_AVATAR]').click();
        cy.get('button').contains('Log out').click();
        cy.wait(1_000);
        cy.url().should('eq', `${baseUrl}/login`);
        cy.visit('/');
        cy.wait(1_000);
        cy.url().should('eq', `${baseUrl}/login`);
        cy.do_login();
        cy.wait(1_000);
        cy.visit('/');
        cy.wait(1_000);
        cy.url().should('eq', `${baseUrl}/personal`);
    });

    it('remembers last visited page on next login', () => {
        cy.visit('/insights');
        cy.wait(1_000);
        cy.window().then((win) => {
            win.sessionStorage.clear(); // not localStorage
            win.location.reload();
        });
        cy.visit('/');
        cy.url().should('eq', `${baseUrl}/login`);
        cy.do_login();
        cy.visit('/');
        cy.wait(1_000);
        cy.url().should('eq', `${baseUrl}/insights`);
    });
});
