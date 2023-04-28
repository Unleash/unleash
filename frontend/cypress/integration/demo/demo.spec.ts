///<reference path="../../global.d.ts" />
import { TOPICS } from '../../../src/component/demo/demo-topics';

describe('demo', () => {
    const baseUrl = Cypress.config().baseUrl;
    const randomId = String(Math.random()).split('.')[1];

    before(() => {
        cy.runBefore();

        cy.intercept('GET', '/api/admin/ui-config', req => {
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

        cy.createEnvironment_API(
            {
                name: 'dev',
                type: 'development',
            },
            { failOnStatusCode: false }
        );
        cy.createEnvironment_API(
            {
                name: 'prod',
                type: 'production',
            },
            { failOnStatusCode: false }
        );
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

    it('loads the demo', () => {
        cy.get('[data-testid="DEMO_START_BUTTON"]');
    });

    it('can complete the demo', () => {
        cy.get('[data-testid="DEMO_START_BUTTON"]').click();

        cy.wait(10000);

        for (let topic = 0; topic < TOPICS.length; topic++) {
            const currentTopic = TOPICS[topic];
            for (let step = 0; step < currentTopic.steps.length; step++) {
                const currentStep = currentTopic.steps[step];

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
