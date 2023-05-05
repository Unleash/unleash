///<reference path="../../global.d.ts" />
import { TOPICS } from '../../../src/component/demo/demo-topics';

describe('demo', () => {
    const baseUrl = Cypress.config().baseUrl;
    const randomId = String(Math.random()).split('.')[1];

    before(() => {
        cy.runBefore();
        cy.login_UI();

        const optionsIgnore409 = { failOnStatusCode: false };

        cy.createEnvironment_API(
            {
                name: 'dev',
                type: 'development',
            },
            optionsIgnore409
        );
        cy.createProject_API('demo-app', optionsIgnore409);
        cy.createFeature_API('demoApp.step1', 'demo-app', optionsIgnore409);
        cy.createFeature_API('demoApp.step2', 'demo-app', optionsIgnore409);
        cy.createFeature_API('demoApp.step3', 'demo-app', optionsIgnore409);
        cy.createFeature_API('demoApp.step4', 'demo-app', optionsIgnore409);
    });

    beforeEach(() => {
        cy.login_UI();
        cy.visit('/projects');
        if (document.querySelector("[data-testid='CLOSE_SPLASH']")) {
            cy.get("[data-testid='CLOSE_SPLASH']").click();
        }

        cy.intercept('GET', `${baseUrl}/api/admin/ui-config`, req => {
            req.headers['cache-control'] =
                'no-cache, no-store, must-revalidate';
            req.on('response', res => {
                if (res.body) {
                    res.body.flags = {
                        ...res.body.flags,
                        demo: true,
                    };
                }
            });
        });
    });

    afterEach(() => {
        cy.intercept('GET', `${baseUrl}/api/admin/ui-config`).as('uiConfig');
    });

    after(() => {
        cy.request({
            method: 'DELETE',
            url: `${baseUrl}/api/admin/projects/demo-app/features/demoApp.step1`,
        });
        cy.request({
            method: 'DELETE',
            url: `${baseUrl}/api/admin/projects/demo-app/features/demoApp.step2`,
        });
        cy.request({
            method: 'DELETE',
            url: `${baseUrl}/api/admin/projects/demo-app/features/demoApp.step3`,
        });
        cy.request({
            method: 'DELETE',
            url: `${baseUrl}/api/admin/projects/demo-app/features/demoApp.step4`,
        });
        cy.request({
            method: 'POST',
            url: `${baseUrl}/api/admin/projects/demo-app/delete`,
            body: {
                features: [
                    'demoApp.step1',
                    'demoApp.step2',
                    'demoApp.step3',
                    'demoApp.step4',
                ],
            },
        });
    });

    it('can complete the demo', () => {
        cy.get('[data-testid="DEMO_START_BUTTON"]').click();

        for (let topic = 0; topic < TOPICS.length; topic++) {
            const currentTopic = TOPICS[topic];
            for (let step = 0; step < currentTopic.steps.length; step++) {
                const currentStep = currentTopic.steps[step];

                cy.task(
                    'log',
                    `Testing topic #${topic + 1} "${
                        currentTopic.title
                    }", step #${step + 1}...`
                );

                if (!currentStep.optional) {
                    cy.wait(2000);

                    if (currentStep.nextButton) {
                        if (currentStep.focus) {
                            if (currentStep.focus === true) {
                                cy.get(currentStep.target as string)
                                    .first()
                                    .type(randomId, { force: true });
                            } else {
                                cy.get(currentStep.target as string)
                                    .first()
                                    .find(currentStep.focus)
                                    .first()
                                    .type(randomId, { force: true });
                            }
                        }
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
        }
    });
});
