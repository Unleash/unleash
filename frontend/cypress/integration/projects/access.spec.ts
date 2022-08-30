/// <reference types="cypress" />

import {
    PA_ASSIGN_BUTTON_ID,
    PA_ASSIGN_CREATE_ID,
    PA_EDIT_BUTTON_ID,
    PA_REMOVE_BUTTON_ID,
    PA_ROLE_ID,
    PA_USERS_GROUPS_ID,
    PA_USERS_GROUPS_TITLE_ID,
} from '../../../src/utils/testIds';

export {};
const baseUrl = Cypress.config().baseUrl;
const randomId = String(Math.random()).split('.')[1];
const groupAndProjectName = `group-e2e-${randomId}`;
const userName = `user-e2e-${randomId}`;
const groupIds: any[] = [];
const userIds: any[] = [];

// Disable all active splash pages by visiting them.
const disableActiveSplashScreens = () => {
    cy.visit(`/splash/operators`);
};

describe('project-access', () => {
    before(() => {
        disableActiveSplashScreens();
        cy.login();
        for (let i = 1; i <= 2; i++) {
            const name = `${i}-${userName}`;
            cy.request('POST', `${baseUrl}/api/admin/user-admin`, {
                name: name,
                email: `${name}@test.com`,
                sendEmail: false,
                rootRole: 3,
            })
                .as(name)
                .then(response => {
                    const id = response.body.id;
                    userIds.push(id);
                    cy.request('POST', `${baseUrl}/api/admin/groups`, {
                        name: `${i}-${groupAndProjectName}`,
                        users: [{ user: { id: id } }],
                    }).then(response => {
                        const id = response.body.id;
                        groupIds.push(id);
                    });
                });
        }
        cy.request('POST', `${baseUrl}/api/admin/projects`, {
            id: groupAndProjectName,
            name: groupAndProjectName,
        });
    });

    after(() => {
        userIds.forEach(id =>
            cy.request('DELETE', `${baseUrl}/api/admin/user-admin/${id}`)
        );
        groupIds.forEach(id =>
            cy.request('DELETE', `${baseUrl}/api/admin/groups/${id}`)
        );

        cy.request(
            'DELETE',
            `${baseUrl}/api/admin/projects/${groupAndProjectName}`
        );
    });

    beforeEach(() => {
        cy.login();
        cy.visit(`/projects/${groupAndProjectName}/access`);
        if (document.querySelector("[data-testid='CLOSE_SPLASH']")) {
            cy.get("[data-testid='CLOSE_SPLASH']").click();
        }
    });

    it('can assign permissions to user', () => {
        cy.get(`[data-testid='${PA_ASSIGN_BUTTON_ID}']`).click();

        cy.intercept(
            'POST',
            `/api/admin/projects/${groupAndProjectName}/role/4/access`
        ).as('assignAccess');

        cy.get(`[data-testid='${PA_USERS_GROUPS_ID}']`).click();
        cy.contains(`1-${userName}`).click();
        cy.get(`[data-testid='${PA_USERS_GROUPS_TITLE_ID}']`).click();
        cy.get(`[data-testid='${PA_ROLE_ID}']`).click();
        cy.contains('full control over the project').click({ force: true });

        cy.get(`[data-testid='${PA_ASSIGN_CREATE_ID}']`).click();
        cy.wait('@assignAccess');
        cy.contains(`1-${userName}`);
    });

    it('can assign permissions to group', () => {
        cy.get(`[data-testid='${PA_ASSIGN_BUTTON_ID}']`).click();

        cy.intercept(
            'POST',
            `/api/admin/projects/${groupAndProjectName}/role/4/access`
        ).as('assignAccess');

        cy.get(`[data-testid='${PA_USERS_GROUPS_ID}']`).click();
        cy.contains(`1-${groupAndProjectName}`).click({ force: true });
        cy.get(`[data-testid='${PA_USERS_GROUPS_TITLE_ID}']`).click();
        cy.get(`[data-testid='${PA_ROLE_ID}']`).click();
        cy.contains('full control over the project').click({ force: true });

        cy.get(`[data-testid='${PA_ASSIGN_CREATE_ID}']`).click();
        cy.wait('@assignAccess');
        cy.contains(`1-${groupAndProjectName}`);
    });

    it('can edit role', () => {
        cy.get(`[data-testid='${PA_EDIT_BUTTON_ID}']`).first().click();

        cy.intercept(
            'PUT',
            `/api/admin/projects/${groupAndProjectName}/groups/${groupIds[0]}/roles/5`
        ).as('editAccess');

        cy.get(`[data-testid='${PA_ROLE_ID}']`).click();
        cy.contains('within a project are allowed').click({ force: true });

        cy.get(`[data-testid='${PA_ASSIGN_CREATE_ID}']`).click();
        cy.wait('@editAccess');
        cy.get("td span:contains('Owner')").should('have.length', 2);
        cy.get("td span:contains('Member')").should('have.length', 1);
    });

    it('can remove access', () => {
        cy.get(`[data-testid='${PA_REMOVE_BUTTON_ID}']`).first().click();

        cy.intercept(
            'DELETE',
            `/api/admin/projects/${groupAndProjectName}/groups/${groupIds[0]}/roles/5`
        ).as('removeAccess');

        cy.contains("Yes, I'm sure").click();

        cy.wait('@removeAccess');
        cy.contains(`1-${groupAndProjectName} has been removed from project`);
    });
});
