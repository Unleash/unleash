///<reference path="../../global.d.ts" />

import {
    PA_ASSIGN_BUTTON_ID,
    PA_ASSIGN_CREATE_ID,
    PA_EDIT_BUTTON_ID,
    PA_REMOVE_BUTTON_ID,
    PA_ROLE_ID,
    PA_USERS_GROUPS_ID,
    PA_USERS_GROUPS_TITLE_ID,
    //@ts-expect-error
} from '../../../src/utils/testIds.js';

describe('project-access', () => {
    const baseUrl = Cypress.config().baseUrl;
    const randomId = String(Math.random()).split('.')[1];
    const groupAndProjectName = `group-e2e-${randomId}`;
    const userName = `user-e2e-${randomId}`;
    const groupIds: any[] = [];
    const userIds: any[] = [];

    before(() => {
        cy.runBefore();
        cy.login_UI();
        for (let i = 1; i <= 2; i++) {
            const name = `${i}-${userName}`;
            cy.request('POST', `${baseUrl}/api/admin/user-admin`, {
                name: name,
                email: `${name}@test.com`,
                sendEmail: false,
                rootRole: 3,
            })
                .as(name)
                .then((response) => {
                    const id = response.body.id;
                    userIds.push(id);
                    cy.request('POST', `${baseUrl}/api/admin/groups`, {
                        name: `${i}-${groupAndProjectName}`,
                        users: [{ user: { id: id } }],
                    }).then((response) => {
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
        userIds.forEach((id) => {
            cy.request('DELETE', `${baseUrl}/api/admin/user-admin/${id}`);
        });
        groupIds.forEach((id) => {
            cy.request('DELETE', `${baseUrl}/api/admin/groups/${id}`);
        });

        cy.request(
            'DELETE',
            `${baseUrl}/api/admin/projects/${groupAndProjectName}`,
        );
    });

    beforeEach(() => {
        cy.login_UI();

        cy.visit(`/projects/${groupAndProjectName}/settings/access`);
        if (document.querySelector("[data-testid='CLOSE_SPLASH']")) {
            cy.get("[data-testid='CLOSE_SPLASH']").click();
        }
    });

    it('can assign permissions to user', () => {
        cy.get(`[data-testid='${PA_ASSIGN_BUTTON_ID}']`).click();

        cy.intercept(
            'POST',
            `/api/admin/projects/${groupAndProjectName}/access`,
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
            `/api/admin/projects/${groupAndProjectName}/access`,
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
            `/api/admin/projects/${groupAndProjectName}/groups/${groupIds[0]}/roles`,
        ).as('editAccess');

        cy.get(`[data-testid='CancelIcon']`).last().click();
        cy.get(`[data-testid='${PA_ROLE_ID}']`).click();
        cy.contains('update feature flags within a project').click({
            force: true,
        });

        cy.get(`[data-testid='${PA_ASSIGN_CREATE_ID}']`).click();
        cy.wait('@editAccess');
        cy.get("td a span:contains('Owner')").should('have.length', 2);
        cy.get("td a span:contains('Member')").should('have.length', 1);
    });

    it('can edit role to multiple roles', () => {
        cy.get(`[data-testid='${PA_EDIT_BUTTON_ID}']`).first().click();

        cy.intercept(
            'PUT',
            `/api/admin/projects/${groupAndProjectName}/groups/${groupIds[0]}/roles`,
        ).as('editAccess');

        cy.get(`[data-testid='${PA_ROLE_ID}']`).click();
        cy.contains('full control over the project').click({
            force: true,
        });

        cy.get(`[data-testid='${PA_ASSIGN_CREATE_ID}']`).click();
        cy.wait('@editAccess');
        cy.get("td a span:contains('Owner')").should('have.length', 2);
        cy.get("td a span:contains('2 roles')").should('have.length', 1);
    });

    it('can remove access', () => {
        cy.get(`[data-testid='${PA_REMOVE_BUTTON_ID}']`)
            .filter(':not(:disabled)')
            .first()
            .click();

        cy.intercept(
            'DELETE',
            `/api/admin/projects/${groupAndProjectName}/groups/${groupIds[0]}/roles`,
        ).as('removeAccess');

        cy.contains("Yes, I'm sure").click();

        cy.wait('@removeAccess');
        cy.contains(`1-${groupAndProjectName} has been removed from project`);
    });
});
