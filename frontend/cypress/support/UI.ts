///<reference path="../global.d.ts" />

import Chainable = Cypress.Chainable;
import AddStrategyOptions = Cypress.AddFlexibleRolloutStrategyOptions;
const AUTH_USER = Cypress.env('AUTH_USER');
const AUTH_PASSWORD = Cypress.env('AUTH_PASSWORD');
const ENTERPRISE = Boolean(Cypress.env('ENTERPRISE'));

let strategyId: string | undefined;

const disableActiveSplashScreens = () => {
    return cy.visit(`/splash/operators`);
};

const disableFeatureStrategiesProdGuard = () => {
    localStorage.setItem(
        'useFeatureStrategyProdGuardSettings:v2',
        JSON.stringify({ hide: true })
    );
};

export const runBefore = () => {
    disableFeatureStrategiesProdGuard();
    disableActiveSplashScreens();
};

export const login_UI = (
    user = AUTH_USER,
    password = AUTH_PASSWORD
): Chainable<any> => {
    return cy.session(user, () => {
        cy.visit('/');
        cy.wait(1500);
        cy.get("[data-testid='LOGIN_EMAIL_ID']").type(user);

        if (AUTH_PASSWORD) {
            cy.get("[data-testid='LOGIN_PASSWORD_ID']").type(password);
        }

        cy.get("[data-testid='LOGIN_BUTTON']").click();

        // Wait for the login redirect to complete.
        cy.get("[data-testid='HEADER_USER_AVATAR']");

        if (document.querySelector("[data-testid='CLOSE_SPLASH']")) {
            cy.get("[data-testid='CLOSE_SPLASH']").click();
        }
    });
};

export const createFeature_UI = (
    name: string,
    shouldWait?: boolean,
    project?: string
): Chainable<any> => {
    const projectName = project || 'default';

    cy.get('[data-testid=NAVIGATE_TO_CREATE_FEATURE').click();

    cy.intercept('POST', `/api/admin/projects/${projectName}/features`).as(
        'createFeature'
    );

    cy.wait(300);

    cy.get("[data-testid='CF_NAME_ID'").type(name);
    cy.get("[data-testid='CF_DESC_ID'").type('hello-world');
    if (!shouldWait) return cy.get("[data-testid='CF_CREATE_BTN_ID']").click();
    else cy.get("[data-testid='CF_CREATE_BTN_ID']").click();
    return cy.wait('@createFeature');
};

export const createProject_UI = (
    projectName: string,
    defaultStickiness: string
): Chainable<any> => {
    cy.get('[data-testid=NAVIGATE_TO_CREATE_PROJECT').click();

    cy.intercept('POST', `/api/admin/projects`).as('createProject');

    cy.get("[data-testid='PROJECT_ID_INPUT']").type(projectName);
    cy.get("[data-testid='PROJECT_NAME_INPUT']").type(projectName);
    cy.get("[id='stickiness-select']")
        .first()
        .click()
        .get(`[data-testid=SELECT_ITEM_ID-${defaultStickiness}`)
        .first()
        .click();
    cy.get("[data-testid='CREATE_PROJECT_BTN']").click();
    cy.wait('@createProject');
    return cy.visit(`/projects/${projectName}`);
};

export const createSegment_UI = (segmentName: string): Chainable<any> => {
    cy.get("[data-testid='NAVIGATE_TO_CREATE_SEGMENT']").click();

    cy.intercept('POST', '/api/admin/segments').as('createSegment');

    cy.get("[data-testid='SEGMENT_NAME_ID']").type(segmentName);
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
    options: AddStrategyOptions
): Chainable<any> => {
    const { featureToggleName, project, environment, stickiness } = options;
    const projectName = project || 'default';
    const env = environment || 'development';
    const defaultStickiness = stickiness || 'default';

    cy.visit(`/projects/default/features/${featureToggleName}`);

    cy.intercept(
        'POST',
        `/api/admin/projects/${projectName}/features/${featureToggleName}/environments/development/strategies`,
        req => {
            expect(req.body.name).to.equal('flexibleRollout');
            expect(req.body.parameters.groupId).to.equal(featureToggleName);
            expect(req.body.parameters.stickiness).to.equal(defaultStickiness);
            expect(req.body.parameters.rollout).to.equal('50');

            if (ENTERPRISE) {
                expect(req.body.constraints.length).to.equal(1);
            } else {
                expect(req.body.constraints.length).to.equal(0);
            }

            req.continue(res => {
                strategyId = res.body.id;
            });
        }
    ).as('addStrategyToFeature');

    cy.visit(
        `/projects/${projectName}/features/${featureToggleName}/strategies/create?environmentId=${env}&strategyName=flexibleRollout`
    );
    cy.wait(500);
    //  Takes a bit to load the screen - this will wait until it finds it or fail
    cy.get('[data-testid=FLEXIBLE_STRATEGY_STICKINESS_ID]');
    if (ENTERPRISE) {
        cy.get('[data-testid=ADD_CONSTRAINT_ID]').click();
        cy.get('[data-testid=DIALOGUE_CONFIRM_ID]').click();
    }
    cy.get(`[data-testid=STRATEGY_FORM_SUBMIT_ID]`).first().click();
    return cy.wait('@addStrategyToFeature');
};

export const updateFlexibleRolloutStrategy_UI = (
    featureToggleName: string,
    projectName?: string
) => {
    const project = projectName || 'default';
    cy.visit(
        `/projects/${project}/features/${featureToggleName}/strategies/edit?environmentId=development&strategyId=${strategyId}`
    );

    cy.wait(500);

    cy.get('[data-testid=FLEXIBLE_STRATEGY_STICKINESS_ID]')
        .first()
        .click()
        .get('[data-testid=SELECT_ITEM_ID-sessionId')
        .first()
        .click();

    cy.wait(500);
    cy.get('[data-testid=FLEXIBLE_STRATEGY_GROUP_ID]')
        .first()
        .clear()
        .type('new-group-id');

    cy.intercept(
        'PUT',
        `/api/admin/projects/${project}/features/${featureToggleName}/environments/*/strategies/${strategyId}`,
        req => {
            expect(req.body.parameters.groupId).to.equal('new-group-id');
            expect(req.body.parameters.stickiness).to.equal('sessionId');
            expect(req.body.parameters.rollout).to.equal('50');

            if (ENTERPRISE) {
                expect(req.body.constraints.length).to.equal(1);
            } else {
                expect(req.body.constraints.length).to.equal(0);
            }

            req.continue(res => {
                expect(res.statusCode).to.equal(200);
            });
        }
    ).as('updateStrategy');

    cy.get(`[data-testid=STRATEGY_FORM_SUBMIT_ID]`).first().click();
    return cy.wait('@updateStrategy');
};

export const deleteFeatureStrategy_UI = (
    featureToggleName: string,
    shouldWait?: boolean,
    projectName?: string
): Chainable<any> => {
    const project = projectName || 'default';

    cy.intercept(
        'DELETE',
        `/api/admin/projects/${project}/features/${featureToggleName}/environments/*/strategies/${strategyId}`,
        req => {
            req.continue(res => {
                expect(res.statusCode).to.equal(200);
            });
        }
    ).as('deleteUserStrategy');
    cy.visit(`/projects/${project}/features/${featureToggleName}`);
    cy.get('[data-testid=FEATURE_ENVIRONMENT_ACCORDION_development]').click();
    cy.get('[data-testid=STRATEGY_REMOVE_MENU_BTN]').first().click();
    cy.get('[data-testid=STRATEGY_FORM_REMOVE_ID]').first().click();
    if (!shouldWait) return cy.get('[data-testid=DIALOGUE_CONFIRM_ID]').click();
    else cy.get('[data-testid=DIALOGUE_CONFIRM_ID]').click();
    return cy.wait('@deleteUserStrategy');
};

export const addUserIdStrategyToFeature_UI = (
    featureToggleName: string,
    projectName: string
): Chainable<any> => {
    const project = projectName || 'default';
    cy.visit(
        `/projects/${project}/features/${featureToggleName}/strategies/create?environmentId=development&strategyName=userWithId`
    );

    if (ENTERPRISE) {
        cy.get('[data-testid=ADD_CONSTRAINT_ID]').click();
        cy.get('[data-testid=CONSTRAINT_AUTOCOMPLETE_ID]')
            .type('{downArrow}'.repeat(1))
            .type('{enter}');
        cy.get('[data-testid=DIALOGUE_CONFIRM_ID]').click();
    }

    cy.get('[data-testid=STRATEGY_INPUT_LIST]')
        .type('user1')
        .type('{enter}')
        .type('user2')
        .type('{enter}');
    cy.get('[data-testid=ADD_TO_STRATEGY_INPUT_LIST]').click();

    cy.intercept(
        'POST',
        `/api/admin/projects/default/features/${featureToggleName}/environments/*/strategies`,
        req => {
            expect(req.body.name).to.equal('userWithId');

            expect(req.body.parameters.userIds.length).to.equal(11);

            if (ENTERPRISE) {
                expect(req.body.constraints.length).to.equal(1);
            } else {
                expect(req.body.constraints.length).to.equal(0);
            }

            req.continue(res => {
                strategyId = res.body.id;
            });
        }
    ).as('addStrategyToFeature');

    cy.get(`[data-testid=STRATEGY_FORM_SUBMIT_ID]`).first().click();
    return cy.wait('@addStrategyToFeature');
};

export const addVariantsToFeature_UI = (
    featureToggleName: string,
    variants: Array<string>,
    projectName: string
) => {
    const project = projectName || 'default';
    cy.visit(`/projects/${project}/features/${featureToggleName}/variants`);
    cy.wait(1000);
    cy.intercept(
        'PATCH',
        `/api/admin/projects/${project}/features/${featureToggleName}/environments/development/variants`,
        req => {
            variants.forEach((variant, index) => {
                expect(req.body[index].op).to.equal('add');
                expect(req.body[index].path).to.equal(`/${index}`);
                expect(req.body[index].value.name).to.equal(variant);
                expect(req.body[index].value.weight).to.equal(
                    1000 / variants.length
                );
            });
        }
    ).as('variantCreation');

    cy.get('[data-testid=ADD_VARIANT_BUTTON]').first().click();
    cy.wait(500);
    variants.forEach((variant, index) => {
        cy.get('[data-testid=VARIANT_NAME_INPUT]').eq(index).type(variant);
        index + 1 < variants.length &&
            cy.get('[data-testid=MODAL_ADD_VARIANT_BUTTON]').first().click();
    });

    cy.get('[data-testid=DIALOGUE_CONFIRM_ID]').first().click();
    return cy.wait('@variantCreation');
};

export const deleteVariant_UI = (
    featureToggleName: string,
    variant: string,
    projectName?: string
): Chainable<any> => {
    const project = projectName || 'default';
    cy.visit(`/projects/${project}/features/${featureToggleName}/variants`);
    cy.get('[data-testid=EDIT_VARIANTS_BUTTON]').click();
    cy.wait(300);
    cy.get(`[data-testid=VARIANT_DELETE_BUTTON_${variant}]`).first().click();

    cy.intercept(
        'PATCH',
        `/api/admin/projects/${project}/features/${featureToggleName}/environments/development/variants`,
        req => {
            expect(req.body[0].op).to.equal('remove');
            expect(req.body[0].path).to.equal('/1');
            expect(req.body[1].op).to.equal('replace');
            expect(req.body[1].path).to.equal('/0/weight');
            expect(req.body[1].value).to.equal(1000);
        }
    ).as('delete');

    cy.get('[data-testid=DIALOGUE_CONFIRM_ID]').click();
    return cy.wait('@delete');
};

export const logout_UI = (): Chainable<any> => {
    return cy.visit('/logout');
};
