///<reference path="../../global.d.ts" />

describe('segments', () => {
    const randomId = String(Math.random()).split('.')[1];
    const segmentName = `unleash-e2e-${randomId}`;

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
});
