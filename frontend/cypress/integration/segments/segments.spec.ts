///<reference path="../../global.d.ts" />

describe('segments', () => {
    const randomId = String(Math.random()).split('.')[1];
    const segmentName = `unleash-e2e-${randomId}`;
    let segmentId: string;

    before(() => {
        cy.runBefore();
    });

    beforeEach(() => {
        cy.login_UI();
        cy.visit('/segments');
        if (document.querySelector("[data-testid='CLOSE_SPLASH']")) {
            cy.get("[data-testid='CLOSE_SPLASH']").click();
        }
    });

    it('can create a segment', () => {
        cy.createSegment_UI(segmentName);
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
        cy.deleteSegment_UI(segmentName, segmentId);
        cy.contains(segmentName).should('not.exist');
    });
});
