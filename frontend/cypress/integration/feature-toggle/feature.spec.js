/* eslint-disable jest/no-conditional-expect */
/// <reference types="cypress" />
// Welcome to Cypress!
//
// This spec file contains a variety of sample tests
// for a todo list app that are designed to demonstrate
// the power of writing tests in Cypress.
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

let featureToggleName = '';
let enterprise = false;
let strategyId = '';
let defaultEnv = 'development';

describe('feature toggle', () => {
    before(() => {
        featureToggleName = `unleash-e2e-${Math.floor(Math.random() * 100)}`;
        enterprise = Boolean(Cypress.env('ENTERPRISE'));

        const env = Cypress.env('DEFAULT_ENV');
        if (env) {
            defaultEnv = env;
        }
    });

    after(() => {
        const authToken = Cypress.env('AUTH_TOKEN');

        cy.request({
            method: 'DELETE',
            url: `${
                Cypress.config().baseUrl
            }/api/admin/features/${featureToggleName}`,
            headers: {
                Authorization: authToken,
            },
        });

        cy.request({
            method: 'DELETE',
            url: `${
                Cypress.config().baseUrl
            }/api/admin/archive/${featureToggleName}`,
            headers: {
                Authorization: authToken,
            },
        });
    });

    beforeEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        const passwordAuth = Cypress.env('PASSWORD_AUTH');
        enterprise = Boolean(Cypress.env('ENTERPRISE'));

        cy.visit('/');

        if (passwordAuth) {
            cy.get('[data-test="LOGIN_EMAIL_ID"]').type('test@test.com');

            cy.get('[data-test="LOGIN_PASSWORD_ID"]').type('qY70$NDcJNXA');

            cy.get("[data-test='LOGIN_BUTTON']").click();
        } else {
            cy.get('[data-test=LOGIN_EMAIL_ID]').type('test@unleash-e2e.com');
            cy.get('[data-test=LOGIN_BUTTON]').click();
        }
    });

    it('Creates a feature toggle', () => {
        if (
            document.querySelectorAll("[data-test='CLOSE_SPLASH']").length > 0
        ) {
            cy.get("[data-test='CLOSE_SPLASH']").click();
        }

        cy.get('[data-test=NAVIGATE_TO_CREATE_FEATURE').click();

        cy.intercept('POST', '/api/admin/projects/default/features').as(
            'createFeature'
        );

        cy.get("[data-test='CF_NAME_ID'").type(featureToggleName);
        cy.get("[data-test='CF_DESC_ID'").type('hellowrdada');

        cy.get("[data-test='CF_CREATE_BTN_ID']").click();
        cy.wait('@createFeature');
        cy.url().should('include', featureToggleName);
    });

    it('Gives an error if a toggle exists with the same name', () => {
        cy.get('[data-test=NAVIGATE_TO_CREATE_FEATURE').click();

        cy.intercept('POST', '/api/admin/projects/default/features').as(
            'createFeature'
        );

        cy.get("[data-test='CF_NAME_ID'").type(featureToggleName);
        cy.get("[data-test='CF_DESC_ID'").type('hellowrdada');

        cy.get("[data-test='CF_CREATE_BTN_ID']").click();

        cy.get("[data-test='INPUT_ERROR_TEXT']").contains(
            'A feature with this name already exists'
        );
    });

    it('Gives an error if a toggle name is url unsafe', () => {
        cy.get('[data-test=NAVIGATE_TO_CREATE_FEATURE').click();

        cy.intercept('POST', '/api/admin/projects/default/features').as(
            'createFeature'
        );

        cy.get("[data-test='CF_NAME_ID'").type('featureToggleUnsafe####$#//');
        cy.get("[data-test='CF_DESC_ID'").type('hellowrdada');

        cy.get("[data-test='CF_CREATE_BTN_ID']").click();

        cy.get("[data-test='INPUT_ERROR_TEXT']").contains(
            `"name" must be URL friendly`
        );
    });

    it('Can add a gradual rollout strategy to the development environment', () => {
        cy.wait(500);
        cy.visit(`/projects/default/features/${featureToggleName}/strategies`);
        cy.get('[data-test=ADD_NEW_STRATEGY_ID]').click();
        cy.get('[data-test=ADD_NEW_STRATEGY_CARD_BUTTON_ID-2').click();
        cy.get('[data-test=ROLLOUT_SLIDER_ID')
            .click()
            .type('{leftarrow}'.repeat(20));

        if (enterprise) {
            cy.get('[data-test=ADD_CONSTRAINT_ID]').click();
            cy.get('[data-test=CONSTRAINT_AUTOCOMPLETE_ID]')
                .type('{downArrow}'.repeat(1))
                .type('{enter}');
            cy.get('[data-test=DIALOGUE_CONFIRM_ID]').click();
        }

        cy.intercept(
            'POST',
            `/api/admin/projects/default/features/${featureToggleName}/environments/${defaultEnv}/strategies`,
            req => {
                expect(req.body.name).to.equal('flexibleRollout');

                expect(req.body.parameters.groupId).to.equal(featureToggleName);
                expect(req.body.parameters.stickiness).to.equal('default');
                expect(req.body.parameters.rollout).to.equal(30);

                if (enterprise) {
                    expect(req.body.constraints.length).to.equal(1);
                } else {
                    expect(req.body.constraints.length).to.equal(0);
                }

                req.continue(res => {
                    strategyId = res.body.id;
                });
            }
        ).as('addStrategyToFeature');

        cy.get('[data-test=ADD_NEW_STRATEGY_SAVE_ID]').first().click();
        cy.wait('@addStrategyToFeature');
    });

    it('can update a strategy in the development environment', () => {
        cy.wait(500);
        cy.visit(`/projects/default/features/${featureToggleName}/strategies`);
        cy.get('[data-test=STRATEGY_ACCORDION_ID-flexibleRollout').click();

        cy.get('[data-test=ROLLOUT_SLIDER_ID')
            .first()
            .click()
            .type('{rightArrow}'.repeat(10));

        cy.get('[data-test=FLEXIBLE_STRATEGY_STICKINESS_ID]')
            .first()
            .click()
            .get('[data-test=SELECT_ITEM_ID-sessionId')
            .first()
            .click();

        let newGroupId = 'new-group-id';
        cy.get('[data-test=FLEXIBLE_STRATEGY_GROUP_ID]')
            .first()
            .clear()
            .type('new-group-id');

        cy.intercept(
            'PUT',
            `/api/admin/projects/default/features/${featureToggleName}/environments/${defaultEnv}/strategies/${strategyId}`,
            req => {
                expect(req.body.parameters.groupId).to.equal(newGroupId);
                expect(req.body.parameters.stickiness).to.equal('sessionId');
                expect(req.body.parameters.rollout).to.equal(60);

                if (enterprise) {
                    expect(req.body.constraints.length).to.equal(1);
                } else {
                    expect(req.body.constraints.length).to.equal(0);
                }

                req.continue(res => {
                    expect(res.statusCode).to.equal(200);
                });
            }
        ).as('updateStrategy');

        cy.get('[data-test=UPDATE_STRATEGY_BUTTON_ID]').first().click();
        cy.wait('@updateStrategy');
    });

    it('can delete a strategy in the development environment', () => {
        cy.wait(500);
        cy.visit(`/projects/default/features/${featureToggleName}/strategies`);

        cy.intercept(
            'DELETE',
            `/api/admin/projects/default/features/${featureToggleName}/environments/${defaultEnv}/strategies/${strategyId}`,
            req => {
                req.continue(res => {
                    expect(res.statusCode).to.equal(200);
                });
            }
        ).as('deleteStrategy');

        cy.get('[data-test=DELETE_STRATEGY_ID-flexibleRollout]').click();
        cy.get('[data-test=DIALOGUE_CONFIRM_ID]').click();
        cy.wait('@deleteStrategy');
    });

    it('Can add a userid  strategy to the development environment', () => {
        cy.wait(500);
        cy.visit(`/projects/default/features/${featureToggleName}/strategies`);
        cy.get('[data-test=ADD_NEW_STRATEGY_ID]').click();
        cy.get('[data-test=ADD_NEW_STRATEGY_CARD_BUTTON_ID-3').click();

        if (enterprise) {
            cy.get('[data-test=ADD_CONSTRAINT_ID]').click();
            cy.get('[data-test=CONSTRAINT_AUTOCOMPLETE_ID]')
                .type('{downArrow}'.repeat(1))
                .type('{enter}');
            cy.get('[data-test=DIALOGUE_CONFIRM_ID]').click();
        }

        cy.get('[data-test=STRATEGY_INPUT_LIST]')
            .type('user1')
            .type('{enter}')
            .type('user2')
            .type('{enter}');
        cy.get('[data-test=ADD_TO_STRATEGY_INPUT_LIST]').click();

        cy.intercept(
            'POST',
            `/api/admin/projects/default/features/${featureToggleName}/environments/${defaultEnv}/strategies`,
            req => {
                expect(req.body.name).to.equal('userWithId');

                expect(req.body.parameters.userIds.length).to.equal(11);

                if (enterprise) {
                    expect(req.body.constraints.length).to.equal(1);
                } else {
                    expect(req.body.constraints.length).to.equal(0);
                }

                req.continue(res => {
                    strategyId = res.body.id;
                });
            }
        ).as('addStrategyToFeature');

        cy.get('[data-test=ADD_NEW_STRATEGY_SAVE_ID]').first().click();
        cy.wait('@addStrategyToFeature');
    });

    it('Can add two variant to the feature', () => {
        const variantName = 'my-new-variant';
        const secondVariantName = 'my-second-variant';
        cy.wait(500);
        cy.visit(`/projects/default/features/${featureToggleName}/variants`);
        cy.intercept(
            'PATCH',
            `/api/admin/projects/default/features/${featureToggleName}/variants`,
            req => {
                if (req.body.length === 1) {
                    expect(req.body[0].op).to.equal('add');
                    expect(req.body[0].path).to.match(/\//);
                    expect(req.body[0].value.name).to.equal(variantName);
                } else if (req.body.length === 2) {
                    expect(req.body[0].op).to.equal('replace');
                    expect(req.body[0].path).to.match(/weight/);
                    expect(req.body[0].value).to.equal(500);
                    expect(req.body[1].op).to.equal('add');
                    expect(req.body[1].path).to.match(/\//);
                    expect(req.body[1].value.name).to.equal(secondVariantName);
                }
            }
        ).as('variantcreation');
        cy.get('[data-test=ADD_VARIANT_BUTTON]').click();
        cy.get('[data-test=VARIANT_NAME_INPUT]').type(variantName);
        cy.get('[data-test=DIALOGUE_CONFIRM_ID]').click();
        cy.wait('@variantcreation');
        cy.get('[data-test=ADD_VARIANT_BUTTON]').click();
        cy.get('[data-test=VARIANT_NAME_INPUT]').type(secondVariantName);
        cy.get('[data-test=DIALOGUE_CONFIRM_ID]').click();
        cy.wait('@variantcreation');
    });
    it('Can set weight to fixed value for one of the variants', () => {
        cy.wait(500);

        cy.visit(`/projects/default/features/${featureToggleName}/variants`);
        cy.get('[data-test=VARIANT_EDIT_BUTTON]').first().click();
        cy.get('[data-test=VARIANT_NAME_INPUT]')
            .children()
            .find('input')
            .should('have.attr', 'disabled');
        cy.get('[data-test=VARIANT_WEIGHT_TYPE]')
            .children()
            .find('input')
            .check();
        cy.get('[data-test=VARIANT_WEIGHT_INPUT]').clear().type('15');
        cy.intercept(
            'PATCH',
            `/api/admin/projects/default/features/${featureToggleName}/variants`,
            req => {
                expect(req.body[0].op).to.equal('replace');
                expect(req.body[0].path).to.match(/weight/);
                expect(req.body[0].value).to.equal(850);
                expect(req.body[1].op).to.equal('replace');
                expect(req.body[1].path).to.match(/weightType/);
                expect(req.body[1].value).to.equal('fix');
                expect(req.body[2].op).to.equal('replace');
                expect(req.body[2].path).to.match(/weight/);
                expect(req.body[2].value).to.equal(150);
            }
        ).as('variantupdate');
        cy.get('[data-test=DIALOGUE_CONFIRM_ID]').click();
        cy.wait('@variantupdate');
        cy.get('[data-test=VARIANT_WEIGHT]')
            .first()
            .should('have.text', '15 %');
    });

    it(`can delete variant`, () => {
        const variantName = 'to-be-deleted';
        cy.wait(500);
        cy.visit(`/projects/default/features/${featureToggleName}/variants`);
        cy.get('[data-test=ADD_VARIANT_BUTTON]').click();
        cy.get('[data-test=VARIANT_NAME_INPUT]').type(variantName);
        cy.get('[data-test=DIALOGUE_CONFIRM_ID]').click();
        cy.intercept(
            'PATCH',
            `/api/admin/projects/default/features/${featureToggleName}/variants`,
            req => {
                const e = req.body.find(e => e.op === 'remove');
                expect(e.path).to.match(/\//);
            }
        ).as('delete');
        cy.get(`[data-test=VARIANT_DELETE_BUTTON_${variantName}]`).click();
        cy.get('[data-test=DIALOGUE_CONFIRM_ID]').click();
        cy.wait('@delete');
    });
});
