/// <reference types="cypress" />

export {};
const randomId = String(Math.random()).split('.')[1];
const segmentName = `unleash-e2e-${randomId}`;

// Disable all active splash pages by visiting them.
const disableActiveSplashScreens = () => {
    cy.visit(`/splash/operators`);
};

describe('segments', () => {
    before(() => {
        disableActiveSplashScreens();
    });

    beforeEach(() => {
        cy.login();
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
