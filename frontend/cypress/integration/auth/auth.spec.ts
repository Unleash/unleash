/// <reference types="cypress" />

const username = 'test@test.com';
const password = 'qY70$NDcJNXA';

describe('auth', () => {
    it('renders the password login', () => {
        cy.intercept('GET', '/api/admin/user', {
            statusCode: 401,
            body: {
                defaultHidden: false,
                message: 'You must sign in in order to use Unleash',
                options: [],
                path: '/auth/simple/login',
                type: 'password',
            },
        });
        cy.visit('/');

        cy.intercept('POST', '/auth/simple/login', req => {
            expect(req.body.username).to.equal(username);
            expect(req.body.password).to.equal(password);
        }).as('passwordLogin');

        cy.get('[data-test="LOGIN_EMAIL_ID"]').type(username);

        cy.get('[data-test="LOGIN_PASSWORD_ID"]').type(password);

        cy.get("[data-test='LOGIN_BUTTON']").click();
    });

    it('renders does not render password login if defaultHidden is true', () => {
        cy.intercept('GET', '/api/admin/user', {
            statusCode: 401,
            body: {
                defaultHidden: true,
                message: 'You must sign in in order to use Unleash',
                options: [],
                path: '/auth/simple/login',
                type: 'password',
            },
        });
        cy.visit('/');

        cy.get('[data-test="LOGIN_EMAIL_ID"]').should('not.exist');

        cy.get('[data-test="LOGIN_PASSWORD_ID"]').should('not.exist');
    });

    it('renders google auth when options are specified', () => {
        const ssoPath = '/auth/google/login';
        cy.intercept('GET', '/api/admin/user', {
            statusCode: 401,
            body: {
                defaultHidden: true,
                message: 'You must sign in in order to use Unleash',
                options: [
                    {
                        type: 'google',
                        message: 'Sign in with Google',
                        path: ssoPath,
                    },
                ],
                path: '/auth/simple/login',
                type: 'password',
            },
        });

        cy.visit('/');
        cy.get('[data-test="LOGIN_EMAIL_ID"]').should('not.exist');
        cy.get('[data-test="LOGIN_PASSWORD_ID"]').should('not.exist');

        cy.get('[data-test="SSO_LOGIN_BUTTON-google"]')
            .should('exist')
            .should('have.attr', 'href', ssoPath);
    });

    it('renders oidc auth when options are specified', () => {
        const ssoPath = '/auth/oidc/login';
        cy.intercept('GET', '/api/admin/user', {
            statusCode: 401,
            body: {
                defaultHidden: true,
                message: 'You must sign in in order to use Unleash',
                options: [
                    {
                        type: 'oidc',
                        message: 'Sign in with OpenId Connect',
                        path: ssoPath,
                    },
                ],
                path: '/auth/simple/login',
                type: 'password',
            },
        });

        cy.visit('/');
        cy.get('[data-test="LOGIN_EMAIL_ID"]').should('not.exist');
        cy.get('[data-test="LOGIN_PASSWORD_ID"]').should('not.exist');

        cy.get('[data-test="SSO_LOGIN_BUTTON-oidc"]')
            .should('exist')
            .should('have.attr', 'href', ssoPath);
    });

    it('renders saml auth when options are specified', () => {
        const ssoPath = '/auth/saml/login';
        cy.intercept('GET', '/api/admin/user', {
            statusCode: 401,
            body: {
                defaultHidden: true,
                message: 'You must sign in in order to use Unleash',
                options: [
                    {
                        type: 'saml',
                        message: 'Sign in with SAML 2.0',
                        path: ssoPath,
                    },
                ],
                path: '/auth/simple/login',
                type: 'password',
            },
        });

        cy.visit('/');
        cy.get('[data-test="LOGIN_EMAIL_ID"]').should('not.exist');
        cy.get('[data-test="LOGIN_PASSWORD_ID"]').should('not.exist');

        cy.get('[data-test="SSO_LOGIN_BUTTON-saml"]')
            .should('exist')
            .should('have.attr', 'href', ssoPath);
    });

    it('can visit forgot password when password auth is enabled', () => {
        cy.intercept('GET', '/api/admin/user', {
            statusCode: 401,
            body: {
                defaultHidden: false,
                message: 'You must sign in in order to use Unleash',
                options: [],
                path: '/auth/simple/login',
                type: 'password',
            },
        });

        cy.visit('/forgotten-password');
        cy.get('[data-test="FORGOTTEN_PASSWORD_FIELD"').type('me@myemail.com');
    });

    it('renders demo auth correctly', () => {
        const email = 'hello@hello.com';
        cy.intercept('GET', '/api/admin/user', {
            statusCode: 401,
            body: {
                defaultHidden: false,
                message: 'You must sign in in order to use Unleash',
                options: [],
                path: '/auth/demo/login',
                type: 'demo',
            },
        });

        cy.intercept('POST', '/auth/demo/login', req => {
            expect(req.body.email).to.equal(email);
        }).as('passwordLogin');

        cy.visit('/');
        cy.get('[data-test="LOGIN_EMAIL_ID"]').type(email);
        cy.get("[data-test='LOGIN_BUTTON']").click();
    });

    it('renders email auth correctly', () => {
        const email = 'hello@hello.com';
        cy.intercept('GET', '/api/admin/user', {
            statusCode: 401,
            body: {
                defaultHidden: false,
                message: 'You must sign in in order to use Unleash',
                options: [],
                path: '/auth/unsecure/login',
                type: 'unsecure',
            },
        });

        cy.intercept('POST', '/auth/unsecure/login', req => {
            expect(req.body.email).to.equal(email);
        }).as('passwordLogin');

        cy.visit('/');
        cy.get('[data-test="LOGIN_EMAIL_ID"]').type(email);
        cy.get("[data-test='LOGIN_BUTTON']").click();
    });
});
