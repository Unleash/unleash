///<reference path="../../global.d.ts" />

describe('login', { testIsolation: true }, () => {
    const baseUrl = Cypress.config().baseUrl;

    before(() => {
        cy.runBefore();
        Cypress.session.clearAllSavedSessions();
    });

    beforeEach(() => {
        cy.login_UI();
    });

    it('is redirecting to /personal after first login', () => {
        cy.visit('/');
        cy.url().should('eq', `${baseUrl}/personal`);
        cy.visit('/');
        // "/" should again redirect to last "home" page
        cy.url().should('eq', `${baseUrl}/personal`);
    });

    it('is redirecting to other pages', () => {
        cy.visit('/search');
        cy.visit('/playground');
        cy.visit('/');
        cy.url().should('eq', `${baseUrl}/playground`);
        cy.visit('/admin');
        cy.visit('/applications'); // not one of main pages
        cy.visit('/');
        cy.url().should('eq', `${baseUrl}/admin`);
    });

    it('clears last visited page on manual logout', () => {
        cy.visit('/search');
        cy.get('[data-testid=HEADER_USER_AVATAR]').click();
        cy.get('button').contains('Log out').click();
        cy.url().should('eq', `${baseUrl}/login`);
        cy.visit('/');
        cy.url().should('eq', `${baseUrl}/login`);
        cy.do_login();
        cy.visit('/');
        cy.url().should('eq', `${baseUrl}/personal`);
    });

    it('remembers last visited page on next login', () => {
        cy.visit('/playground');
        cy.window().then((win) => {
            win.sessionStorage.clear(); // not localStorage
            win.location.reload();
        });
        cy.visit('/');
        cy.url().should('eq', `${baseUrl}/login`);
        cy.do_login();
        cy.visit('/');
        cy.url().should('eq', `${baseUrl}/playground`);
    });

    it('error page Go home button redirects to default page', () => {
        cy.visit('/not-exists');
        cy.window().then((win) => {
            win.sessionStorage.clear(); // not localStorage
            win.location.reload();
        });
        cy.visit('/not-exists');
        cy.url().should('contain', `${baseUrl}/login`);
        cy.do_login();
        cy.contains("Ooops. That's a page we haven't toggled on yet.").should(
            'be.visible',
        );
        cy.get('button').contains('Go home').click();
        cy.url().should('not.contain', `not-exists`);
        cy.contains("Ooops. That's a page we haven't toggled on yet.").should(
            'not.be.visible',
        );
    });
});
