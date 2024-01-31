///<reference path="../../global.d.ts" />
import {
    BATCH_ACTIONS_BAR,
    BATCH_SELECT,
    BATCH_SELECTED_COUNT,
    MORE_BATCH_ACTIONS,
    SEARCH_INPUT,
    //@ts-ignore
} from '../../../src/utils/testIds';

describe('project overview', () => {
    const randomId = String(Math.random()).split('.')[1];
    const featureTogglePrefix = 'unleash-e2e-project-overview';
    const featureToggleName = `${featureTogglePrefix}-${randomId}`;
    const projectName = `unleash-e2e-project-overview-${randomId}`;
    const baseUrl = Cypress.config().baseUrl;
    const selectAll = '[title="Select all rows"] input[type="checkbox"]';

    before(() => {
        cy.runBefore();
        cy.login_UI();
        cy.createProject_API(projectName);
    });

    after(() => {
        cy.request({
            method: 'DELETE',
            url: `${baseUrl}/api/admin/projects/${projectName}/features/${featureToggleName}-A`,
            failOnStatusCode: false,
        });
        cy.request({
            method: 'DELETE',
            url: `${baseUrl}/api/admin/projects/${projectName}/features/${featureToggleName}-B`,
            failOnStatusCode: false,
        });
        cy.request({
            method: 'DELETE',
            url: `${baseUrl}/api/admin/archive/${featureToggleName}-A`,
        });
        cy.request({
            method: 'DELETE',
            url: `${baseUrl}/api/admin/archive/${featureToggleName}-B`,
        });
        cy.deleteProject_API(projectName);
    });

    it('loads the table', () => {
        cy.login_UI();
        cy.createFeature_API(`${featureToggleName}-A`, projectName);
        cy.createFeature_API(`${featureToggleName}-B`, projectName);
        cy.visit(`/projects/${projectName}`);

        // Use search to filter feature toggles and check that the feature toggle is listed in the table.
        cy.get(`[data-testid="${SEARCH_INPUT}"]`).as('search').click();
        cy.get('@search').type(featureToggleName);
        cy.get('table').contains('td', `${featureToggleName}-A`);
        cy.get('table tbody tr').should((elements) => {
            expect(elements).to.have.length.at.least(2);
        });
    });

    it('can select and deselect feature toggles', () => {
        cy.login_UI();
        cy.visit(`/projects/${projectName}`);
        cy.viewport(1920, 1080);
        cy.get(`[data-testid="${SEARCH_INPUT}"]`).as('search').click();
        cy.get('@search').type(featureToggleName);
        cy.get('body').type('{esc}');
        cy.get('table tbody tr').should((elements) => {
            expect(elements).to.have.length.at.least(2);
        });
        const counter = `[data-testid="${BATCH_SELECTED_COUNT}"]`;

        cy.get(counter).should('not.exist');
        cy.get(selectAll).click();
        cy.get(counter)
            .invoke('text')
            .then((text) => {
                const number = parseFloat(text);
                expect(number).to.be.at.least(2);
            });
        cy.get(selectAll).click();
        cy.get(counter).should('not.exist');

        cy.get('table td')
            .contains(`${featureToggleName}-A`)
            .closest('tr')
            .find(`[data-testid="${BATCH_SELECT}"] input[type="checkbox"]`)
            .click();
        cy.get(counter).contains('1');

        cy.get('table td')
            .contains(`${featureToggleName}-A`)
            .closest('tr')
            .find(`[data-testid="${BATCH_SELECT}"] input[type="checkbox"]`)
            .click();
        cy.get(counter).should('not.exist');
        cy.get('table td')
            .contains(`${featureToggleName}-B`)
            .closest('tr')
            .find(`[data-testid="${BATCH_SELECT}"] input[type="checkbox"]`)
            .click();
        cy.get(counter).contains('1');

        cy.get('table td')
            .contains(`${featureToggleName}-A`)
            .closest('tr')
            .find(`[data-testid="${BATCH_SELECT}"] input[type="checkbox"]`)
            .click();
        cy.get(counter)
            .invoke('text')
            .then((text) => {
                const number = parseFloat(text);
                expect(number).to.be.at.least(2);
            });
        cy.get('table td')
            .contains(`${featureToggleName}-B`)
            .closest('tr')
            .find(`[data-testid="${BATCH_SELECT}"] input[type="checkbox"]`)
            .click();
        cy.get(counter).contains('1');
    });

    it('can mark selected togggles as stale', () => {
        cy.login_UI();
        cy.visit(`/projects/${projectName}`);
        cy.viewport(1920, 1080);
        cy.get(`[data-testid="${SEARCH_INPUT}"]`).as('search').click();
        cy.get('@search').type(featureToggleName);
        cy.get('body').type('{esc}');
        cy.get('table tbody tr').should((elements) => {
            expect(elements).to.have.length.at.least(2);
        });
        cy.get(selectAll).click();

        cy.get(`[data-testid="${MORE_BATCH_ACTIONS}"]`).click();

        cy.get('[role="menuitem"]').contains('Mark as stale').click();

        cy.visit(`/projects/${projectName}/features/${featureToggleName}-A`);
        cy.get('[title="Feature toggle is deprecated."]').should('exist');
    });

    it('can archive selected togggles', () => {
        cy.login_UI();
        cy.visit(`/projects/${projectName}`);
        cy.viewport(1920, 1080);
        cy.get(`[data-testid="${SEARCH_INPUT}"]`).as('search').click();
        cy.get('@search').type(featureToggleName);
        cy.get('body').type('{esc}');

        cy.get('table tbody tr').should((elements) => {
            expect(elements).to.have.length.at.least(2);
        });
        cy.get(selectAll).click();

        // Ensure button is enabled
        cy.get(`[data-testid=${BATCH_ACTIONS_BAR}] button`)
            .contains('Archive')
            .should('not.have.attr', 'disabled');

        // Separate click action
        cy.get(`[data-testid=${BATCH_ACTIONS_BAR}] button`)
            .contains('Archive')
            .click();

        cy.get('p')
            .contains('Are you sure you want to archive ')
            .should('exist');
        cy.get('button').contains('Archive toggles').click();
        cy.get('table tbody tr').should('have.length', 0);
    });
});
