/// <reference types="cypress" />

export {};

const AUTH_USER = Cypress.env('AUTH_USER');
const AUTH_PASSWORD = Cypress.env('AUTH_PASSWORD');
const randomId = String(Math.random()).split('.')[1];
const segmentName = `unleash-e2e-${randomId}`;

Cypress.config({
    experimentalSessionSupport: true,
});

// Disable all active splash pages by visiting them.
const disableActiveSplashScreens = () => {
    cy.visit(`/splash/operators`);
};

describe('segments', () => {
    before(() => {
        disableActiveSplashScreens();
    });

    beforeEach(() => {
        cy.session(AUTH_USER, () => {
            cy.visit('/');
            cy.wait(1000);
            cy.get("[data-testid='LOGIN_EMAIL_ID']").type(AUTH_USER);

            if (AUTH_PASSWORD) {
                cy.get("[data-testid='LOGIN_PASSWORD_ID']").type(AUTH_PASSWORD);
            }

            cy.get("[data-testid='LOGIN_BUTTON']").click();
            // Wait for the login redirect to complete.
            cy.get("[data-testid='HEADER_USER_AVATAR']");
        });

        cy.visit('/segments');
    });

    it('can create a segment', () => {
        if (document.querySelector("[data-testid='CLOSE_SPLASH']")) {
            cy.get("[data-testid='CLOSE_SPLASH']").click();
        }

        cy.get("[data-testid='NAVIGATE_TO_CREATE_SEGMENT']").click();

        cy.intercept('POST', '/api/admin/segments').as('createSegment');

        cy.get("[data-testid='SEGMENT_NAME_ID']").type(segmentName);
        cy.get("[data-testid='SEGMENT_DESC_ID']").type('hello-world');
        cy.get("[data-testid='SEGMENT_NEXT_BTN_ID']").click();
        cy.get("[data-testid='SEGMENT_CREATE_BTN_ID']").click();
        cy.wait('@createSegment');
        cy.contains(segmentName);
    });

    it('gives an error if a segment exists with the same name', () => {
        cy.get("[data-testid='NAVIGATE_TO_CREATE_SEGMENT']").click();

        cy.get("[data-testid='SEGMENT_NAME_ID']").type(segmentName);
        cy.get("[data-testid='SEGMENT_NEXT_BTN_ID']").should('be.disabled');
        cy.get("[data-testid='INPUT_ERROR_TEXT']").contains(
            'Segment name already exists'
        );
    });

    it('can delete a segment', () => {
        cy.get(`[data-testid='SEGMENT_DELETE_BTN_ID_${segmentName}']`).click();

        cy.get("[data-testid='SEGMENT_DIALOG_NAME_ID']").type(segmentName);
        cy.get("[data-testid='DIALOGUE_CONFIRM_ID'").click();

        cy.contains(segmentName).should('not.exist');
    });
});
