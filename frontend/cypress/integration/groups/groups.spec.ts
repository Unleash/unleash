/// <reference types="cypress" />

export {};
const baseUrl = Cypress.config().baseUrl;
const randomId = String(Math.random()).split('.')[1];
const groupName = `unleash-e2e-${randomId}`;
const userIds: any[] = [];

// Disable all active splash pages by visiting them.
const disableActiveSplashScreens = () => {
    cy.visit(`/splash/operators`);
};

describe('groups', () => {
    before(() => {
        disableActiveSplashScreens();
        cy.login();
        for (let i = 1; i <= 2; i++) {
            cy.request('POST', `${baseUrl}/api/admin/user-admin`, {
                name: `unleash-e2e-user${i}-${randomId}`,
                email: `unleash-e2e-user${i}-${randomId}@test.com`,
                sendEmail: false,
                rootRole: 3,
            }).then(response => userIds.push(response.body.id));
        }
    });

    after(() => {
        userIds.forEach(id =>
            cy.request('DELETE', `${baseUrl}/api/admin/user-admin/${id}`)
        );
    });

    beforeEach(() => {
        cy.login();
        cy.visit('/admin/groups');
        if (document.querySelector("[data-testid='CLOSE_SPLASH']")) {
            cy.get("[data-testid='CLOSE_SPLASH']").click();
        }
    });

    it('can create a group', () => {
        cy.get("[data-testid='NAVIGATE_TO_CREATE_GROUP']").click();

        cy.intercept('POST', '/api/admin/groups').as('createGroup');

        cy.get("[data-testid='UG_NAME_ID']").type(groupName);
        cy.get("[data-testid='UG_DESC_ID']").type('hello-world');
        cy.get("[data-testid='UG_USERS_ID']").click();
        cy.contains(`unleash-e2e-user1-${randomId}`).click();

        cy.get("[data-testid='UG_CREATE_BTN_ID']").click();
        cy.wait('@createGroup');
        cy.contains(groupName);
    });

    it('gives an error if a group exists with the same name', () => {
        cy.get("[data-testid='NAVIGATE_TO_CREATE_GROUP']").click();

        cy.intercept('POST', '/api/admin/groups').as('createGroup');

        cy.get("[data-testid='UG_NAME_ID']").type(groupName);
        cy.get("[data-testid='INPUT_ERROR_TEXT'").contains(
            'A group with that name already exists.'
        );
    });

    it('can edit a group', () => {
        cy.contains(groupName).click();

        cy.get("[data-testid='UG_EDIT_BTN_ID']").click();

        cy.get("[data-testid='UG_DESC_ID']").type('-my edited description');

        cy.get("[data-testid='UG_SAVE_BTN_ID']").click();

        cy.contains('hello-world-my edited description');
    });

    it('can add user to a group', () => {
        cy.contains(groupName).click();

        cy.get("[data-testid='UG_EDIT_USERS_BTN_ID']").click();

        cy.get("[data-testid='UG_USERS_ID']").click();
        cy.contains(`unleash-e2e-user2-${randomId}`).click();

        cy.get("[data-testid='UG_SAVE_BTN_ID']").click();

        cy.contains(`unleash-e2e-user1-${randomId}`);
        cy.contains(`unleash-e2e-user2-${randomId}`);
    });

    it('can remove user from a group', () => {
        cy.contains(groupName).click();

        cy.get(`[data-testid='UG_REMOVE_USER_BTN_ID-${userIds[1]}']`).click();

        cy.get("[data-testid='DIALOGUE_CONFIRM_ID'").click();

        cy.contains(`unleash-e2e-user1-${randomId}`);
        cy.contains(`unleash-e2e-user2-${randomId}`).should('not.exist');
    });

    it('can delete a group', () => {
        cy.contains(groupName).click();

        cy.get("[data-testid='UG_DELETE_BTN_ID']").click();
        cy.get("[data-testid='DIALOGUE_CONFIRM_ID'").click();

        cy.contains(groupName).should('not.exist');
    });
});
