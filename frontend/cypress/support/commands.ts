// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const AUTH_USER = Cypress.env('AUTH_USER');
const AUTH_PASSWORD = Cypress.env('AUTH_PASSWORD');

Cypress.Commands.add('login', (user = AUTH_USER, password = AUTH_PASSWORD) =>
    cy.session(user, () => {
        cy.visit('/');
        cy.wait(1000);
        cy.get("[data-testid='LOGIN_EMAIL_ID']").type(user);

        if (AUTH_PASSWORD) {
            cy.get("[data-testid='LOGIN_PASSWORD_ID']").type(password);
        }

        cy.get("[data-testid='LOGIN_BUTTON']").click();

        // Wait for the login redirect to complete.
        cy.get("[data-testid='HEADER_USER_AVATAR']");
    })
);
