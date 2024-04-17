///<reference path="../../global.d.ts" />
import { SEARCH_INPUT } from '../../../src/utils/testIds';

describe('project overview', () => {
    const randomId = String(Math.random()).split('.')[1];
    const projectName = `unleash-e2e-projects-list-${randomId}`;

    before(() => {
        cy.runBefore();
        cy.login_UI();
        cy.createProject_API(projectName);
    });

    after(() => {
        cy.deleteProject_API(projectName);
    });

    it('allows for searching and persists search query', () => {
        cy.login_UI();
        cy.visit(`/projects`);
        cy.get(`[data-testid="${SEARCH_INPUT}"]`).as('search').click();
        cy.get('@search').type(projectName);
        cy.url().should('include', `search=${projectName}`);
        cy.get('h1').contains('Projects (1 of');

        cy.get('[data-testid=PROJECT_CARD_LINK]').contains(projectName).click();
        cy.get('nav').contains('Projects').click();

        cy.url().should('include', `search=${projectName}`);
        cy.get('@search').clear();
        cy.url().should('not.include', `search=${projectName}`);
    });
});
