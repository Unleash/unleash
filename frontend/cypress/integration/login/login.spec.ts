///<reference path="../../global.d.ts" />

describe('login', () => {
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
        // clear last visited pages before each test
        cy.window().then((win) => {
            win.localStorage.clear();
            win.location.reload();
        });
        cy.login_UI();
    });

    it('is redirecting to /personal after first login', () => {
        cy.visit('/');
        cy.location().should((location) => {
            expect(location.pathname).to.eq('/personal');
        });
        cy.visit('/');
        // Twice, because "/" it should always return to last "home" page
        cy.location().should((location) => {
            expect(location.pathname).to.eq('/personal');
        });
    });

    it('is redirecting to last visited projects', () => {
        cy.visit('/projects');
        cy.visit('/');
        cy.location().should((location) => {
            expect(location.pathname).to.eq('/projects');
        });
        cy.contains('a', projectName).click();
        cy.get(`h1 span`).should('not.have.class', 'skeleton');
        cy.visit('/');
        cy.location().should((location) => {
            expect(location.pathname).to.eq(`/projects/${projectName}`);
        });
    });

    it('is redirecting to other pages', () => {
        cy.visit('/search');
        cy.visit('/');
        cy.location().should((location) => {
            expect(location.pathname).to.eq('/search');
        });
        cy.visit('/search');
        cy.visit('/admin');
        cy.visit('/applications');
        cy.visit('/');
        cy.location().should((location) => {
            expect(location.pathname).to.eq('/admin');
        });
    });

    it('is redirecting to other pages', () => {
        cy.visit('/search');
        cy.visit('/');
        cy.location().should((location) => {
            expect(location.pathname).to.eq('/search');
        });
        cy.visit('/search');
        cy.visit('/admin');
        cy.visit('/applications');
        cy.visit('/');
        cy.location().should((location) => {
            expect(location.pathname).to.eq('/admin');
        });
    });

    it('clears last visited page on manual logout', () => {
        cy.visit('/search');
        cy.get('[data-testid=HEADER_USER_AVATAR]').click();
        cy.get('button').contains('Log out').click();
        cy.location().should((location) => {
            expect(location.pathname).to.eq('/login');
        });
        cy.visit('/');
        cy.location().should((location) => {
            expect(location.pathname).to.eq('/login');
        });
        cy.do_login();
        cy.visit('/');
        cy.location().should((location) => {
            expect(location.pathname).to.eq('/personal');
        });
    });

    it('remembers last visited page on next login', () => {
        cy.visit('/insights');
        cy.window().then((win) => {
            win.sessionStorage.clear(); // not localStorage
            win.location.reload();
        });
        cy.location().should((location) => {
            expect(location.pathname).to.eq('/login');
        });
        cy.do_login();
        cy.visit('/');
        cy.location().should((location) => {
            expect(location.pathname).to.eq('/insights');
        });
    });
});
