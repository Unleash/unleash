///<reference path="../global.d.ts" />

import Chainable = Cypress.Chainable;
import AddStrategyOptions = Cypress.AddFlexibleRolloutStrategyOptions;
const AUTH_USER = Cypress.env('AUTH_USER');
const AUTH_PASSWORD = Cypress.env('AUTH_PASSWORD');
const ENTERPRISE = Boolean(Cypress.env('ENTERPRISE'));

let strategyId: string | undefined;

const disableActiveSplashScreens = () => {
    cy.intercept('GET', '/api/admin/user', (req) => {
        req.headers['cache-control'] = 'no-cache, no-store, must-revalidate';
        req.on('response', (res) => {
            if (res.body) {
                res.body.splash = {
                    ...res.body.splash,
                    personalDashboardKeyConcepts: true,
                };
            }
        });
    });
};

const disableFeatureStrategiesProdGuard = () => {
    localStorage.setItem(
        'useFeatureStrategyProdGuardSettings:v2',
        JSON.stringify({ hide: true }),
    );
};

export const runBefore = () => {
    disableFeatureStrategiesProdGuard();
    disableActiveSplashScreens();
};

export const do_login = (
    user = AUTH_USER,
    password = AUTH_PASSWORD,
): Chainable<any> => {
    cy.visit('/');
    cy.get("[data-testid='LOGIN_EMAIL_ID']").should('be.visible').type(user);

    if (AUTH_PASSWORD) {
        cy.get("[data-testid='LOGIN_PASSWORD_ID']")
            .should('be.visible')
            .type(password);
    }

    cy.get("[data-testid='LOGIN_BUTTON']").should('be.visible').click();

    // Wait for the login redirect to complete.
    cy.get("[data-testid='HEADER_USER_AVATAR']");

    cy.get("[data-testid='CLOSE_SPLASH']").should('be.visible').click();

    return cy;
};

export const login_UI = (
    user = AUTH_USER,
    password = AUTH_PASSWORD,
): Chainable<any> => {
    return cy.session(user, () => do_login(user, password));
};

export const createFeature_UI = (
    name: string,
    shouldWait?: boolean,
    project?: string,
    forceInteractions?: boolean,
): Chainable<any> => {
    const projectName = project || 'default';
    const uiOpts = forceInteractions ? { force: true } : undefined;
    cy.visit(`/projects/${projectName}`);

    cy.get('[data-testid=NAVIGATE_TO_CREATE_FEATURE')
        .should('be.visible')
        .first()
        .click(uiOpts);

    cy.intercept('POST', `/api/admin/projects/${projectName}/features`).as(
        'createFeature',
    );

    cy.get("[data-testid='FORM_NAME_INPUT'] input")
        .should('be.visible')
        .type(name, uiOpts);
    cy.get("[data-testid='FORM_DESCRIPTION_INPUT'] textarea")
        .first()
        .type('hello-world', uiOpts);
    const clicked = cy
        .get("[data-testid='FORM_CREATE_BUTTON']")
        .first()
        .click(uiOpts);
    if (shouldWait) {
        return cy.wait('@createFeature');
    }
    return clicked;
};

export const createProject_UI = (
    projectName: string,
    defaultStickiness: string,
): Chainable<any> => {
    cy.get('[data-testid=NAVIGATE_TO_CREATE_PROJECT').click();

    cy.intercept('POST', `/api/admin/projects`).as('createProject');

    cy.get("[data-testid='PROJECT_ID_INPUT']").type(projectName);
    cy.get("[data-testid='FORM_NAME_INPUT']").type(projectName);
    cy.get("[id='stickiness-select']")
        .first()
        .click()
        .get(`[data-testid=SELECT_ITEM_ID-${defaultStickiness}`)
        .first()
        .click();
    cy.get("[data-testid='FORM_CREATE_BTN']").click();
    cy.wait('@createProject');
    return cy.visit(`/projects/${projectName}`);
};

export const createSegment_UI = (segmentName: string): Chainable<any> => {
    cy.get("[data-testid='NAVIGATE_TO_CREATE_SEGMENT']").click();

    cy.intercept('POST', '/api/admin/segments').as('createSegment');

    cy.get("[data-testid='SEGMENT_NAME_ID']")
        .should('be.visible')
        .type(segmentName);
    cy.get("[data-testid='SEGMENT_DESC_ID']").type('hello-world');
    cy.get("[data-testid='SEGMENT_NEXT_BTN_ID']").click();
    cy.get("[data-testid='SEGMENT_CREATE_BTN_ID']").click();
    return cy.wait('@createSegment');
};

export const deleteSegment_UI = (segmentName: string): Chainable<any> => {
    cy.get(`[data-testid='SEGMENT_DELETE_BTN_ID_${segmentName}']`).click();

    cy.get("[data-testid='SEGMENT_DIALOG_NAME_ID']").type(segmentName);
    return cy.get("[data-testid='DIALOGUE_CONFIRM_ID'").click();
};

export const addFlexibleRolloutStrategyToFeature_UI = (
    options: AddStrategyOptions,
): Chainable<any> => {
    const { featureToggleName, project, environment, stickiness } = options;
    const projectName = project || 'default';
    const env = environment || 'development';
    const defaultStickiness = stickiness || 'default';

    cy.visit(`/projects/${projectName}/features/${featureToggleName}`);

    cy.intercept(
        'POST',
        `/api/admin/projects/${projectName}/features/${featureToggleName}/environments/development/strategies`,
        (req) => {
            expect(req.body.name).to.equal('flexibleRollout');
            expect(req.body.parameters.groupId).to.equal(featureToggleName);
            expect(req.body.parameters.stickiness).to.equal(defaultStickiness);
            expect(req.body.parameters.rollout).to.equal('50');

            if (ENTERPRISE) {
                expect(req.body.constraints.length).to.equal(1);
            } else {
                expect(req.body.constraints.length).to.equal(0);
            }

            req.continue((res) => {
                strategyId = res.body.id;
            });
        },
    ).as('addStrategyToFeature');

    cy.visit(
        `/projects/${projectName}/features/${featureToggleName}/strategies/create?environmentId=${env}&strategyName=flexibleRollout`,
    );
    cy.get('[data-testid=FLEXIBLE_STRATEGY_STICKINESS_ID]').should(
        'be.visible',
    );
    if (ENTERPRISE) {
        cy.get('[data-testid=ADD_CONSTRAINT_ID]').click();
        cy.get('[data-testid=DIALOGUE_CONFIRM_ID]').click();
    }
    // this one needs to wait until the dropdown selector of stickiness is set, that's why waitForAnimations: true
    cy.get(`[data-testid=STRATEGY_FORM_SUBMIT_ID]`)
        .first()
        .click({ waitForAnimations: true });
    return cy.wait('@addStrategyToFeature');
};

export const updateFlexibleRolloutStrategy_UI = (
    featureToggleName: string,
    projectName?: string,
) => {
    const project = projectName || 'default';
    cy.visit(
        `/projects/${project}/features/${featureToggleName}/strategies/edit?environmentId=development&strategyId=${strategyId}`,
    );

    cy.get('[data-testid=FLEXIBLE_STRATEGY_STICKINESS_ID]')
        .should('be.visible')
        .first()
        .click()
        .get('[data-testid=SELECT_ITEM_ID-sessionId')
        .first()
        .click();

    cy.get('[data-testid=FLEXIBLE_STRATEGY_GROUP_ID]').should('be.visible');
    cy.get('[data-testid=FLEXIBLE_STRATEGY_GROUP_ID]')
        .first()
        .clear()
        .type('new-group-id');

    cy.intercept(
        'PUT',
        `/api/admin/projects/${project}/features/${featureToggleName}/environments/*/strategies/${strategyId}`,
        (req) => {
            expect(req.body.parameters.groupId).to.equal('new-group-id');
            expect(req.body.parameters.stickiness).to.equal('sessionId');
            expect(req.body.parameters.rollout).to.equal('50');

            if (ENTERPRISE) {
                expect(req.body.constraints.length).to.equal(1);
            } else {
                expect(req.body.constraints.length).to.equal(0);
            }

            req.continue((res) => {
                expect(res.statusCode).to.equal(200);
            });
        },
    ).as('updateStrategy');

    // this one needs to wait until the dropdown selector of stickiness is set, that's why waitForAnimations: true
    cy.get(`[data-testid=STRATEGY_FORM_SUBMIT_ID]`)
        .first()
        .click({ waitForAnimations: true });
    return cy.wait('@updateStrategy');
};

export const deleteFeatureStrategy_UI = (
    featureToggleName: string,
    shouldWait?: boolean,
    projectName?: string,
): Chainable<any> => {
    const project = projectName || 'default';

    cy.intercept(
        'DELETE',
        `/api/admin/projects/${project}/features/${featureToggleName}/environments/*/strategies/${strategyId}`,
        (req) => {
            req.continue((res) => {
                expect(res.statusCode).to.equal(200);
            });
        },
    ).as('deleteUserStrategy');
    cy.visit(`/projects/${project}/features/${featureToggleName}`);
    cy.get('[data-testid=FEATURE_ENVIRONMENT_ACCORDION_development]')
        .first()
        .click();
    cy.get('[data-testid=STRATEGY_REMOVE_MENU_BTN]').first().click();
    cy.get('[data-testid=STRATEGY_FORM_REMOVE_ID]').first().click();
    if (!shouldWait) return cy.get('[data-testid=DIALOGUE_CONFIRM_ID]').click();
    else cy.get('[data-testid=DIALOGUE_CONFIRM_ID]').click();
    return cy.wait('@deleteUserStrategy');
};

export const logout_UI = (): Chainable<any> => {
    return cy.visit('/logout');
};
