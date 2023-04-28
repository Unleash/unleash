///<reference path="../../global.d.ts" />
import { TOPICS } from '../../../src/component/demo/demo-topics';

describe(
    'demo',
    {
        env: {
            UNLEASH_DEMO: 'true',
        },
    },
    () => {
        const baseUrl = Cypress.config().baseUrl;

        before(() => {
            cy.runBefore();

            cy.createProject_API('demo-app', { failOnStatusCode: false });
            cy.createFeature_API('demoApp.step1', 'demo-app', {
                failOnStatusCode: false,
            });
            cy.createFeature_API('demoApp.step2', 'demo-app', {
                failOnStatusCode: false,
            });
            cy.createFeature_API('demoApp.step3', 'demo-app', {
                failOnStatusCode: false,
            });
            cy.createFeature_API('demoApp.step4', 'demo-app', {
                failOnStatusCode: false,
            });
        });

        beforeEach(() => {
            cy.login_UI();
            cy.visit('/projects');
            if (document.querySelector("[data-testid='CLOSE_SPLASH']")) {
                cy.get("[data-testid='CLOSE_SPLASH']").click();
            }
        });

        after(() => {
            cy.request({
                method: 'DELETE',
                url: `${baseUrl}/api/admin/features/demoApp.step1`,
                failOnStatusCode: false,
            });
            cy.request({
                method: 'DELETE',
                url: `${baseUrl}/api/admin/features/demoApp.step2`,
                failOnStatusCode: false,
            });
            cy.request({
                method: 'DELETE',
                url: `${baseUrl}/api/admin/features/demoApp.step3`,
                failOnStatusCode: false,
            });
            cy.request({
                method: 'DELETE',
                url: `${baseUrl}/api/admin/features/demoApp.step4`,
                failOnStatusCode: false,
            });
            cy.request({
                method: 'DELETE',
                url: `${baseUrl}/api/admin/archive/demoApp.step1`,
                failOnStatusCode: false,
            });
            cy.request({
                method: 'DELETE',
                url: `${baseUrl}/api/admin/archive/demoApp.step2`,
                failOnStatusCode: false,
            });
            cy.request({
                method: 'DELETE',
                url: `${baseUrl}/api/admin/archive/demoApp.step3`,
                failOnStatusCode: false,
            });
            cy.request({
                method: 'DELETE',
                url: `${baseUrl}/api/admin/archive/demoApp.step4`,
                failOnStatusCode: false,
            });
        });

        // it('loads the demo', () => {
        //     cy.get('[data-testid="DEMO_START_BUTTON"]');
        // });

        it('can complete the demo', () => {
            cy.get('[data-testid="DEMO_START_BUTTON"]').click();

            cy.wait(10000);

            for (let topic = 0; topic < TOPICS.length; topic++) {
                const currentTopic = TOPICS[topic];
                for (let step = 0; step < currentTopic.steps.length; step++) {
                    const currentStep = currentTopic.steps[step];

                    cy.wait(1000);

                    if (currentStep.nextButton) {
                        cy.get('[data-testid="DEMO_NEXT_BUTTON"]').click({
                            force: true,
                        });
                    } else {
                        cy.get(currentStep.target as string)
                            .first()
                            .click({
                                force: true,
                            });
                    }
                }
            }

            // while (
            //     !document.querySelector('[data-testid="DEMO_FINISH_BUTTON"]')
            // ) {
            //     cy.wait(1000);
            //     console.log('waited 1s');

            //     const [topic, step] = steps;
            //     const currentTopic = TOPICS[topic];
            //     console.log(TOPICS, topic, currentTopic);
            //     const { target } = currentTopic.steps[step];

            //     if (
            //         document.querySelector('[data-testid="DEMO_NEXT_BUTTON"]')
            //     ) {
            //         cy.get('[data-testid="DEMO_NEXT_BUTTON"]').click();
            //     } else if (document.querySelector(target as string)) {
            //         cy.get(target as string).click();
            //     }

            //     if (step === currentTopic.steps.length - 1) {
            //         steps = [topic + 1, 0];
            //     } else {
            //         steps = [topic, step + 1];
            //     }
            // }
        });

        // it('can select and deselect feature toggles', () => {
        //     cy.login_UI();
        //     cy.visit('/projects/default');
        //     cy.viewport(1920, 1080);
        //     cy.get("[data-testid='SEARCH_INPUT']").click().type(featureToggleName);
        //     cy.get('table tbody tr').should('have.length', 2);
        //     const counter = `[data-testid="${BATCH_SELECTED_COUNT}"]`;

        //     cy.get(counter).should('not.exist');
        //     cy.get(selectAll).click();
        //     cy.get(counter).contains('2');
        //     cy.get(selectAll).click();
        //     cy.get(counter).should('not.exist');

        //     cy.get('table td')
        //         .contains(`${featureToggleName}-A`)
        //         .closest('tr')
        //         .find(`[data-testid="${BATCH_SELECT}"] input[type="checkbox"]`)
        //         .click();
        //     cy.get(counter).contains('1');

        //     cy.get('table td')
        //         .contains(`${featureToggleName}-A`)
        //         .closest('tr')
        //         .find(`[data-testid="${BATCH_SELECT}"] input[type="checkbox"]`)
        //         .click();
        //     cy.get(counter).should('not.exist');
        //     cy.get('table td')
        //         .contains(`${featureToggleName}-B`)
        //         .closest('tr')
        //         .find(`[data-testid="${BATCH_SELECT}"] input[type="checkbox"]`)
        //         .click();
        //     cy.get(counter).contains('1');

        //     cy.get('table td')
        //         .contains(`${featureToggleName}-A`)
        //         .closest('tr')
        //         .find(`[data-testid="${BATCH_SELECT}"] input[type="checkbox"]`)
        //         .click();
        //     cy.get(counter).contains('2');
        //     cy.get('table td')
        //         .contains(`${featureToggleName}-B`)
        //         .closest('tr')
        //         .find(`[data-testid="${BATCH_SELECT}"] input[type="checkbox"]`)
        //         .click();
        //     cy.get(counter).contains('1');
        // });

        // it('can mark selected togggles as stale', () => {
        //     cy.login_UI();
        //     cy.visit('/projects/default');
        //     cy.viewport(1920, 1080);
        //     cy.get(`[data-testid='${SEARCH_INPUT}']`)
        //         .click()
        //         .type(featureToggleName);
        //     cy.get('table tbody tr').should('have.length', 2);
        //     cy.get(selectAll).click();

        //     cy.get(`[data-testid="${MORE_BATCH_ACTIONS}"]`).click();

        //     cy.get('[role="menuitem"]').contains('Mark as stale').click();

        //     cy.visit(`/projects/default/features/${featureToggleName}-A`);
        //     cy.get('[title="Feature toggle is deprecated."]').should('exist');
        // });

        // it('can archive selected togggles', () => {
        //     cy.login_UI();
        //     cy.visit('/projects/default');
        //     cy.viewport(1920, 1080);
        //     cy.get(`[data-testid='${SEARCH_INPUT}']`)
        //         .click()
        //         .type(featureToggleName);
        //     cy.get('table tbody tr').should('have.length', 2);
        //     cy.get(selectAll).click();

        //     cy.get(`[data-testid=${BATCH_ACTIONS_BAR}] button`)
        //         .contains('Archive')
        //         .click();
        //     cy.get('p')
        //         .contains('Are you sure you want to archive 2 feature toggles?')
        //         .should('exist');
        //     cy.get('button').contains('Archive toggles').click();
        //     cy.get('table tbody tr').should('have.length', 0);
        // });
    }
);
